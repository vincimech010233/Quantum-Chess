export enum Player {
  White = 'w',
  Black = 'b',
}

export enum PieceType {
  Pawn = 'p',
  Rook = 'r',
  Knight = 'n',
  Bishop = 'b',
  Queen = 'q',
  King = 'k',
}

export interface Position {
  row: number;
  col: number;
}

export interface Piece {
  id: number;
  player: Player;
  type: PieceType;
  positions: Position[];
  hasMoved: boolean;
}

export interface CollapseAnimation {
  piece: Piece;
  from: Position[];
  to: Position;
}
