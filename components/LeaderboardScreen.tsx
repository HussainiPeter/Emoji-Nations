
import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { fetchLeaderboard } from '../services/leaderboardService';
import { LeaderboardEntry, User } from '../types';

interface LeaderboardScreenProps {
  onBack: () => void;
  currentUser: User | null;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack, currentUser }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchLeaderboard(currentUser);
      setEntries(data);
      setLoading(false);
    };
    load();
  }, [currentUser]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-full animate-fade-in p-4">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <Button variant="ghost" onClick={onBack} size="sm">
          ← Back
        </Button>
        <div className="text-right">
             <h2 className="text-2xl font-bold text-gray-800">
            World Rankings 🌍
            </h2>
             <p className="text-xs text-gray-400">Global Top Players</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex-1 border border-gray-100 flex flex-col min-h-0">
        {/* Header Row */}
        <div className="bg-gray-50 p-4 flex items-center text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 flex-shrink-0">
          <div className="w-12 text-center">Rank</div>
          <div className="flex-1 pl-4">Player</div>
          <div className="w-24 text-right">Score</div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-40">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
                <div className="text-xs text-gray-400">Loading rankings...</div>
             </div>
          ) : (
            entries.map((entry) => (
              <div 
                key={entry.id}
                className={`flex items-center p-3 rounded-xl transition-transform ${
                    entry.isCurrentUser 
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 shadow-sm scale-[1.02]' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-12 text-center flex justify-center">
                    {entry.rank === 1 && <span className="text-2xl">🥇</span>}
                    {entry.rank === 2 && <span className="text-2xl">🥈</span>}
                    {entry.rank === 3 && <span className="text-2xl">🥉</span>}
                    {entry.rank > 3 && <span className="font-bold text-gray-500">#{entry.rank}</span>}
                </div>
                
                <div className="flex-1 flex items-center gap-3 pl-2">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-xl">
                            {entry.avatar}
                        </div>
                        <div className="absolute -bottom-1 -right-1 text-sm">{entry.countryFlag}</div>
                    </div>
                    <div>
                        <div className={`font-bold ${entry.isCurrentUser ? 'text-indigo-700' : 'text-gray-700'}`}>
                            {entry.username} {entry.isCurrentUser && '(You)'}
                        </div>
                    </div>
                </div>
                
                <div className="w-24 text-right font-mono font-bold text-indigo-600 text-lg">
                    {entry.score.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
