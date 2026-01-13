
import React from 'react';
import { Button } from './Button';
import { Difficulty, Category, User } from '../types';

interface StartScreenProps {
  onStart: () => void;
  onCreatePuzzle: () => void;
  onOpenSocial: () => void;
  onOpenLeaderboard: () => void;
  onOpenAuth: () => void;
  highScore: number;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  category: Category;
  setCategory: (c: Category) => void;
  currentUser: User | null;
}

const CATEGORIES: { id: Category; icon: string; label: string }[] = [
    { id: 'Countries', icon: '🌍', label: 'Countries' },
    { id: 'Bible', icon: '📖', label: 'Bible Stories' },
    { id: 'Movies', icon: '🎬', label: 'Movies' },
    { id: 'Stories', icon: '📚', label: 'Tales' },
    { id: 'Food', icon: '🍔', label: 'Food' },
    { id: 'Animals', icon: '🦁', label: 'Animals' },
];

export const StartScreen: React.FC<StartScreenProps> = ({ 
  onStart, 
  onCreatePuzzle,
  onOpenSocial,
  onOpenLeaderboard,
  onOpenAuth,
  highScore, 
  difficulty, 
  setDifficulty,
  category,
  setCategory,
  currentUser
}) => {
  return (
    <div className="h-full w-full flex flex-col items-center animate-fade-in relative font-sans overflow-y-auto scrollbar-hide">
      
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center px-4 py-4 z-20 sticky top-0">
        <button 
            onClick={onOpenAuth}
            className="glass-panel flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg hover:scale-105 transition-all text-sm font-bold text-white border-white/20"
        >
            <span className="text-lg filter drop-shadow-md">{currentUser ? currentUser.avatar : '👤'}</span>
            <span className="text-shadow-sm">{currentUser ? currentUser.username : 'Login'}</span>
        </button>
        
        <button 
            onClick={onOpenLeaderboard}
            className="glass-panel flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg hover:scale-105 transition-all text-sm font-bold text-white border-white/20"
        >
            <span className="filter drop-shadow-md">🏆</span>
            <span className="text-shadow-sm">Rankings</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md flex flex-col items-center px-4 pb-20 space-y-6 z-10">
          {/* Hero Header */}
          <div className="text-center pt-8 pb-4 relative">
            <div className="inline-block relative">
                <h1 className="text-6xl md:text-7xl font-black text-white drop-shadow-lg tracking-tight leading-tight select-none py-2 filter">
                Emoji<br/>Riddles
                </h1>
                <div className="absolute -top-6 -right-8 text-5xl animate-float select-none filter drop-shadow-xl">🧩</div>
                <div className="absolute -bottom-4 -left-8 text-5xl animate-float select-none filter drop-shadow-xl" style={{ animationDelay: '1s' }}>🤔</div>
                <div className="absolute top-1/2 -right-16 text-4xl animate-float select-none filter drop-shadow-xl opacity-80" style={{ animationDelay: '2s' }}>✨</div>
            </div>
          </div>

        {/* Main Game Card */}
        <div className="w-full glass-card rounded-3xl overflow-hidden transform transition-all hover:scale-[1.01] duration-300">
            <div className="bg-gradient-to-r from-indigo-500/80 to-purple-500/80 h-2"></div>
            <div className="p-5 md:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        🎮 Arcade
                    </h2>
                    {highScore > 0 && (
                        <div className="bg-amber-100/80 backdrop-blur-sm text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200/50 flex items-center gap-1 shadow-sm">
                            🏆 Best: {highScore}
                        </div>
                    )}
                </div>

                {/* Category Grid */}
                <div className="mb-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</p>
                    <div className="grid grid-cols-3 gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all aspect-square ${
                                    category === cat.id 
                                    ? 'border-indigo-500 bg-indigo-50/90 text-indigo-700 shadow-md scale-105 z-10' 
                                    : 'border-slate-100 bg-white/50 text-slate-400 hover:border-indigo-200 hover:bg-white/80'
                                }`}
                            >
                                <span className="text-2xl mb-1 filter drop-shadow-sm">{cat.icon}</span>
                                <span className="text-[10px] font-bold leading-tight">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Difficulty */}
                <div className="bg-slate-100/50 p-1 rounded-xl flex mb-6 backdrop-blur-sm">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                        <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all duration-200 ${
                                difficulty === d 
                                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5 scale-105' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>

                <Button 
                    onClick={onStart} 
                    size="lg" 
                    className="w-full text-lg py-4 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 group bg-gradient-to-r from-indigo-600 to-purple-600 border-none animate-pulse-glow"
                >
                    <span className="flex items-center justify-center gap-2 font-black tracking-wide text-white">
                        PLAY NOW <span className="group-hover:translate-x-1 transition-transform">➡️</span>
                    </span>
                </Button>
            </div>
        </div>

        {/* Action Grid */}
        <div className="w-full grid grid-cols-2 gap-3">
             {/* Social Card */}
            <button 
                onClick={onOpenSocial}
                className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition-transform group aspect-[4/3] hover:bg-white/90"
            >
                <div className="w-12 h-12 rounded-full bg-green-100/80 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform text-green-600 shadow-inner">
                    💬
                </div>
                <span className="font-bold text-slate-700 text-sm">Chat League</span>
            </button>

            {/* Puzzle Creator */}
            <button 
                onClick={onCreatePuzzle}
                className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:-translate-y-1 transition-transform group aspect-[4/3] hover:bg-white/90"
            >
                <div className="w-12 h-12 rounded-full bg-orange-100/80 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform text-orange-600 shadow-inner">
                    🧩
                </div>
                <span className="font-bold text-slate-700 text-sm">Create Puzzle</span>
            </button>
        </div>
      </div>
    </div>
  );
};
