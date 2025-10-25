import React from 'react';
import { Piece, Position, CollapseAnimation } from '../types';
import { isPositionEqual } from '../utils/chessLogic';
import Square from './Square';
import ChessPiece from './ChessPiece';

interface BoardProps {
  pieces: Piece[];
  selectedPieceId: number | null;
  possibleMoves: Position[];
  quantumTargets: Position[];
  collapseAnimation: CollapseAnimation | null;
  onSquareClick: (row: number, col: number) => void;
}

const Board: React.FC<BoardProps> = ({ pieces, selectedPieceId, possibleMoves, quantumTargets, collapseAnimation, onSquareClick }) => {
  const piecesToRender = collapseAnimation 
    ? pieces.filter(p => p.id !== collapseAnimation.piece.id) 
    : pieces;

  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  piecesToRender.forEach(p => {
    p.positions.forEach(pos => {
        board[pos.row][pos.col] = p;
    });
  });

  const selectedPiece = pieces.find(p => p.id === selectedPieceId);

  return (
    <div className="w-[80vmin] h-[80vmin] max-w-[700px] max-h-[700px] bg-[#8B4513] p-2 md:p-4 rounded-md shadow-2xl relative">
      <div className="w-full h-full grid grid-cols-8 grid-rows-8 shadow-inner">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isLight = (rowIndex + colIndex) % 2 !== 0;
            const currentPos = { row: rowIndex, col: colIndex };
            const isSelected = selectedPiece && !collapseAnimation ? selectedPiece.positions.some(p => isPositionEqual(p, currentPos)) : false;
            const isPossibleMove = possibleMoves.some(p => isPositionEqual(p, currentPos));
            const isQuantumTarget = quantumTargets.some(p => isPositionEqual(p, currentPos));

            return (
              <Square
                key={`${rowIndex}-${colIndex}`}
                row={rowIndex}
                col={colIndex}
                piece={piece}
                isLight={isLight}
                isSelected={isSelected}
                isPossibleMove={isPossibleMove}
                isQuantumTarget={isQuantumTarget}
                onClick={onSquareClick}
              />
            );
          })
        )}
      </div>
       {collapseAnimation && (
        <div className="absolute inset-0 p-2 md:p-4 pointer-events-none">
          {collapseAnimation.from.map((pos, index) => {
            const isFinal = isPositionEqual(pos, collapseAnimation.to);
            const animationClass = isFinal ? 'animate-collapse-land' : 'animate-collapse-fade-out';
            return (
              <div
                key={index}
                className="absolute w-[calc(12.5%-4px)] h-[calc(12.5%-4px)]"
                style={{
                  top: `calc(${pos.row * 12.5}% + 2px)`,
                  left: `calc(${pos.col * 12.5}% + 2px)`,
                }}
              >
                <ChessPiece
                  type={collapseAnimation.piece.type}
                  player={collapseAnimation.piece.player}
                  isQuantum={false}
                  animationClass={animationClass}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Board;
