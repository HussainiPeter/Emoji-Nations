
import React, { useEffect } from 'react';
import { Button } from './Button';
import { playGameOver } from '../services/audioService';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart }) => {
  useEffect(() => {
    playGameOver();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in">
      <div className="relative">
          <div className="text-8xl mb-4">🏁</div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-4xl font-bold text-gray-800">Game Over!</h2>
        <p className="text-xl text-gray-600">You travelled far and wide.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm">
        <div className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-2">Final Score</div>
        <div className="text-6xl font-black text-indigo-600 mb-8">{score}</div>
        
        <Button onClick={onRestart} className="w-full text-lg">
          Play Again 🔄
        </Button>
      </div>
    </div>
  );
};
