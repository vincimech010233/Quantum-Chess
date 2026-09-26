
import { Piece, PieceType, Player, Position } from '../types';

let idCounter = 0;

const createPiece = (player: Player, type: PieceType, row: number, col: number): Piece => ({
  id: idCounter++,
  player,
  type,
  positions: [{ row, col }],
  hasMoved: false,
});

export const getInitialBoard = (): Piece[] => {
  idCounter = 0;
  const pieces: Piece[] = [];

  // Pawns
  for (let i = 0; i < 8; i++) {
    pieces.push(createPiece(Player.Black, PieceType.Pawn, 1, i));
    pieces.push(createPiece(Player.White, PieceType.Pawn, 6, i));
  }

  // Rooks
  pieces.push(createPiece(Player.Black, PieceType.Rook, 0, 0));
  pieces.push(createPiece(Player.Black, PieceType.Rook, 0, 7));
  pieces.push(createPiece(Player.White, PieceType.Rook, 7, 0));
  pieces.push(createPiece(Player.White, PieceType.Rook, 7, 7));

  // Knights
  pieces.push(createPiece(Player.Black, PieceType.Knight, 0, 1));
  pieces.push(createPiece(Player.Black, PieceType.Knight, 0, 6));
  pieces.push(createPiece(Player.White, PieceType.Knight, 7, 1));
  pieces.push(createPiece(Player.White, PieceType.Knight, 7, 6));

  // Bishops
  pieces.push(createPiece(Player.Black, PieceType.Bishop, 0, 2));
  pieces.push(createPiece(Player.Black, PieceType.Bishop, 0, 5));
  pieces.push(createPiece(Player.White, PieceType.Bishop, 7, 2));
  pieces.push(createPiece(Player.White, PieceType.Bishop, 7, 5));

  // Queens
  pieces.push(createPiece(Player.Black, PieceType.Queen, 0, 3));
  pieces.push(createPiece(Player.White, PieceType.Queen, 7, 3));
  
  // Kings
  pieces.push(createPiece(Player.Black, PieceType.King, 0, 4));
  pieces.push(createPiece(Player.White, PieceType.King, 7, 4));

  return pieces;
};

export const isPositionEqual = (pos1: Position, pos2: Position): boolean => {
    return pos1.row === pos2.row && pos1.col === pos2.col;
}

export const BOARD_SIZE = 8;

export const isValidPosition = (position: Position): boolean =>
  !!position && Number.isInteger(position.row) && Number.isInteger(position.col) &&
  position.row >= 0 && position.row < BOARD_SIZE && position.col >= 0 && position.col < BOARD_SIZE;

/** A representable board has unique IDs and one occupant per in-bounds square.
 * A piece has one position, or two distinct positions in superposition (never a king).
 * Partial boards are allowed for fixtures; this does not enforce full chess rules.
 */
export const isValidBoard = (pieces: readonly Piece[]): boolean => {
  if (!Array.isArray(pieces)) return false;
  const ids = new Set<number>();
  const occupied = new Set<string>();
  for (const piece of pieces) {
    if (!piece || !Number.isInteger(piece.id) || piece.id < 0 || ids.has(piece.id) ||
        !Object.values(Player).includes(piece.player) || !Object.values(PieceType).includes(piece.type) ||
        typeof piece.hasMoved !== 'boolean' || !Array.isArray(piece.positions) ||
        piece.positions.length < 1 || piece.positions.length > 2 ||
        (piece.type === PieceType.King && piece.positions.length !== 1)) return false;
    ids.add(piece.id);
    for (const position of piece.positions) {
      if (!isValidPosition(position)) return false;
      const key = `${position.row},${position.col}`;
      if (occupied.has(key)) return false;
      occupied.add(key);
    }
  }
  return true;
};

const isOutOfBounds = (row: number, col: number) => !isValidPosition({ row, col });

export const getValidMoves = (piece: Piece, allPieces: Piece[]): Position[] => {
  if (!isValidBoard(allPieces) || !allPieces.includes(piece) || piece.positions.length !== 1) return [];

  const moves: Position[] = [];
  const { row, col } = piece.positions[0];
  const player = piece.player;

  const getPieceAt = (r: number, c: number) => 
      allPieces.find(p => p.positions.some(pos => pos.row === r && pos.col === c));

  const addLineMoves = (directions: number[][]) => {
    for (const [dr, dc] of directions) {
      for (let i = 1; i < 8; i++) {
        const newRow = row + i * dr;
        const newCol = col + i * dc;
        if (isOutOfBounds(newRow, newCol)) break;
        const blockingPiece = getPieceAt(newRow, newCol);
        if (blockingPiece) {
          if (blockingPiece.player !== player) moves.push({ row: newRow, col: newCol });
          break;
        }
        moves.push({ row: newRow, col: newCol });
      }
    }
  };

  switch (piece.type) {
    case PieceType.Pawn:
      const direction = player === Player.White ? -1 : 1;
      // Forward move
      if (!isOutOfBounds(row + direction, col) && !getPieceAt(row + direction, col)) {
        moves.push({ row: row + direction, col });
        // Double forward move
        const startingRow = player === Player.White ? 6 : 1;
        if (!piece.hasMoved && row === startingRow && !isOutOfBounds(row + 2 * direction, col) &&
            !getPieceAt(row + 2 * direction, col)) {
          moves.push({ row: row + 2 * direction, col });
        }
      }
      // Captures
      [-1, 1].forEach(dc => {
        const capturePiece = getPieceAt(row + direction, col + dc);
        if (!isOutOfBounds(row + direction, col + dc) && capturePiece && capturePiece.player !== player) {
          moves.push({ row: row + direction, col: col + dc });
        }
      });
      break;
    case PieceType.Rook:
      addLineMoves([[0, 1], [0, -1], [1, 0], [-1, 0]]);
      break;
    case PieceType.Knight:
      const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
      knightMoves.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        if (!isOutOfBounds(newRow, newCol)) {
          const blockingPiece = getPieceAt(newRow, newCol);
          if (!blockingPiece || blockingPiece.player !== player) {
            moves.push({ row: newRow, col: newCol });
          }
        }
      });
      break;
    case PieceType.Bishop:
      addLineMoves([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
      break;
    case PieceType.Queen:
      addLineMoves([[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]);
      break;
    case PieceType.King:
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const newRow = row + dr;
          const newCol = col + dc;
          if (!isOutOfBounds(newRow, newCol)) {
            const blockingPiece = getPieceAt(newRow, newCol);
            if (!blockingPiece || blockingPiece.player !== player) {
              moves.push({ row: newRow, col: newCol });
            }
          }
        }
      }
      break;
  }
  return moves;
};


/** Superposition is deliberately non-capturing: both destinations must be empty. */
export const getQuantumMoves = (piece: Piece, pieces: Piece[]): Position[] =>
  piece?.type === PieceType.King ? [] : getValidMoves(piece, pieces).filter(target =>
    !pieces.some(other => other.positions.some(position => isPositionEqual(position, target))));

/** Invalid transitions return the original board, without mutating it. Randomness
 * belongs to the caller: a capture of a quantum piece requires an explicit branch.
 */
export const movePiece = (pieces: Piece[], id: number, target: Position, collapseIndex?: number): Piece[] => {
  if (!isValidBoard(pieces) || !isValidPosition(target)) return pieces;
  const piece = pieces.find(candidate => candidate.id === id);
  if (!piece || !getValidMoves(piece, pieces).some(move => isPositionEqual(move, target))) return pieces;
  const occupant = pieces.find(candidate => candidate.positions.some(position => isPositionEqual(position, target)));
  let next = pieces;
  if (occupant) {
    if (occupant.player === piece.player) return pieces;
    if (occupant.positions.length === 2) {
      if (!Number.isInteger(collapseIndex) || collapseIndex! < 0 || collapseIndex! >= occupant.positions.length) return pieces;
      const finalPosition = occupant.positions[collapseIndex!];
      next = isPositionEqual(finalPosition, target)
        ? pieces.filter(candidate => candidate.id !== occupant.id)
        : pieces.map(candidate => candidate.id === occupant.id ? { ...candidate, positions: [{ ...finalPosition }] } : candidate);
    } else {
      next = pieces.filter(candidate => candidate.id !== occupant.id);
    }
  }
  next = next.map(candidate => candidate.id === id ? { ...candidate, positions: [{ ...target }], hasMoved: true } : candidate);
  return isValidBoard(next) ? next : pieces;
};

export const splitPiece = (pieces: Piece[], id: number, targets: Position[]): Piece[] => {
  if (!isValidBoard(pieces) || !Array.isArray(targets) || targets.length !== 2 ||
      !isValidPosition(targets[0]) || !isValidPosition(targets[1]) || isPositionEqual(targets[0], targets[1])) return pieces;
  const piece = pieces.find(candidate => candidate.id === id);
  if (!piece) return pieces;
  const valid = getQuantumMoves(piece, pieces);
  if (!targets.every(target => valid.some(move => isPositionEqual(move, target)))) return pieces;
  const next = pieces.map(candidate => candidate.id === id
    ? { ...candidate, positions: targets.map(target => ({ ...target })), hasMoved: true }
    : candidate);
  return isValidBoard(next) ? next : pieces;
};

export const measurePiece = (pieces: Piece[], id: number, positionIndex: number): Piece[] => {
  if (!isValidBoard(pieces)) return pieces;
  const piece = pieces.find(candidate => candidate.id === id);
  if (!piece || piece.positions.length !== 2 || !Number.isInteger(positionIndex) ||
      positionIndex < 0 || positionIndex >= piece.positions.length) return pieces;
  const next = pieces.map(candidate => candidate.id === id
    ? { ...candidate, positions: [{ ...candidate.positions[positionIndex] }] }
    : candidate);
  return isValidBoard(next) ? next : pieces;
};
