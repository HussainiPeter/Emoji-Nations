
import React, { useState, useEffect } from 'react';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { PuzzleCreator } from './components/PuzzleCreator';
import { SocialHub } from './components/SocialHub';
import { AuthScreen } from './components/AuthScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { GameState, Difficulty, Category, User } from './types';
import { getCurrentUser, updateUserScore } from './services/authService';

type View = 'game' | 'create' | 'social' | 'auth' | 'leaderboard';

function App() {
  const [view, setView] = useState<View>('game');
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [category, setCategory] = useState<Category>('Countries');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setHighScore(user.highScore);
    } else {
      const saved = localStorage.getItem('emojiNationsHighScore');
      if (saved) setHighScore(parseInt(saved, 10));
    }
  }, []);

  const handleStartGame = () => {
    setView('game');
    setScore(0);
    setGameState('playing');
  };

  const handleCreatePuzzle = () => {
    setView('create');
    setGameState('start'); 
  };

  const handleOpenSocial = () => {
    setView('social');
    setGameState('start');
  };

  const handleOpenLeaderboard = () => {
    setView('leaderboard');
    setGameState('start');
  };

  const handleOpenAuth = () => {
    setView('auth');
    setGameState('start');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setHighScore(user.highScore);
    setView('game');
    setGameState('start');
  };

  const handleGameOver = (finalScore: number) => {
    if (finalScore > highScore) {
      setHighScore(finalScore);
      if (currentUser) {
        updateUserScore(finalScore);
        setCurrentUser(prev => prev ? ({...prev, highScore: finalScore}) : null);
      } else {
        localStorage.setItem('emojiNationsHighScore', finalScore.toString());
      }
    }
    setGameState('gameover');
  };

  const handleRestart = () => {
    setScore(0);
    setGameState('playing');
  };

  return (
    <div className="h-screen w-screen bg-gray-50 text-gray-900 font-sans overflow-hidden flex flex-col">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* Main Content Area - Full Height */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
          {view === 'create' ? (
            <PuzzleCreator onBack={() => setView('game')} />
          ) : view === 'social' ? (
            <SocialHub onBack={() => setView('game')} currentUserScore={highScore} />
          ) : view === 'leaderboard' ? (
            <LeaderboardScreen onBack={() => setView('game')} currentUser={currentUser} />
          ) : view === 'auth' ? (
            <AuthScreen 
              onLoginSuccess={handleLoginSuccess} 
              onSkip={() => setView('game')} 
            />
          ) : (
            <>
              {gameState === 'start' && (
                <StartScreen 
                  onStart={handleStartGame} 
                  onCreatePuzzle={handleCreatePuzzle}
                  onOpenSocial={handleOpenSocial}
                  onOpenLeaderboard={handleOpenLeaderboard}
                  onOpenAuth={handleOpenAuth}
                  highScore={highScore} 
                  difficulty={difficulty}
                  setDifficulty={setDifficulty}
                  category={category}
                  setCategory={setCategory}
                  currentUser={currentUser}
                />
              )}

              {gameState === 'playing' && (
                <GameScreen 
                  onGameOver={handleGameOver} 
                  currentScore={score}
                  updateScore={(points) => setScore(prev => prev + points)}
                  difficulty={difficulty}
                  category={category}
                />
              )}

              {gameState === 'gameover' && (
                <GameOverScreen 
                  score={score} 
                  onRestart={handleRestart} 
                />
              )}
            </>
          )}
      </div>

      {view === 'game' && gameState === 'start' && (
        <footer className="absolute bottom-2 left-0 right-0 text-center text-gray-400 text-[10px] p-2 pointer-events-none z-0 opacity-50">
          Powered by Google Gemini
        </footer>
      )}
    </div>
  );
}

export default App;
