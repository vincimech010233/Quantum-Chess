import React from 'react';
import { Piece, Position } from '../types';
import ChessPiece from './ChessPiece';

interface SquareProps {
  row: number;
  col: number;
  piece: Piece | null;
  isLight: boolean;
  isSelected: boolean;
  isPossibleMove: boolean;
  isQuantumTarget: boolean;
  onClick: (row: number, col: number) => void;
}

const Square: React.FC<SquareProps> = ({ row, col, piece, isLight, isSelected, isPossibleMove, isQuantumTarget, onClick }) => {
  const bgClass = isLight ? 'bg-[#F0D9B5]' : 'bg-[#B58863]';
  const selectedClass = isSelected ? 'bg-green-500/50' : '';
  const isQuantum = piece ? piece.positions.length > 1 : false;

  return (
    <div
      className={`w-full h-full flex justify-center items-center relative ${bgClass}`}
      onClick={() => onClick(row, col)}
    >
      <div className={`absolute inset-0 transition-colors duration-200 ${selectedClass}`}></div>
       {isPossibleMove && (
        <div className="absolute w-1/3 h-1/3 bg-green-500/50 rounded-full z-10 pointer-events-none"></div>
      )}
      {isQuantumTarget && (
        <div className="absolute w-1/3 h-1/3 bg-cyan-400/70 rounded-full z-10 pointer-events-none animate-pulse"></div>
      )}
      {piece && (
        <div className="relative w-full h-full z-20">
          <ChessPiece type={piece.type} player={piece.player} isQuantum={isQuantum} />
        </div>
      )}
    </div>
  );
};

export default Square;