
export interface Puzzle {
  answer: string;
  emojis: string;
  hint: string;
  explanation: string;
  funFact: string;
}

export type GameState = 'start' | 'loading' | 'playing' | 'gameover';

export interface ScoreState {
  current: number;
  high: number;
  streak: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Category = 'Countries' | 'Food' | 'Animals' | 'Movies' | 'Stories' | 'Bible';

export interface ChatMessage {
  id: string;
  sender: string;
  avatar: string; // Emoji avatar
  text: string;
  timestamp: string;
  type: 'chat' | 'score' | 'challenge';
  puzzleData?: {
    emojis: string;
    answer: string;
  };
  solved?: boolean;
  reactions?: Record<string, number>; // e.g. { '❤️': 1 }
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Added password
  avatar: string;
  highScore: number;
  joinedDate: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  countryFlag: string;
  avatar: string;
  rank: number;
  isCurrentUser: boolean;
}
