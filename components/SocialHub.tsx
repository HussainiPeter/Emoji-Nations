
import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { fetchSocialUpdates } from '../services/geminiService';
import { ChatMessage } from '../types';
import { playPop, playSuccess, playCorrect, playIncorrect } from '../services/audioService';

interface SocialHubProps {
  onBack: () => void;
  currentUserScore: number;
}

const REACTIONS = ['❤️', '😂', '🔥', '🧠'];

export const SocialHub: React.FC<SocialHubProps> = ({ onBack, currentUserScore }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [answeringPuzzleId, setAnsweringPuzzleId] = useState<string | null>(null);
  const [puzzleAnswerText, setPuzzleAnswerText] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial load
    loadSocialFeed();
    
    // Add dummy initial message
    setMessages([{
        id: 'init-1',
        sender: 'System',
        avatar: '🤖',
        text: 'Welcome to the Emoji League Global Chat! 🌍',
        type: 'chat',
        timestamp: 'Today',
        reactions: { '🔥': 5 }
    }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadSocialFeed = async () => {
    setLoading(true);
    const newMessages = await fetchSocialUpdates();
    const messagesWithReactions = newMessages.map(m => ({
        ...m,
        reactions: m.reactions || {}
    }));
    setMessages(prev => [...prev, ...messagesWithReactions]);
    setLoading(false);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    playPop();
    
    const newMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'You',
        avatar: '👤',
        text: inputText,
        type: 'chat',
        timestamp: 'Just now',
        reactions: {}
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    
    // Random chance for bot reply after 2s
    setTimeout(() => {
        playPop();
        setMessages(prev => [...prev, {
            id: Date.now().toString() + 'r',
            sender: 'EmojiBot',
            avatar: '🤖',
            text: 'Nice one! Keep grinding that leaderboard.',
            type: 'chat',
            timestamp: 'Just now',
            reactions: {}
        }]);
    }, 2000);
  };

  const handleSolvePuzzle = (msgId: string, correctAnswer: string) => {
    if (!puzzleAnswerText.trim()) return;
    
    const isCorrect = puzzleAnswerText.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    
    if (isCorrect) {
        playCorrect();
        // Mark as solved
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, solved: true } : m));
        setAnsweringPuzzleId(null);
        setPuzzleAnswerText('');
        
        // Add success message
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'You',
            avatar: '👤',
            text: `I cracked it! It's ${correctAnswer}! 🎉`,
            type: 'chat',
            timestamp: 'Just now'
        }]);
    } else {
        playIncorrect();
        alert("Nope, try again!");
    }
  };

  const handleReaction = (msgId: string, emoji: string) => {
    playPop();
    setMessages(prev => prev.map(msg => {
        if (msg.id !== msgId) return msg;
        const currentCount = msg.reactions?.[emoji] || 0;
        return {
            ...msg,
            reactions: {
                ...msg.reactions,
                [emoji]: currentCount + 1
            }
        };
    }));
  };

  return (
    <div className="w-full h-full max-w-2xl mx-auto flex flex-col animate-fade-in p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <Button variant="ghost" onClick={onBack} size="sm">
          ← Back
        </Button>
        <h2 className="text-xl font-bold text-gray-800">
          Global League 💬
        </h2>
        <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
            Your Score: {currentUserScore}
        </div>
      </div>

      {/* Main Chat/Feed Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-0">
        {/* Leaderboard Banner */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 text-white flex justify-between items-center text-sm shadow-sm z-10 flex-shrink-0">
            <span className="font-bold">🏆 Current Leaders:</span>
            <div className="flex space-x-3 text-xs">
                <span>1. 👑 GeoMaster</span>
                <span>2. 🧛‍♂️ Vlad</span>
            </div>
        </div>

        {/* Message List */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === 'You' ? 'flex-row-reverse' : ''} group`}>
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl flex-shrink-0 border border-gray-100">
                        {msg.avatar}
                    </div>
                    
                    <div className={`flex flex-col max-w-[80%] ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-600">{msg.sender}</span>
                            <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                        </div>
                        
                        <div className={`p-3 rounded-2xl shadow-sm text-sm relative ${
                            msg.sender === 'You' 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                        }`}>
                            {msg.type === 'score' && <span className="mr-1">🚀</span>}
                            {msg.text}
                            
                            {/* Embedded Puzzle */}
                            {msg.type === 'challenge' && msg.puzzleData && (
                                <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-200 text-gray-900">
                                    <div className="text-center text-3xl mb-2">{msg.puzzleData.emojis}</div>
                                    
                                    {msg.solved ? (
                                        <div className="text-center text-green-600 font-bold text-xs bg-green-100 py-1 rounded">
                                            ✅ Solved: {msg.puzzleData.answer}
                                        </div>
                                    ) : (
                                        <div className="mt-2">
                                            {answeringPuzzleId === msg.id ? (
                                                <div className="flex gap-2">
                                                    <input 
                                                        className="flex-1 p-1 text-xs border rounded text-black"
                                                        value={puzzleAnswerText}
                                                        onChange={(e) => setPuzzleAnswerText(e.target.value)}
                                                        placeholder="Guess..."
                                                    />
                                                    <button 
                                                        onClick={() => handleSolvePuzzle(msg.id, msg.puzzleData!.answer)}
                                                        className="bg-green-500 text-white px-2 rounded text-xs"
                                                    >
                                                        Go
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => {
                                                        setAnsweringPuzzleId(msg.id);
                                                        setPuzzleAnswerText('');
                                                    }}
                                                    className="w-full bg-indigo-100 text-indigo-700 text-xs py-1.5 rounded font-bold hover:bg-indigo-200"
                                                >
                                                    Solve Challenge ⚡
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                             {/* Reactions Display */}
                             <div className="flex flex-wrap gap-1 mt-2">
                                {Object.entries(msg.reactions || ({} as Record<string, number>)).map(([emoji, count]) => (
                                    (count as number) > 0 && (
                                        <button 
                                            key={emoji}
                                            onClick={() => handleReaction(msg.id, emoji)}
                                            className="text-[10px] bg-black/5 hover:bg-black/10 px-1.5 py-0.5 rounded-full flex items-center gap-1 transition-colors text-gray-700"
                                        >
                                            <span>{emoji}</span>
                                            <span className="font-bold opacity-70">{count as number}</span>
                                        </button>
                                    )
                                ))}
                                {/* Add Reaction Button (Hover only) */}
                                <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ${msg.sender === 'You' ? 'flex-row-reverse' : ''}`}>
                                    {REACTIONS.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleReaction(msg.id, emoji)}
                                            className="text-xs hover:scale-125 transition-transform cursor-pointer grayscale hover:grayscale-0"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            {loading && (
                 <div className="text-center text-xs text-gray-400 py-2 italic">Updating feed...</div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0">
            <input 
                className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button size="sm" onClick={handleSendMessage} disabled={!inputText}>
                Send
            </Button>
        </div>
      </div>
    </div>
  );
};
