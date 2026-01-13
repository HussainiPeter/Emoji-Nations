import React, { useState, useEffect, useRef } from 'react';
import { Puzzle, Difficulty, Category } from '../types';
import { Button } from './Button';
import { fetchPuzzles, generateSpeech, generateProEmojiImage } from '../services/geminiService';
import { playCorrect, playIncorrect, playPop, playRawAudio, getMuteState, toggleMute } from '../services/audioService';

interface GameScreenProps {
  onGameOver: (score: number) => void;
  updateScore: (points: number) => void;
  currentScore: number;
  difficulty: Difficulty;
  category: Category;
}

const ProgressBar = ({ current, total, category }: { current: number, total: number, category: Category }) => {
  const percentage = Math.min(100, (current / total) * 100);

  const getIcon = () => {
    switch (category) {
      case 'Countries': return '🌍';
      case 'Food': return '🍩';
      case 'Movies': return '🎬';
      case 'Bible': return '📖';
      case 'Animals': return '🦔';
      case 'Stories': return '📚';
      default: return '🎱';
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto mb-4 relative px-2">
      <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1 px-1 uppercase tracking-wider">
        <span>Start</span>
        <span>Level Up</span>
      </div>
      <div className="h-4 bg-gray-100 rounded-full w-full shadow-inner border border-gray-200 relative overflow-visible">
        <div className="absolute inset-0 flex justify-between items-center px-[2px]">
          {[...Array(total + 1)].map((_, i) => (
            <div key={i} className={`w-1 h-1 rounded-full ${i <= current ? 'bg-indigo-300' : 'bg-gray-300'} z-0`}></div>
          ))}
        </div>
        <div
          className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-1000 ease-out relative z-0"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div
        className="absolute top-1/2 left-0 transition-all duration-1000 ease-out z-10 flex items-center justify-center w-8 h-8 pointer-events-none"
        style={{
          left: `calc(${percentage}% + 8px)`,
          transform: `translate(-50%, -15%) rotate(${percentage * 15}deg)`
        }}
      >
        <div className="text-2xl filter drop-shadow-md transform -translate-y-1">
          {getIcon()}
        </div>
      </div>
    </div>
  );
};

export const GameScreen: React.FC<GameScreenProps> = ({ onGameOver, updateScore, currentScore, difficulty, category }) => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect' | 'skipped'>('none');
  const [loading, setLoading] = useState(true);
  const [lives, setLives] = useState(6);
  const [lastExplanation, setLastExplanation] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [visualizedImage, setVisualizedImage] = useState<string | null>(null);
  const [visualizing, setVisualizing] = useState(false);
  const [muted, setMuted] = useState(getMuteState());
  const [gameOverPending, setGameOverPending] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const BATCH_SIZE = 5;

  useEffect(() => {
    loadPuzzles();
  }, []);

  useEffect(() => {
    if (!loading && feedback === 'none') {
      inputRef.current?.focus();
    }
  }, [currentIndex, loading, feedback]);

  const loadPuzzles = async () => {
    setLoading(true);
    const newPuzzles = await fetchPuzzles(BATCH_SIZE, difficulty, category);
    setPuzzles(prev => [...prev, ...newPuzzles]);
    setLoading(false);
  };

  const checkAnswer = (input: string, answer: string): boolean => {
    const normInput = input.toLowerCase().trim();
    const normAnswer = answer.toLowerCase().trim();
    if (normInput === normAnswer) return true;
    const stopWords = ['the', 'a', 'an', 'and', 'of', 'in', 'to', '&'];
    const answerKeywords = normAnswer.split(/[\s,]+/).filter(w => !stopWords.includes(w) && w.length > 2);
    const inputWords = normInput.split(/[\s,]+/);
    return inputWords.some(w => answerKeywords.includes(w));
  };

  const handleGuess = () => {
    if (!userInput.trim()) return;
    const currentPuzzle = puzzles[currentIndex];
    const isCorrect = checkAnswer(userInput, currentPuzzle.answer);

    if (isCorrect) {
      playCorrect();
      setFeedback('correct');
      let basePoints = 100;
      if (difficulty === 'medium') basePoints = 150;
      if (difficulty === 'hard') basePoints = 250;
      updateScore(showHint ? Math.floor(basePoints / 2) : basePoints);
      setLastExplanation(`Correct! It's ${currentPuzzle.answer}. ${currentPuzzle.explanation}`);
      setTimeout(() => handleNextRound(), 3500);
    } else {
      playIncorrect();
      if (lives - 1 <= 0) {
        setLives(0);
        setGameOverPending(true);
        setFeedback('skipped');
        setLastExplanation(currentPuzzle.explanation);
      } else {
        setLives(prev => prev - 1);
        setFeedback('incorrect');
        setTimeout(() => setFeedback('none'), 1000);
      }
    }
  };

  const handleNextRound = () => {
    if (gameOverPending) {
      onGameOver(currentScore);
      return;
    }
    setFeedback('none');
    setUserInput('');
    setShowHint(false);
    setLastExplanation(null);
    setSpeaking(false);
    setVisualizedImage(null);
    setVisualizing(false);
    if (currentIndex > puzzles.length - 3) {
      fetchPuzzles(BATCH_SIZE, difficulty, category).then(newP => setPuzzles(prev => [...prev, ...newP]));
    }
    if (currentIndex + 1 >= puzzles.length) setLoading(true);
    setCurrentIndex(prev => prev + 1);
  };

  const handleSkip = () => {
    playPop();
    const newLives = lives - 1;
    setLives(Math.max(0, newLives));
    setFeedback('skipped');
    if (newLives <= 0) setGameOverPending(true);
  };

  const handleToggleMute = () => {
    const newState = toggleMute();
    setMuted(newState);
  };

  const handleSpeakExplanation = async () => {
    const textToSpeak = feedback === 'skipped' && currentPuzzle
      ? `${currentPuzzle.answer}. ${currentPuzzle.funFact}`
      : lastExplanation;
    if (!textToSpeak || speaking) return;
    setSpeaking(true);
    try {
      const audioData = await generateSpeech(textToSpeak, 'Kore');
      if (audioData) await playRawAudio(audioData);
    } catch (e) { console.error(e); } finally { setSpeaking(false); }
  };

  const handleVisualize = async () => {
    if (visualizing || visualizedImage) return;
    setVisualizing(true);
    try {
      const image = await generateProEmojiImage(currentPuzzle.emojis);
      if (image) setVisualizedImage(image);
    } catch (e) { console.error(e); } finally { setVisualizing(false); }
  };

  if (loading && puzzles.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
        <p className="text-xl text-white font-bold animate-pulse drop-shadow-md">Summoning Puzzles...</p>
      </div>
    );
  }

  const currentPuzzle = puzzles[currentIndex];
  if (!currentPuzzle) return null;

  const levelProgressRaw = currentIndex % BATCH_SIZE;
  const displayProgress = feedback === 'correct' ? levelProgressRaw + 1 : levelProgressRaw;

  return (
    <div className="h-full w-full flex flex-col p-4 animate-fade-in max-w-2xl mx-auto overflow-hidden">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-2 glass-panel p-3 rounded-2xl shadow-lg flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={handleToggleMute} className="text-xl bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors text-white">
            {muted ? '🔇' : '🔊'}
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-2xl filter drop-shadow-sm">❤️</span>
            <span className={`text-xl font-black ${lives <= 1 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{lives}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-2xl font-black text-white drop-shadow-md">{currentScore.toLocaleString()}</div>
          <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">{category}</div>
        </div>
      </div>

      <ProgressBar current={displayProgress} total={BATCH_SIZE} category={category} />

      <div className="flex-1 glass-card rounded-[32px] shadow-2xl overflow-hidden relative flex flex-col min-h-0 backdrop-blur-xl border-white/40">
        <div className={`flex-1 p-4 text-center flex flex-col justify-center items-center relative transition-colors duration-700 overflow-y-auto ${feedback === 'skipped' ? 'bg-red-50/80' : 'bg-white/60'}`}>
          <button
            onClick={handleVisualize}
            disabled={visualizing || !!visualizedImage}
            className="absolute top-4 right-4 text-[10px] font-black uppercase text-indigo-600 bg-white shadow-md px-3 py-2 rounded-full border border-indigo-100 hover:scale-105 transition-all z-10"
          >
            {visualizing ? '🎨 Rendering...' : visualizedImage ? '✨ Visual Unlocked' : '✨ Pro Hint'}
          </button>

          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
            {visualizedImage ? (
              <div className="animate-fade-in">
                <img src={visualizedImage} alt="AI Visual" className="w-64 h-64 object-cover rounded-3xl shadow-2xl border-4 border-white transform hover:scale-105 transition-transform" />
              </div>
            ) : (
              <div className={`text-7xl md:text-9xl mb-4 select-none filter drop-shadow-2xl w-full transition-transform ${feedback === 'incorrect' ? 'animate-shake' : 'hover:scale-110'}`}>
                {currentPuzzle.emojis}
              </div>
            )}

            {showHint && feedback === 'none' && (
              <div className="mt-4 bg-amber-50/90 text-amber-800 p-4 rounded-2xl text-sm font-bold animate-fade-in border border-amber-100 shadow-sm backdrop-blur-sm">
                💡 {currentPuzzle.hint}
              </div>
            )}

            {feedback === 'correct' && (
              <div className="mt-4 flex flex-col items-center gap-3 animate-fade-in w-full">
                <div className="bg-green-500 text-white p-4 rounded-2xl text-sm font-bold shadow-lg w-full transform -rotate-1 border border-green-400">
                  {lastExplanation}
                </div>
                <button onClick={handleSpeakExplanation} className="text-xs font-black text-indigo-600 uppercase tracking-tight flex items-center gap-1 bg-white/50 px-3 py-1 rounded-full">
                  {speaking ? '⏳ Synthesizing...' : '🔊 Read Out Loud'}
                </button>
              </div>
            )}

            {feedback === 'skipped' && (
              <div className="mt-4 flex flex-col items-center gap-4 animate-fade-in w-full">
                <div className="text-3xl font-black text-red-600 uppercase tracking-tighter drop-shadow-sm">
                  It was: {currentPuzzle.answer}
                </div>
                <div className="bg-white/80 p-5 rounded-3xl text-sm text-gray-700 border-2 border-red-100 shadow-xl w-full text-left relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute top-0 right-0 p-2 text-2xl opacity-20">💡</div>
                  <span className="font-black text-indigo-600 uppercase text-[10px] block mb-2 tracking-widest">Did You Know?</span>
                  <p className="leading-relaxed">{currentPuzzle.funFact}</p>
                </div>
                <button onClick={handleSpeakExplanation} className="text-xs font-black text-indigo-600 uppercase tracking-tight bg-white/50 px-3 py-1 rounded-full">
                  {speaking ? '⏳ Synthesizing...' : '🔊 Hear Answer & Fact'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3 bg-white/80 border-t border-white/50 flex-shrink-0 backdrop-blur-md">
          {feedback === 'skipped' ? (
            <Button onClick={handleNextRound} size="lg" className={`w-full py-4 text-xl shadow-lg text-white border-none ${gameOverPending ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'}`}>
              {gameOverPending ? 'Final Results 🏁' : 'Keep Going ➡️'}
            </Button>
          ) : (
            <>
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                placeholder="Type your guess..."
                disabled={feedback === 'correct'}
                className={`w-full p-4 text-center text-xl font-bold border-2 rounded-2xl outline-none transition-all placeholder-gray-400 ${feedback === 'correct' ? 'border-green-500 bg-green-50 text-green-700' : 'border-indigo-100 focus:border-indigo-400 bg-white/50 focus:bg-white text-slate-800 shadow-inner'}`}
              />
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleGuess} disabled={!userInput || feedback === 'correct'} className="col-span-2 py-4 text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md border-none">Submit Guess</Button>
                <Button variant="outline" size="sm" onClick={() => setShowHint(true)} disabled={showHint || feedback === 'correct'} className="bg-white/50 border-indigo-200 text-indigo-600 hover:bg-white">Need a Hint?</Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={handleSkip} disabled={feedback === 'correct'}>I Give Up</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};