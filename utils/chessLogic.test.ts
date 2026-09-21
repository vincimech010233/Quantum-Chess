import { describe, expect, it } from 'vitest';
import { getInitialBoard, getValidMoves } from './chessLogic';
import { PieceType, Player } from '../types';

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
