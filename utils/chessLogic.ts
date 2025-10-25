
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

const isOutOfBounds = (row: number, col: number) => row < 0 || row > 7 || col < 0 || col > 7;

export const getValidMoves = (piece: Piece, allPieces: Piece[]): Position[] => {
  if (piece.positions.length > 1) return []; // Quantum pieces can't move, they must be measured.

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
      if (!getPieceAt(row + direction, col)) {
        moves.push({ row: row + direction, col });
        // Double forward move
        if (!piece.hasMoved && !getPieceAt(row + 2 * direction, col)) {
          moves.push({ row: row + 2 * direction, col });
        }
      }
      // Captures
      [-1, 1].forEach(dc => {
        const capturePiece = getPieceAt(row + direction, col + dc);
        if (capturePiece && capturePiece.player !== player) {
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
