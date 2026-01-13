import React, { useState } from 'react';
import { Button } from './Button';
import { login, signup } from '../services/authService';
import { User } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
  onSkip: () => void;
}

const AVATARS = ['🦁', '🦊', '🐼', '🐯', '🐸', '🐙', '🦄', '👽', '🤖', '🤠'];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onSkip }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotPasswordMode) {
      alert(`A recovery link has been sent to ${email}. (In a real app, this would trigger a backend email).`);
      setForgotPasswordMode(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let user;
      if (isLogin) {
        user = await login(email, password);
      } else {
        if (!username) throw new Error("Username is required");
        user = await signup(username, email, password, selectedAvatar);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (forgotPasswordMode) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4 animate-fade-in bg-gray-50/50">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-8 text-center text-white">
            <h2 className="text-3xl font-black mb-2">Recover Access</h2>
            <p className="opacity-90">Enter your email and we'll help you get back in.</p>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="email@example.com"
              />
            </div>
            <Button type="submit" className="w-full py-4 text-lg bg-orange-600 hover:bg-orange-700 shadow-orange-200">
              Send Recovery Link
            </Button>
            <button
              type="button"
              onClick={() => setForgotPasswordMode(false)}
              className="w-full text-sm text-gray-500 font-bold hover:text-indigo-600 transition-colors"
            >
              Back to Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center p-4 animate-fade-in bg-gray-50/50">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-center text-white flex-shrink-0">
          <h2 className="text-3xl font-black mb-2">
            {isLogin ? 'Welcome Back!' : 'Start Solving'}
          </h2>
          <p className="opacity-90">
            {isLogin ? 'Log in to track your global rank' : 'Join thousands of riddle masters'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4 flex-1">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-bold border border-red-100">
              {error}
            </div>
          )}

          {!isLogin && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Choose Avatar</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setSelectedAvatar(a)}
                      className={`text-2xl p-2 rounded-xl transition-all ${selectedAvatar === a ? 'bg-indigo-100 scale-110 shadow-sm border-2 border-indigo-500' : 'hover:bg-gray-50 grayscale hover:grayscale-0'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="MasterSolver"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white"
              placeholder="you@email.com"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
                {isLogin && (
                    <button 
                        type="button"
                        onClick={() => setForgotPasswordMode(true)}
                        className="text-[10px] font-bold text-indigo-500 hover:underline uppercase"
                    >
                        Forgot?
                    </button>
                )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-indigo-500 outline-none transition-all bg-gray-50 focus:bg-white"
              placeholder="••••••••"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 text-lg shadow-indigo-300 mt-4"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Log In' : 'Create Account')}
          </Button>

          <div className="text-center space-y-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-indigo-600 font-bold hover:underline"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
            
            <div className="pt-2 flex flex-col items-center gap-4">
               <button
                type="button"
                onClick={onSkip}
                className="text-xs text-gray-400 font-bold hover:text-indigo-500 tracking-wide uppercase"
              >
                Skip & Play as Guest
              </button>
              
              <div className="text-[10px] text-gray-300 px-8 leading-relaxed text-center italic">
                By continuing, you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>. 
                <p className="mt-1">Built with Gemini AI.</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};