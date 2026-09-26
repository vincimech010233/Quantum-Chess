import React, { useState, useEffect, useRef } from 'react';
import Board from './components/Board';
import { Piece, PieceType, Player, Position, CollapseAnimation } from './types';
import { getInitialBoard, getValidMoves, getQuantumMoves, isPositionEqual, movePiece, splitPiece, measurePiece } from './utils/chessLogic';

const App: React.FC = () => {
  const [pieces, setPieces] = useState<Piece[]>(getInitialBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.White);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [isQuantumMode, setIsQuantumMode] = useState(false);
  const [quantumTargets, setQuantumTargets] = useState<Position[]>([]);
  const [message, setMessage] = useState("White's turn to move.");
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [collapseAnimation, setCollapseAnimation] = useState<CollapseAnimation | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const pendingAnimation = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (pendingAnimation.current !== null) clearTimeout(pendingAnimation.current);
  }, []);

  const clearSelection = () => {
    setSelectedPieceId(null);
    setIsQuantumMode(false);
    setQuantumTargets([]);
  };

  const resetGame = () => {
    // An old measurement must never overwrite a newly reset game or switch its turn.
    if (pendingAnimation.current !== null) clearTimeout(pendingAnimation.current);
    pendingAnimation.current = null;
    setPieces(getInitialBoard());
    setCurrentPlayer(Player.White);
    clearSelection();
    setMessage("White's turn to move.");
    setGameOver(null);
    setCollapseAnimation(null);
    setIsAnimating(false);
  };

  const selectedPiece = pieces.find(piece => piece.id === selectedPieceId);
  const possibleMoves = selectedPiece
    ? (isQuantumMode ? getQuantumMoves(selectedPiece, pieces) : getValidMoves(selectedPiece, pieces))
    : [];

  const finishMove = (next: Piece[]) => {
    if (next === pieces) return;
    const capturedKing = pieces.find(piece => piece.type === PieceType.King && !next.some(other => other.id === piece.id));
    setPieces(next);
    clearSelection();
    if (capturedKing) {
      const winner = currentPlayer === Player.White ? 'White' : 'Black';
      setGameOver(`${winner} wins by capturing the King!`);
      setMessage(`${winner} wins!`);
    } else {
      const nextPlayer = currentPlayer === Player.White ? Player.Black : Player.White;
      setCurrentPlayer(nextPlayer);
      setMessage(`${nextPlayer === Player.White ? 'White' : 'Black'}'s turn to move.`);
    }
  };

  const animateTransition = (piece: Piece, to: Position, next: Piece[]) => {
    if (next === pieces) return;
    setIsAnimating(true);
    setCollapseAnimation({ piece, from: piece.positions, to });
    clearSelection();
    pendingAnimation.current = setTimeout(() => {
      pendingAnimation.current = null;
      finishMove(next);
      setCollapseAnimation(null);
      setIsAnimating(false);
    }, 800);
  };

  const handleSquareClick = (row: number, col: number) => {
    if (gameOver || isAnimating) return;
    const target = { row, col };
    const occupant = pieces.find(piece => piece.positions.some(position => isPositionEqual(position, target)));
    if (selectedPiece) {
      if (!possibleMoves.some(move => isPositionEqual(move, target))) {
        clearSelection();
        return;
      }
      if (isQuantumMode) {
        if (quantumTargets.some(position => isPositionEqual(position, target))) return;
        const targets = [...quantumTargets, target];
        if (targets.length === 2) finishMove(splitPiece(pieces, selectedPiece.id, targets));
        else setQuantumTargets(targets);
      } else {
        const branch = occupant?.positions.length === 2 ? Math.floor(Math.random() * 2) : undefined;
        const next = movePiece(pieces, selectedPiece.id, target, branch);
        if (occupant && branch !== undefined) animateTransition(occupant, occupant.positions[branch], next);
        else finishMove(next);
      }
    } else if (occupant?.player === currentPlayer) {
      if (occupant.positions.length === 2) {
        const branch = Math.floor(Math.random() * 2);
        animateTransition(occupant, occupant.positions[branch], measurePiece(pieces, occupant.id, branch));
      } else {
        setSelectedPieceId(occupant.id);
      }
    }
  };

  const toggleQuantumMode = () => {
    if (selectedPiece && selectedPiece.type !== PieceType.King && !gameOver && !isAnimating) {
      setIsQuantumMode(mode => !mode);
      setQuantumTargets([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-8 p-4 font-sans bg-[#2C2F33]">
        <div className="flex-grow flex items-center justify-center">
            <Board
                pieces={pieces}
                selectedPieceId={selectedPieceId}
                possibleMoves={possibleMoves}
                quantumTargets={quantumTargets}
                collapseAnimation={collapseAnimation}
                onSquareClick={handleSquareClick}
            />
        </div>
      <div className="w-full md:w-80 bg-[#36393F] p-6 rounded-lg shadow-2xl flex flex-col gap-4 text-center">
        <h1 className="text-4xl font-bold text-cyan-400 drop-shadow-[0_0_5px_#00ffff]">Quantum Chess</h1>
        <div className="w-full h-px bg-[#4F545C] my-2"></div>
        <div className="bg-[#2C2F33] p-4 rounded-lg min-h-[80px] flex items-center justify-center">
            <p className="text-lg font-semibold text-gray-200">
                {gameOver ? <span className="text-green-400">{gameOver}</span> : message}
            </p>
        </div>
        <button
          onClick={toggleQuantumMode}
          disabled={!selectedPiece || selectedPiece.type === PieceType.King || isAnimating || !!gameOver}
          className={`w-full py-3 px-4 rounded-lg text-lg font-bold transition-all duration-300
            ${isQuantumMode 
                ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(0,255,255,0.7)]' 
                : 'bg-[#5865F2] hover:bg-[#4752C4] text-gray-100'}
            disabled:bg-[#4F545C] disabled:text-gray-400 disabled:cursor-not-allowed`}
        >
          {isQuantumMode ? (quantumTargets.length === 0 ? 'Select 1st Target' : 'Select 2nd Target') : 'Quantum Move'}
        </button>
        <button
          onClick={resetGame}
          className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 rounded-lg text-lg font-bold transition-colors duration-200"
        >
          Reset Game
        </button>
        <div className="text-sm text-gray-400 mt-4">
            <h3 className="font-bold text-base text-gray-200 mb-2">How to Play:</h3>
            <ul className="list-disc list-inside text-left space-y-1">
                <li>Select a piece to see its moves.</li>
                <li>To perform a Quantum Move, select a piece, press the button, then select two distinct, empty destination squares. The piece will enter a superposition.</li>
                <li>Kings cannot enter superposition. Quantum moves do not capture.</li>
                <li>Clicking your own quantum piece measures it, collapsing it to one position and ending your turn.</li>
                <li>Attacking a quantum piece forces a measurement. The outcome is probabilistic!</li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
