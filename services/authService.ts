
import { User } from '../types';

// Mock delay to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const login = async (email: string, password: string): Promise<User> => {
  await delay(800);
  
  const users = JSON.parse(localStorage.getItem('emoji_users') || '[]');
  const user = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    throw new Error('User not found. Please sign up.');
  }

  // Simple mock password check (In real app, use hashing)
  if (user.password !== password) {
      throw new Error('Incorrect password.');
  }
  
  localStorage.setItem('emoji_current_user', JSON.stringify(user));
  return user;
};

export const signup = async (username: string, email: string, password: string, avatar: string): Promise<User> => {
  await delay(800);
  
  if (password.length < 4) {
      throw new Error("Password must be at least 4 characters.");
  }

  const users = JSON.parse(localStorage.getItem('emoji_users') || '[]');
  
  if (users.find((u: User) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email already exists.');
  }

  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    username,
    email,
    password, // Storing plain text for mock only. NEVER do this in production.
    avatar,
    highScore: 0,
    joinedDate: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem('emoji_users', JSON.stringify(users));
  localStorage.setItem('emoji_current_user', JSON.stringify(newUser));
  
  return newUser;
};

export const logout = async () => {
  localStorage.removeItem('emoji_current_user');
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem('emoji_current_user');
  return stored ? JSON.parse(stored) : null;
};

export const updateUserScore = (newScore: number) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  if (newScore > currentUser.highScore) {
    const updatedUser = { ...currentUser, highScore: newScore };
    
    // Update current session
    localStorage.setItem('emoji_current_user', JSON.stringify(updatedUser));
    
    // Update DB
    const users = JSON.parse(localStorage.getItem('emoji_users') || '[]');
    const index = users.findIndex((u: User) => u.id === currentUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem('emoji_users', JSON.stringify(users));
    }
  }
};
