import React, { useState, useCallback, useEffect } from 'react';
import Board from './components/Board';
import { Piece, PieceType, Player, Position, CollapseAnimation } from './types';
import { getInitialBoard, getValidMoves, isPositionEqual } from './utils/chessLogic';

const App: React.FC = () => {
  const [pieces, setPieces] = useState<Piece[]>(getInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.White);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [isQuantumMode, setIsQuantumMode] = useState<boolean>(false);
  const [quantumTargets, setQuantumTargets] = useState<Position[]>([]);
  const [message, setMessage] = useState<string>("White's turn to move.");
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [collapseAnimation, setCollapseAnimation] = useState<CollapseAnimation | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const resetGame = () => {
    setPieces(getInitialBoard());
    setCurrentPlayer(Player.White);
    setSelectedPieceId(null);
    setPossibleMoves([]);
    setIsQuantumMode(false);
    setQuantumTargets([]);
    setMessage("White's turn to move.");
    setGameOver(null);
    setCollapseAnimation(null);
    setIsAnimating(false);
  };

  const switchPlayer = useCallback(() => {
    setCurrentPlayer(prev => {
        const nextPlayer = prev === Player.White ? Player.Black : Player.White;
        setMessage(`${nextPlayer === Player.White ? 'White' : 'Black'}'s turn to move.`);
        return nextPlayer;
    });
  }, []);

  const handleWin = useCallback((winner: Player) => {
    const winnerName = winner === Player.White ? "White" : "Black";
    setGameOver(`${winnerName} wins by capturing the King!`);
    setMessage(`${winnerName} wins!`);
  }, []);

  const clearSelection = () => {
    setSelectedPieceId(null);
    setPossibleMoves([]);
    setIsQuantumMode(false);
    setQuantumTargets([]);
  };

  const makeMove = useCallback((pieceToMove: Piece, targetPos: Position) => {
    const opponentPieceAtTarget = pieces.find(p => p.player !== pieceToMove.player && p.positions.some(pos => isPositionEqual(pos, targetPos)));

    // Quantum Capture
    if (opponentPieceAtTarget && opponentPieceAtTarget.positions.length > 1) {
        const capturedPiece = opponentPieceAtTarget;
        const finalPositionIndex = Math.floor(Math.random() * capturedPiece.positions.length);
        const finalPosition = capturedPiece.positions[finalPositionIndex];
        
        setIsAnimating(true);
        setCollapseAnimation({ piece: capturedPiece, from: capturedPiece.positions, to: finalPosition });
        clearSelection();

        setTimeout(() => {
            let tempPieces = pieces;
            let tempMessage = `${capturedPiece.player === Player.White ? "White" : "Black"}'s ${capturedPiece.type} collapsed to ${String.fromCharCode(97 + finalPosition.col)}${8 - finalPosition.row}. `;

            if (isPositionEqual(finalPosition, targetPos)) {
                tempMessage += "It was captured!";
                tempPieces = tempPieces.filter(p => p.id !== capturedPiece.id);
                if (capturedPiece.type === PieceType.King) {
                    handleWin(pieceToMove.player);
                    setPieces(tempPieces); // Update pieces before early exit
                    setIsAnimating(false);
                    setCollapseAnimation(null);
                    return;
                }
            } else {
                tempMessage += "The move was safe!";
                tempPieces = tempPieces.map(p => p.id === capturedPiece.id ? { ...p, positions: [finalPosition] } : p);
            }

            // Move attacking piece
            tempPieces = tempPieces.map(p => p.id === pieceToMove.id ? { ...p, positions: [targetPos], hasMoved: true } : p);

            setPieces(tempPieces);
            setMessage(tempMessage);
            setCollapseAnimation(null);
            switchPlayer();
            setIsAnimating(false);
        }, 800);
    } else { // Classical Move
        let tempPieces = [...pieces];
        
        if (opponentPieceAtTarget) {
            tempPieces = tempPieces.filter(p => p.id !== opponentPieceAtTarget.id);
            if (opponentPieceAtTarget.type === PieceType.King) {
                handleWin(pieceToMove.player);
            }
        }

        tempPieces = tempPieces.map(p => p.id === pieceToMove.id ? { ...p, positions: [targetPos], hasMoved: true } : p);
        
        setPieces(tempPieces);
        clearSelection();
        switchPlayer();
    }
  }, [pieces, switchPlayer, handleWin]);


  const makeQuantumMove = useCallback(() => {
    if (quantumTargets.length === 2 && selectedPieceId !== null) {
      setPieces(pieces.map(p => 
        p.id === selectedPieceId 
          ? { ...p, positions: quantumTargets, hasMoved: true }
          : p
      ));
      clearSelection();
      switchPlayer();
    }
  }, [pieces, quantumTargets, selectedPieceId, switchPlayer]);

  useEffect(() => {
    if (quantumTargets.length === 2) {
      makeQuantumMove();
    }
  }, [quantumTargets, makeQuantumMove]);
  
  const handleSquareClick = useCallback((row: number, col: number) => {
    if (gameOver || isAnimating) return;

    const clickedPos = { row, col };
    const pieceAtPos = pieces.find(p => p.positions.some(pos => isPositionEqual(pos, clickedPos)));

    if (selectedPieceId !== null) {
      const selectedPiece = pieces.find(p => p.id === selectedPieceId)!;
      
      if (isQuantumMode) {
        if (possibleMoves.some(move => isPositionEqual(move, clickedPos)) && !quantumTargets.some(qt => isPositionEqual(qt, clickedPos))) {
          setQuantumTargets(prev => [...prev, clickedPos]);
        } else {
            clearSelection();
        }
      } else {
        if (possibleMoves.some(move => isPositionEqual(move, clickedPos))) {
          makeMove(selectedPiece, clickedPos);
        } else {
          clearSelection();
        }
      }
    } else { // No piece selected
      if (pieceAtPos && pieceAtPos.player === currentPlayer) {
        if (pieceAtPos.positions.length > 1) { // Click on a quantum piece to measure
          const finalPositionIndex = Math.floor(Math.random() * pieceAtPos.positions.length);
          const finalPosition = pieceAtPos.positions[finalPositionIndex];
          
          setIsAnimating(true);
          setCollapseAnimation({ piece: pieceAtPos, from: pieceAtPos.positions, to: finalPosition });

          setTimeout(() => {
              setPieces(currentPieces => currentPieces.map(p => p.id === pieceAtPos.id ? {...p, positions: [finalPosition]} : p));
              setMessage(`${pieceAtPos.player === Player.White ? "White" : "Black"}'s ${pieceAtPos.type} measured itself and collapsed to ${String.fromCharCode(97 + finalPosition.col)}${8-finalPosition.row}.`);
              setCollapseAnimation(null);
              switchPlayer();
              setIsAnimating(false);
          }, 800);

        } else { // Select a classical piece
          setSelectedPieceId(pieceAtPos.id);
          setPossibleMoves(getValidMoves(pieceAtPos, pieces));
        }
      }
    }
  }, [gameOver, isAnimating, pieces, selectedPieceId, currentPlayer, isQuantumMode, possibleMoves, quantumTargets, makeMove, switchPlayer]);

  const toggleQuantumMode = () => {
      if (selectedPieceId !== null && pieces.find(p=>p.id === selectedPieceId)?.type !== PieceType.King) {
          setIsQuantumMode(prev => !prev);
          setQuantumTargets([]);
      }
  }

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
          disabled={selectedPieceId === null || pieces.find(p=>p.id === selectedPieceId)?.type === PieceType.King || isAnimating}
          className={`w-full py-3 px-4 rounded-lg text-lg font-bold transition-all duration-300
            ${isQuantumMode 
                ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(0,255,255,0.7)]' 
                : 'bg-[#5865F2] hover:bg-[#4752C4] text-gray-100'}
            disabled:bg-[#4F545C] disabled:text-gray-400 disabled:cursor-not-allowed`}
        >
          {isQuantumMode ? 'Select 2nd Target' : 'Quantum Move'}
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
                <li>To perform a Quantum Move, select a piece, press the button, then select two valid destination squares. The piece will enter a superposition.</li>
                <li>Kings cannot enter superposition.</li>
                <li>Clicking your own quantum piece measures it, collapsing it to one position and ending your turn.</li>
                <li>Attacking a quantum piece forces a measurement. The outcome is probabilistic!</li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
