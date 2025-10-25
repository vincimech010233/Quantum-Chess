import React from 'react';
import { PieceType, Player } from '../types';

interface ChessPieceProps {
  type: PieceType;
  player: Player;
  isQuantum: boolean;
  animationClass?: string;
}

const pieceColor = (player: Player) => player === Player.White ? '#F0D9B5' : '#4A4A4A';
const strokeColor = (player: Player) => player === Player.White ? '#8B4513' : '#222222';

const King: React.FC<{ player: Player }> = ({ player }) => (
    <svg viewBox="0 0 45 45" className="w-full h-full">
        <g fill={pieceColor(player)} stroke={strokeColor(player)} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 18,14 L 18,7 L 22.5,10 L 27,7 L 27,14" />
            <path d="M 22.5,25 C 19.5,25 18.5,27.5 18.5,27.5 C 18.5,29.5 20.5,31 22.5,31 C 24.5,31 26.5,29.5 26.5,27.5 C 26.5,27.5 25.5,25 22.5,25" />
            <path d="M 11.5,37 C 17.5,40.5 27.5,40.5 33.5,37 L 33.5,34 C 33.5,34 27.5,35.5 22.5,35.5 C 17.5,35.5 11.5,34 11.5,34 L 11.5,37 Z" />
            <path d="M 22.5,14 C 25.5,14 27.5,16.5 27.5,19.5 C 27.5,22.5 25.5,25 22.5,25 C 19.5,25 17.5,22.5 17.5,19.5 C 17.5,16.5 19.5,14 22.5,14" />
        </g>
    </svg>
);

const Queen: React.FC<{ player: Player }> = ({ player }) => (
    <svg viewBox="0 0 45 45" className="w-full h-full">
        <g fill={pieceColor(player)} stroke={strokeColor(player)} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 22.5,25 C 19.5,25 18.5,27.5 18.5,27.5 C 18.5,29.5 20.5,31 22.5,31 C 24.5,31 26.5,29.5 26.5,27.5 C 26.5,27.5 25.5,25 22.5,25" />
            <path d="M 11.5,37 C 17.5,40.5 27.5,40.5 33.5,37 L 33.5,34 C 33.5,34 27.5,35.5 22.5,35.5 C 17.5,35.5 11.5,34 11.5,34 L 11.5,37 Z" />
            <path d="M 22.5,13 C 25.5,13 27.5,15.5 27.5,18.5 C 27.5,21.5 25.5,25 22.5,25 C 19.5,25 17.5,21.5 17.5,18.5 C 17.5,15.5 19.5,13 22.5,13" />
            <circle cx="13.5" cy="11" r="1.5" />
            <circle cx="18" cy="9" r="1.5" />
            <circle cx="22.5" cy="8" r="1.5" />
            <circle cx="27" cy="9" r="1.5" />
            <circle cx="31.5" cy="11" r="1.5" />
        </g>
    </svg>
);
const Rook: React.FC<{ player: Player }> = ({ player }) => (
    <svg viewBox="0 0 45 45" className="w-full h-full">
        <g fill={pieceColor(player)} stroke={strokeColor(player)} strokeWidth="1.5" strokeLinejoin="round">
            <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5l-3 4H14l-3-4z" />
            <path d="M31 18v13H14V18h17z" />
            <path d="M14 32h17" strokeLinecap="butt" />
        </g>
    </svg>
);
const Bishop: React.FC<{ player: Player }> = ({ player }) => (
    <svg viewBox="0 0 45 45" className="w-full h-full">
        <g fill={pieceColor(player)} stroke={strokeColor(player)} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 36h27v-4H9v4zm6-4l7.5-10 7.5 10H15z" />
            <path d="M22.5 22V15.5" />
            <path d="M22.5 15.5c2.5 0 5-2.5 5-5s-2.5-5-5-5-5 2.5-5 5 2.5 5 5 5z" />
            <path d="M24.5 10.5c0 .5-.5 1.5-1 1.5s-1-1-1-1.5l1-2 1 2z" transform="translate(0, -2)" strokeWidth="1" />
        </g>
    </svg>
);
const Knight: React.FC<{ player: Player }> = ({ player }) => (
    <svg viewBox="0 0 45 45" className="w-full h-full">
        <g fill={pieceColor(player)} stroke={strokeColor(player)} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 22,10 c 1.5,0 1.5,2 1.5,2 0,2-1.5,2.5-1.5,2.5 C 20.5,13 20.5,10 22,10" />
            <path d="m 9,36 c 0,0 2.5,1.5 5,1.5 2.5,0 5-1.5 5-1.5 0,0 2.5,1.5 5,1.5 2.5,0 5-1.5 5-1.5" />
            <path d="m 9,36 v -3 c 0,0 2.5,1.5 5,1.5 2.5,0 5-1.5 5-1.5 0,0 2.5,1.5 5,1.5 2.5,0 5-1.5 5-1.5 v 3" />
            <path d="m 12,30 c 0,0 2.5-0.5 4.5-0.5 2.5,0 4.5,0.5 4.5,0.5" />
            <path d="M 31,25 C 31,16 25,14 22.5,10" />
            <path d="M 25,12 C 29,12 31,11 31,7" />
            <path d="M 25,12 C 25,18 20,26 20,26" />
            <path d="M 20,26 C 18,28 15,29 12,29 C 8,29 6,27 6,24 C 6,21 8,19 11,19 C 14,19 16,21 17,23" />
        </g>
    </svg>
);
const Pawn: React.FC<{ player: Player }> = ({ player }) => (
    <svg viewBox="0 0 45 45" className="w-full h-full">
        <g fill={pieceColor(player)} stroke={strokeColor(player)} strokeWidth="1.5" strokeLinejoin="round">
            <path d="M22.5 9c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5-4.5-2-4.5-4.5 2-4.5 4.5-4.5z" />
            <path d="M22.5 18v8" />
            <path d="M15 26h15" />
            <path d="M11.5 37h22v-6h-22v6z" />
        </g>
    </svg>
);

const pieceMap: Record<PieceType, React.FC<{ player: Player }>> = {
  [PieceType.King]: King,
  [PieceType.Queen]: Queen,
  [PieceType.Rook]: Rook,
  [PieceType.Bishop]: Bishop,
  [PieceType.Knight]: Knight,
  [PieceType.Pawn]: Pawn,
};


const ChessPiece: React.FC<ChessPieceProps> = ({ type, player, isQuantum, animationClass }) => {
  const PieceComponent = pieceMap[type];
  const quantumClasses = isQuantum ? 'animate-quantum-flicker' : '';
  
  return (
    <div className={`w-full h-full cursor-pointer p-1 ${quantumClasses} ${animationClass || ''}`}>
      <PieceComponent player={player} />
    </div>
  );
};

export default ChessPiece;