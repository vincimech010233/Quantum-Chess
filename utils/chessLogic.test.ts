import { describe, expect, it } from 'vitest';
import { getInitialBoard, getValidMoves, isValidBoard, isValidPosition, movePiece, splitPiece, measurePiece, getQuantumMoves } from './chessLogic';
import { Piece, PieceType, Player } from '../types';

describe('chess logic', () => {
  it('creates the standard 32-piece starting position', () => {
    const board = getInitialBoard();

    expect(board).toHaveLength(32);
    expect(board.filter((piece) => piece.player === Player.White)).toHaveLength(16);
    expect(board.filter((piece) => piece.player === Player.Black)).toHaveLength(16);
  });

  it('allows a white pawn to move one or two squares initially', () => {
    const board = getInitialBoard();
    const pawn = board.find(
      (piece) => piece.player === Player.White && piece.type === PieceType.Pawn && piece.positions[0].col === 0,
    );

    expect(pawn).toBeDefined();
    expect(getValidMoves(pawn!, board)).toEqual([
      { row: 5, col: 0 },
      { row: 4, col: 0 },
    ]);
  });

  it('stops sliding pieces at the first occupied square', () => {
    const board = getInitialBoard();
    const rook = board.find(
      (piece) => piece.player === Player.White && piece.type === PieceType.Rook && piece.positions[0].col === 0,
    );

    expect(rook).toBeDefined();
    expect(getValidMoves(rook!, board)).toEqual([]);
  });

  it('does not move a piece already in superposition', () => {
    const board = getInitialBoard();
    const pawn = board.find((piece) => piece.type === PieceType.Pawn)!;
    pawn.positions = [{ row: 5, col: 0 }, { row: 4, col: 1 }];

    expect(getValidMoves(pawn, board)).toEqual([]);
  });
});

describe('pawn bounds regressions', () => {
  it.each([
    [Player.White, 0],
    [Player.Black, 7],
  ])('keeps a %s pawn at terminal row %i on the board', (player, row) => {
    const pawn = { id: 0, player, type: PieceType.Pawn, positions: [{ row, col: 3 }], hasMoved: true };
    expect(getValidMoves(pawn, [pawn])).toEqual([]);
  });
});

const makePiece = (id: number, type: PieceType, player: Player, row: number, col: number, hasMoved = false): Piece =>
  ({ id, type, player, positions: [{ row, col }], hasMoved });

function expectRepresentable(board: Piece[]) {
  expect(isValidBoard(board)).toBe(true);
  const positions = board.flatMap(piece => piece.positions);
  expect(positions.every(isValidPosition)).toBe(true);
  expect(new Set(positions.map(({ row, col }) => `${row},${col}`)).size).toBe(positions.length);
  expect(new Set(board.map(piece => piece.id)).size).toBe(board.length);
}

function freezeBoard(board: Piece[]): Piece[] {
  board.forEach(piece => {
    piece.positions.forEach(Object.freeze);
    Object.freeze(piece.positions);
    Object.freeze(piece);
  });
  Object.freeze(board);
  return board;
}

describe('pawn transitions', () => {
  it.each([[Player.White, 6, 5, 4], [Player.Black, 1, 2, 3]])(
    'moves %s pawns one or two squares from their starting rank', (player, row, single, double) => {
      const pawn = makePiece(0, PieceType.Pawn, player as Player, row as number, 3);
      const board = freezeBoard([pawn]);
      expect(getValidMoves(pawn, board)).toEqual([{ row: single, col: 3 }, { row: double, col: 3 }]);
      for (const targetRow of [single, double]) {
        const next = movePiece(board, 0, { row: targetRow as number, col: 3 });
        expect(next[0].positions).toEqual([{ row: targetRow, col: 3 }]);
        expect(next[0].hasMoved).toBe(true);
        expectRepresentable(next);
      }
      expect(pawn.positions).toEqual([{ row, col: 3 }]);
    },
  );

  it.each([[Player.White, 4, 3], [Player.Black, 3, 4]])('does not double-step %s off its starting rank', (player, row, nextRow) => {
    const pawn = makePiece(0, PieceType.Pawn, player as Player, row as number, 3);
    expect(getValidMoves(pawn, [pawn])).toEqual([{ row: nextRow, col: 3 }]);
  });

  it('does not double-step an already moved pawn or jump over another piece', () => {
    const pawn = makePiece(0, PieceType.Pawn, Player.White, 6, 3, true);
    expect(getValidMoves(pawn, [pawn])).toEqual([{ row: 5, col: 3 }]);
    pawn.hasMoved = false;
    const blocker = makePiece(1, PieceType.Knight, Player.Black, 5, 3);
    expect(getValidMoves(pawn, [pawn, blocker])).toEqual([]);
  });

  it.each([[Player.White, 4, 3], [Player.Black, 3, 4]])('captures diagonally with a %s pawn and removes the enemy', (player, row, nextRow) => {
    const pawn = makePiece(0, PieceType.Pawn, player as Player, row as number, 3, true);
    const enemy = makePiece(1, PieceType.Rook, player === Player.White ? Player.Black : Player.White, nextRow as number, 4);
    const board = freezeBoard([pawn, enemy]);
    const next = movePiece(board, 0, { row: nextRow as number, col: 4 });
    expect(next.map(piece => piece.id)).toEqual([0]);
    expect(next[0].positions).toEqual([{ row: nextRow, col: 4 }]);
    expectRepresentable(next);
    expect(movePiece([pawn], 0, { row: nextRow as number, col: 4 })).toEqual([pawn]);
  });

  it.each([[Player.White, 0, -1], [Player.Black, 7, 8]])('rejects an out-of-board transition by %s', (player, row, targetRow) => {
    const board = freezeBoard([makePiece(0, PieceType.Pawn, player as Player, row as number, 3, true)]);
    expect(movePiece(board, 0, { row: targetRow as number, col: 3 })).toBe(board);
    expectRepresentable(board);
  });
});

describe('state invariants and ordinary captures', () => {
  it('creates unique, in-bounds starting pieces on every reset', () => {
    expectRepresentable(getInitialBoard());
    expect(getInitialBoard()).toEqual(getInitialBoard());
  });

  it('moves to an empty square without changing other pieces or input', () => {
    const board = freezeBoard([makePiece(0, PieceType.Rook, Player.White, 4, 4), makePiece(1, PieceType.Knight, Player.Black, 1, 1)]);
    const target = { row: 4, col: 5 };
    const next = movePiece(board, 0, target);
    target.col = 99;
    expect(next[0].positions).toEqual([{ row: 4, col: 5 }]);
    expect(next[1]).toBe(board[1]);
    expect(board[0].positions).toEqual([{ row: 4, col: 4 }]);
    expectRepresentable(next);
  });

  it('captures the first enemy on a ray and cannot jump beyond it', () => {
    const rook = makePiece(0, PieceType.Rook, Player.White, 4, 4);
    const enemy = makePiece(1, PieceType.Bishop, Player.Black, 4, 6);
    const board = freezeBoard([rook, enemy]);
    expect(getValidMoves(rook, board)).toContainEqual({ row: 4, col: 6 });
    expect(getValidMoves(rook, board)).not.toContainEqual({ row: 4, col: 7 });
    expect(movePiece(board, 0, { row: 4, col: 7 })).toBe(board);
    const next = movePiece(board, 0, { row: 4, col: 6 });
    expect(next).toHaveLength(1);
    expect(next.find(piece => piece.id === enemy.id)).toBeUndefined();
    expect(next[0].positions).toEqual([{ row: 4, col: 6 }]);
    expectRepresentable(next);
  });

  it('rejects a friendly occupant and blocks squares beyond it', () => {
    const board = freezeBoard([makePiece(0, PieceType.Rook, Player.White, 4, 4), makePiece(1, PieceType.Pawn, Player.White, 4, 6)]);
    expect(getValidMoves(board[0], board)).not.toContainEqual({ row: 4, col: 6 });
    expect(getValidMoves(board[0], board)).not.toContainEqual({ row: 4, col: 7 });
    expect(movePiece(board, 0, { row: 4, col: 6 })).toBe(board);
  });

  it.each([{ row: -1, col: 0 }, { row: 8, col: 0 }, { row: 0, col: -1 }, { row: 0, col: 8 }, { row: 1.5, col: 0 }, { row: NaN, col: 0 }])(
    'rejects invalid coordinates %j without changing the state', target => {
      const board = freezeBoard([makePiece(0, PieceType.Queen, Player.White, 3, 3)]);
      expect(movePiece(board, 0, target)).toBe(board);
      expect(splitPiece(board, 0, [target, { row: 3, col: 4 }])).toBe(board);
    },
  );

  it('rejects illegal geometry, missing IDs, no-op moves and stale pieces', () => {
    const board = freezeBoard([makePiece(0, PieceType.Rook, Player.White, 4, 4)]);
    expect(movePiece(board, 0, { row: 5, col: 5 })).toBe(board);
    expect(movePiece(board, 0, { row: 4, col: 4 })).toBe(board);
    expect(movePiece(board, 99, { row: 4, col: 5 })).toBe(board);
    expect(getValidMoves({ ...board[0], positions: [{ row: 2, col: 2 }] }, board)).toEqual([]);
    expect(splitPiece(board, 99, [{ row: 4, col: 5 }, { row: 4, col: 6 }])).toBe(board);
    expect(measurePiece(board, 99, 0)).toBe(board);
  });

  it('rejects malformed boards instead of making them worse', () => {
    const piece = makePiece(0, PieceType.Rook, Player.White, 4, 4);
    const boards: Piece[][] = [
      [piece, { ...piece, positions: [{ row: 3, col: 3 }] }],
      [piece, { ...piece, id: 1 }],
      [{ ...piece, positions: [] }],
      [{ ...piece, positions: [{ row: -1, col: 4 }] }],
      [{ ...piece, positions: [{ row: 4, col: 4 }, { row: 4, col: 4 }] }],
      [{ ...piece, positions: [{ row: 4, col: 4 }, { row: 4, col: 5 }, { row: 4, col: 6 }] }],
      [{ ...piece, type: PieceType.King, positions: [{ row: 4, col: 4 }, { row: 4, col: 5 }] }],
    ];
    for (const board of boards) {
      freezeBoard(board);
      expect(isValidBoard(board)).toBe(false);
      expect(getValidMoves(board[0], board)).toEqual([]);
      expect(movePiece(board, 0, { row: 4, col: 5 })).toBe(board);
      expect(splitPiece(board, 0, [{ row: 4, col: 5 }, { row: 4, col: 6 }])).toBe(board);
      expect(measurePiece(board, 0, 0)).toBe(board);
    }
  });

  it('keeps every generated move and transition in bounds for all piece types on all 64 squares', () => {
    for (const type of Object.values(PieceType)) for (const player of Object.values(Player)) {
      for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
        const piece = makePiece(0, type, player, row, col);
        const board = [piece];
        for (const target of getValidMoves(piece, board)) {
          expect(isValidPosition(target)).toBe(true);
          const next = movePiece(board, 0, target);
          expect(next).not.toBe(board);
          expectRepresentable(next);
        }
      }
    }
  });
});

describe('superposition and measurement', () => {
  it('splits to two distinct empty squares and then measures either branch', () => {
    const board = freezeBoard([makePiece(0, PieceType.Rook, Player.White, 4, 4)]);
    const targets = [{ row: 4, col: 5 }, { row: 4, col: 6 }];
    const next = splitPiece(board, 0, targets);
    expect(next[0].positions).toEqual(targets);
    expect(next[0].hasMoved).toBe(true);
    expectRepresentable(next);
    expect(getValidMoves(next[0], next)).toEqual([]);
    expect(movePiece(next, 0, { row: 4, col: 7 })).toBe(next);
    for (const index of [0, 1]) {
      const measured = measurePiece(next, 0, index);
      expect(measured[0].positions).toEqual([targets[index]]);
      expectRepresentable(measured);
    }
    targets[0].row = 99;
    expectRepresentable(next);
  });

  it.each([Player.White, Player.Black])('rejects quantum targets occupied by %s and never overlaps pieces', player => {
    const board = freezeBoard([makePiece(0, PieceType.Rook, Player.White, 4, 4), makePiece(1, PieceType.Pawn, player, 4, 6)]);
    expect(getQuantumMoves(board[0], board)).not.toContainEqual({ row: 4, col: 6 });
    expect(splitPiece(board, 0, [{ row: 4, col: 5 }, { row: 4, col: 6 }])).toBe(board);
    expectRepresentable(board);
  });

  it('rejects sparse target arrays without throwing or changing the board', () => {
    const board = freezeBoard([makePiece(0, PieceType.Rook, Player.White, 4, 4)]);
    const empty = Array(2);
    const missingSecond = Array(2);
    missingSecond[0] = { row: 4, col: 5 };
    for (const targets of [empty, missingSecond]) expect(splitPiece(board, 0, targets)).toBe(board);
  });

  it('rejects repeated, incomplete or illegal quantum targets and kings', () => {
    const board = freezeBoard([makePiece(0, PieceType.Rook, Player.White, 4, 4)]);
    expect(splitPiece(board, 0, [{ row: 4, col: 5 }, { row: 4, col: 5 }])).toBe(board);
    expect(splitPiece(board, 0, [{ row: 4, col: 5 }])).toBe(board);
    expect(splitPiece(board, 0, [{ row: 4, col: 5 }, { row: 5, col: 5 }])).toBe(board);
    const kingBoard = [makePiece(1, PieceType.King, Player.White, 4, 4)];
    expect(splitPiece(kingBoard, 1, [{ row: 4, col: 5 }, { row: 5, col: 5 }])).toBe(kingBoard);
  });

  it.each([0, 1])('handles quantum capture outcome %i with no overlapping survivors', branch => {
    const rook = makePiece(0, PieceType.Rook, Player.White, 4, 4);
    const enemy = { ...makePiece(1, PieceType.Knight, Player.Black, 4, 6), positions: [{ row: 4, col: 6 }, { row: 2, col: 6 }] };
    const board = freezeBoard([rook, enemy]);
    const next = movePiece(board, 0, { row: 4, col: 6 }, branch);
    expect(next[0].positions).toEqual([{ row: 4, col: 6 }]);
    if (branch === 0) expect(next.map(piece => piece.id)).toEqual([0]);
    else expect(next.find(piece => piece.id === 1)?.positions).toEqual([{ row: 2, col: 6 }]);
    expectRepresentable(next);
    expect(board[1].positions).toHaveLength(2);
  });

  it('requires a valid explicit branch and rejects measurement of classical pieces', () => {
    const board = freezeBoard([
      makePiece(0, PieceType.Rook, Player.White, 4, 4),
      { ...makePiece(1, PieceType.Knight, Player.Black, 4, 6), positions: [{ row: 4, col: 6 }, { row: 2, col: 6 }] },
    ]);
    for (const index of [-1, 2, 0.5, NaN]) {
      expect(movePiece(board, 0, { row: 4, col: 6 }, index)).toBe(board);
      expect(measurePiece(board, 1, index)).toBe(board);
    }
    expect(movePiece(board, 0, { row: 4, col: 6 })).toBe(board);
    expect(measurePiece(board, 0, 0)).toBe(board);
  });

  it('preserves invariants through deterministic mixed transition sequences', () => {
    let board = getInitialBoard();
    for (let step = 0; step < 80; step++) {
      const player = step % 2 === 0 ? Player.White : Player.Black;
      const quantum = board.find(piece => piece.player === player && piece.positions.length === 2);
      if (quantum) board = measurePiece(board, quantum.id, step % 2);
      else {
        const piece = board.find(candidate => candidate.player === player && getValidMoves(candidate, board).length > 0);
        if (!piece) break;
        const targets = getQuantumMoves(piece, board);
        if (step % 3 === 0 && targets.length >= 2) board = splitPiece(board, piece.id, targets.slice(0, 2));
        else {
          const moves = getValidMoves(piece, board);
          board = movePiece(board, piece.id, moves[step % moves.length], step % 2);
        }
      }
      expectRepresentable(board);
    }
  });
});
