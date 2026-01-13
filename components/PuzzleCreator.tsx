
import React, { useState } from 'react';
import { Button } from './Button';

interface PuzzleCreatorProps {
  onBack: () => void;
}

export const PuzzleCreator: React.FC<PuzzleCreatorProps> = ({ onBack }) => {
  const [emojis, setEmojis] = useState('');
  const [answer, setAnswer] = useState('');
  const [sharedLink, setSharedLink] = useState<string | null>(null);

  const handleShare = () => {
    if (!emojis || !answer) return;
    
    // Simulate creating a link (In a real app, this would save to DB and get an ID)
    const fakeCode = btoa(`${emojis}|${answer}`).substring(0, 10);
    const link = `https://emojiriddles.app/play?code=${fakeCode}`;
    setSharedLink(link);
  };

  const handleCopy = () => {
    if (sharedLink) {
        navigator.clipboard.writeText(sharedLink);
        alert("Link copied to clipboard! Send it to your friend.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[45%] bg-gradient-to-b from-orange-400 to-rose-500 rounded-b-[40px] shadow-2xl z-0"></div>
      
      {/* Header */}
      <div className="z-10 flex items-center justify-between p-4 pt-6 text-white w-full max-w-lg mx-auto">
        <button 
            onClick={onBack} 
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full font-bold transition-all text-sm flex items-center gap-1"
        >
            <span>←</span> Back
        </button>
        <h2 className="text-xl font-black tracking-wide opacity-90">STUDIO</h2>
        <div className="w-16"></div> {/* Spacer for center alignment */}
      </div>

      {/* Main Content Scrollable */}
      <div className="flex-1 z-10 overflow-y-auto px-4 pb-8 flex flex-col items-center w-full">
        
        {/* Title Area */}
        <div className="text-center text-white mb-6 mt-2">
            <h1 className="text-3xl font-black mb-1 drop-shadow-md">Create a Puzzle</h1>
            <p className="text-orange-100 text-sm font-medium">Challenge your friends to guess!</p>
        </div>

        {/* Card Container */}
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl shadow-orange-900/20 overflow-hidden flex flex-col relative animate-fade-in mx-auto">
            {/* Live Preview Header */}
            <div className="bg-gray-100 p-3 text-center border-b border-gray-200">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Puzzle Preview</span>
            </div>

            {/* Emoji Stage */}
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 flex items-center justify-center min-h-[180px] relative overflow-hidden group cursor-text" onClick={() => document.getElementById('emoji-input')?.focus()}>
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-300 via-transparent to-transparent"></div>
                <input 
                    id="emoji-input"
                    type="text" 
                    value={emojis}
                    onChange={(e) => setEmojis(e.target.value)}
                    placeholder="🦁👑"
                    className="w-full text-center text-7xl bg-transparent border-none outline-none placeholder-gray-300 z-10 font-emoji transition-transform group-hover:scale-105"
                    autoComplete="off"
                />
                {!emojis && (
                    <div className="absolute bottom-4 text-xs text-gray-400 font-medium pointer-events-none animate-pulse">
                        Tap to add emojis
                    </div>
                )}
            </div>

            {/* Answer Input Area */}
            <div className="p-6 space-y-6 relative">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block pl-1">The Answer</label>
                    <div className="relative group">
                        <input 
                            type="text" 
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="e.g. The Lion King"
                            className="w-full bg-gray-50 text-gray-800 font-bold text-lg p-4 rounded-xl border-2 border-gray-100 focus:border-orange-500 focus:bg-white outline-none transition-all pl-12 group-hover:border-gray-200"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">🔑</span>
                    </div>
                </div>

                {sharedLink ? (
                     <div className="bg-green-50 rounded-xl p-5 border-2 border-green-100 text-center animate-fade-in relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-green-200"></div>
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm">
                            🎉
                        </div>
                        <h3 className="font-bold text-green-800 text-lg mb-1">Ready to Share!</h3>
                        <p className="text-green-600 text-xs mb-4">Your puzzle link has been generated.</p>
                        
                        <div className="flex gap-2">
                            <Button onClick={handleCopy} className="flex-1 bg-green-600 hover:bg-green-700 shadow-green-200 border-none">
                                Copy Link 📋
                            </Button>
                            <Button onClick={() => { setSharedLink(null); setEmojis(''); setAnswer(''); }} variant="ghost" className="text-green-700 hover:bg-green-100">
                                New
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button 
                        onClick={handleShare}
                        disabled={!emojis || !answer}
                        size="lg"
                        className={`w-full py-4 text-lg font-black tracking-wide shadow-lg transition-all transform active:scale-95 ${
                            emojis && answer 
                            ? 'bg-gradient-to-r from-orange-500 to-rose-500 shadow-orange-300 hover:shadow-orange-400 hover:-translate-y-1' 
                            : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                        }`}
                    >
                        CREATE & SHARE 🚀
                    </Button>
                )}
            </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center px-6 max-w-xs mx-auto">
            <p className="text-gray-400 text-xs font-medium leading-relaxed">
                Friends will play your puzzle in "Arcade Mode". <br/>
                Earn <span className="text-orange-500 font-bold">Social Points</span> when they solve it!
            </p>
        </div>
      </div>
    </div>
  );
};
