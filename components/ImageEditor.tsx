
import React, { useState } from 'react';
import { Button } from './Button';
import { generateImage, editImage } from '../services/geminiService';

interface ImageEditorProps {
  onBack: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usePro, setUsePro] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (usePro && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            try {
                await (window as any).aistudio.openSelectKey();
            } catch(e) { return; }
        }
    }

    setLoading(true);
    setError(null);
    try {
      const result = await generateImage(prompt, usePro);
      if (result) {
        setCurrentImage(result);
        setPrompt(''); // Clear prompt for next action (edit)
      } else {
        setError("Could not generate image. Please try again.");
      }
    } catch (e) {
      setError("An error occurred during generation.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!prompt.trim() || !currentImage) return;

    if (usePro && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            try {
                await (window as any).aistudio.openSelectKey();
            } catch(e) { return; }
        }
    }

    setLoading(true);
    setError(null);
    try {
      const result = await editImage(currentImage, prompt, usePro);
      if (result) {
        setCurrentImage(result);
        setPrompt('');
      } else {
        setError("Could not edit image. Please try a different instruction.");
      }
    } catch (e) {
      setError("An error occurred during editing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="!px-3 !py-2">
          ← Back to Menu
        </Button>
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
          Creative Studio
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-[400px] flex flex-col">
        {/* Image Display Area */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-4 relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3"></div>
              <p className="text-purple-600 font-medium animate-pulse">
                {currentImage ? "Applying magic..." : "Dreaming up image..."}
              </p>
            </div>
          )}
          
          {currentImage ? (
            <img 
              src={currentImage} 
              alt="Generated content" 
              className="max-w-full max-h-[500px] rounded-lg shadow-lg object-contain"
            />
          ) : (
            <div className="text-center text-gray-400 p-8">
              <div className="text-6xl mb-4">🎨</div>
              <p>Type a prompt to generate an image.</p>
              <p className="text-sm mt-2 opacity-70">"A cute robot holding a flower"</p>
            </div>
          )}
        </div>

        {/* Controls Area */}
        <div className="p-6 bg-white border-t border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
             {/* Model Selector */}
            <div className="flex items-center gap-2 mb-2">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                    <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                        <input 
                            type="checkbox" 
                            name="toggle" 
                            id="toggle" 
                            checked={usePro}
                            onChange={(e) => setUsePro(e.target.checked)}
                            className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer translate-x-1 top-1 transition-transform checked:translate-x-5 checked:border-purple-600"
                            style={{
                                backgroundColor: usePro ? '#9333ea' : 'white',
                                borderColor: usePro ? '#9333ea' : '#e5e7eb'
                            }}
                        />
                        <span className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${usePro ? 'bg-purple-200' : 'bg-gray-200'}`}></span>
                    </div>
                    <span className={`font-bold ${usePro ? 'text-purple-600' : 'text-gray-400'}`}>
                        Pro Mode (High Quality) {usePro && '🍌'}
                    </span>
                </label>
            </div>

            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (currentImage ? handleEdit() : handleGenerate())}
                placeholder={currentImage ? "Edit instruction (e.g., 'Add a retro filter')" : "Describe an image to generate..."}
                className="w-full p-4 pr-12 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                disabled={loading}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-gray-300">
                ✨
              </span>
            </div>

            <div className="flex gap-3">
              {currentImage ? (
                <>
                  <Button 
                    onClick={handleEdit} 
                    disabled={!prompt || loading} 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 border-none"
                  >
                    Edit Image
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => { setCurrentImage(null); setPrompt(''); }}
                    disabled={loading}
                  >
                    Start Over
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleGenerate} 
                  disabled={!prompt || loading} 
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 border-none"
                >
                  Generate
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-400">
        Powered by Gemini 2.5 Flash & 3.0 Pro (Banana)
      </div>
    </div>
  );
};
