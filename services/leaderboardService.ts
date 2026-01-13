
import { LeaderboardEntry, User } from '../types';

// Mock data to simulate a "World" leaderboard
const GLOBAL_BOTS = [
  { username: 'EmojiKing_JP', score: 15000, countryFlag: '🇯🇵', avatar: '👺' },
  { username: 'RiddleMasterUS', score: 12400, countryFlag: '🇺🇸', avatar: '🤠' },
  { username: 'LondonPuzzler', score: 11200, countryFlag: '🇬🇧', avatar: '💂' },
  { username: 'BrazilGoal', score: 9800, countryFlag: '🇧🇷', avatar: '⚽' },
  { username: 'BerlinBrain', score: 8900, countryFlag: '🇩🇪', avatar: '🍺' },
  { username: 'AussieMate', score: 7600, countryFlag: '🇦🇺', avatar: '🐨' },
  { username: 'MapleLeaf', score: 6500, countryFlag: '🇨🇦', avatar: '🍁' },
  { username: 'NairobiRunner', score: 5400, countryFlag: '🇰🇪', avatar: '🏃' },
  { username: 'DelhiSpice', score: 4200, countryFlag: '🇮🇳', avatar: '🌶️' },
  { username: 'ParisLove', score: 3100, countryFlag: '🇫🇷', avatar: '🥐' },
];

export const fetchLeaderboard = async (currentUser: User | null): Promise<LeaderboardEntry[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));

  let entries: any[] = [...GLOBAL_BOTS];

  // Add the current user if logged in
  if (currentUser) {
    entries.push({
      username: currentUser.username,
      score: currentUser.highScore,
      countryFlag: '🏳️', // Default flag for user
      avatar: currentUser.avatar,
      isCurrentUser: true
    });
  }

  // Sort by score descending
  entries.sort((a, b) => b.score - a.score);

  // Assign ranks
  return entries.map((entry, index) => ({
    id: entry.username + index,
    username: entry.username,
    score: entry.score,
    countryFlag: entry.countryFlag,
    avatar: entry.avatar,
    rank: index + 1,
    isCurrentUser: entry.isCurrentUser || false
  }));
};
