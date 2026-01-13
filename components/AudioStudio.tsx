
import React, { useState } from 'react';
import { Button } from './Button';
import { generateSpeech } from '../services/geminiService';
import { playRawAudio } from '../services/audioService';

interface AudioStudioProps {
  onBack: () => void;
}

const VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

export const AudioStudio: React.FC<AudioStudioProps> = ({ onBack }) => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [loading, setLoading] = useState(false);
  const [lastAudio, setLastAudio] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setLastAudio(null);
    
    try {
      const base64Audio = await generateSpeech(text, selectedVoice);
      if (base64Audio) {
        setLastAudio(base64Audio);
        playRawAudio(base64Audio);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate speech. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReplay = () => {
    if (lastAudio) playRawAudio(lastAudio);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack} className="!px-3 !py-2">
          ← Back
        </Button>
        <div className="text-right">
             <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
            Audio Studio
            </h2>
             <p className="text-xs text-gray-400">Powered by Gemini 2.5 Flash TTS</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-6">
        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Script</label>
            <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type something for the AI to say..."
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-50 outline-none transition-all h-32 resize-none text-lg"
            />
        </div>

        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Voice Persona</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
                {VOICES.map(voice => (
                    <button
                        key={voice}
                        onClick={() => setSelectedVoice(voice)}
                        className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap
                            ${selectedVoice === voice 
                                ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm' 
                                : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}
                    >
                        {voice === 'Kore' && '👩‍🚀 '}
                        {voice === 'Puck' && '🧚 '}
                        {voice === 'Charon' && '🧟 '}
                        {voice === 'Fenrir' && '🐺 '}
                        {voice === 'Zephyr' && '🌬️ '}
                        {voice}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
             <Button 
                onClick={handleGenerate} 
                disabled={!text || loading}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 border-none shadow-orange-200"
                size="lg"
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating Audio...
                    </span>
                ) : '🎙️ Generate Speech'}
            </Button>
            
            {lastAudio && (
                 <Button 
                    onClick={handleReplay} 
                    variant="secondary"
                    className="aspect-square flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700"
                 >
                    🔊
                </Button>
            )}
        </div>
      </div>
      
      {/* Visualizer Placeholder */}
      <div className="h-24 bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden relative">
          {loading || lastAudio ? (
              <div className="flex gap-1 items-end h-1/2">
                  {[...Array(20)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1 bg-gradient-to-t from-orange-500 to-yellow-400 rounded-full transition-all duration-100 ${loading ? 'animate-pulse' : 'animate-bounce'}`}
                        style={{ 
                            height: loading ? '30%' : `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.05}s`
                        }}
                      ></div>
                  ))}
              </div>
          ) : (
              <div className="text-gray-600 font-mono text-sm">Ready to synthesize</div>
          )}
      </div>
    </div>
  );
};
