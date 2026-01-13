import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { generateVideo } from '../services/geminiService';

interface VideoStudioProps {
  onBack: () => void;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [selectedImage, setSelectedImage] = useState<{ preview: string, base64: string, mimeType: string } | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // Extract base64 and mime type
        const base64Data = result.split(',')[1];
        const mimeType = result.split(';')[0].split(':')[1];
        
        setSelectedImage({
          preview: result,
          base64: base64Data,
          mimeType: mimeType
        });
        setGeneratedVideoUrl(null); // Reset previous video
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !selectedImage) return;

    // API Key Check for Veo
    if ((window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        try {
          await (window as any).aistudio.openSelectKey();
          // We assume success and proceed, or we could check again.
          // The service instantiates a new client to catch the key.
        } catch (e) {
          setError("API Key selection failed. Please try again.");
          return;
        }
      }
    }

    setLoading(true);
    setError(null);
    setStatus('Initializing Veo engine...');
    setGeneratedVideoUrl(null);

    try {
      const startMs = Date.now();
      const progressInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startMs) / 1000);
        setStatus(`Generating video... (${elapsed}s)`);
      }, 1000);

      const videoUrl = await generateVideo(
        prompt, 
        aspectRatio, 
        selectedImage ? { base64: selectedImage.base64, mimeType: selectedImage.mimeType } : undefined
      );

      clearInterval(progressInterval);
      
      if (videoUrl) {
        setGeneratedVideoUrl(videoUrl);
        setStatus('Video generated!');
      } else {
        setError("Generation failed to produce a video URL.");
      }
    } catch (e) {
      console.error(e);
      setError("An error occurred during video generation. Please check your API key and quota.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
       <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" onClick={onBack} className="!px-3 !py-2">
          ← Back to Menu
        </Button>
        <div className="text-right">
             <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Veo Video Studio
            </h2>
             <p className="text-xs text-gray-400">Powered by veo-3.1-fast-generate-preview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls Column */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 block">1. What should happen?</label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the video (e.g., 'A cyberpunk city in the rain' or 'The character waves hello')..."
                        className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 outline-none transition-all h-32 resize-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 block">2. Starting Image (Optional)</label>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors relative overflow-hidden h-40 flex items-center justify-center
                            ${selectedImage ? 'border-cyan-500 bg-cyan-50' : 'border-gray-300 hover:border-cyan-400 hover:bg-gray-50'}`}
                    >
                        {selectedImage ? (
                            <img src={selectedImage.preview} alt="Start frame" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        ) : (
                            <div className="text-gray-400">
                                <span className="text-2xl block mb-2">📷</span>
                                <span className="text-sm">Click to upload photo</span>
                            </div>
                        )}
                        {selectedImage && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white font-bold drop-shadow-md">
                                Change Image
                            </div>
                        )}
                    </div>
                    <input 
                        ref={fileInputRef} 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileSelect} 
                        className="hidden" 
                    />
                    {selectedImage && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                            className="text-xs text-red-500 font-medium hover:underline block text-right"
                        >
                            Remove Image
                        </button>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 block">3. Aspect Ratio</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setAspectRatio('16:9')}
                            className={`p-3 rounded-xl border-2 font-medium transition-all ${aspectRatio === '16:9' ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                        >
                            Landscape (16:9)
                        </button>
                        <button
                            onClick={() => setAspectRatio('9:16')}
                            className={`p-3 rounded-xl border-2 font-medium transition-all ${aspectRatio === '9:16' ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                        >
                            Portrait (9:16)
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <Button 
                    onClick={handleGenerate} 
                    disabled={loading || (!prompt && !selectedImage)}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 shadow-cyan-200 hover:shadow-cyan-300 border-none"
                    size="lg"
                >
                    {loading ? 'Generating...' : '🎬 Generate Video'}
                </Button>
                <div className="text-center text-xs text-gray-400 px-4">
                    Requires a paid API key via Google Cloud.
                    <br />
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-cyan-600">
                        Check billing info
                    </a>
                </div>
            </div>
        </div>

        {/* Preview Column */}
        <div className="bg-black rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center relative min-h-[400px] lg:h-auto border-4 border-gray-900">
            {loading ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-900 z-10 p-8 text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                    <p className="text-xl font-bold animate-pulse text-cyan-400">Creating Magic</p>
                    <p className="text-gray-400 mt-2 text-sm max-w-xs">{status}</p>
                    <p className="text-gray-600 text-xs mt-8">This may take 1-2 minutes.</p>
                </div>
            ) : generatedVideoUrl ? (
                <div className="w-full h-full flex items-center justify-center bg-black">
                     <video 
                        src={generatedVideoUrl} 
                        controls 
                        autoPlay 
                        loop 
                        className={`max-w-full max-h-full ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'}`}
                    />
                </div>
            ) : (
                <div className="text-center text-gray-700 p-8">
                    <div className="text-6xl mb-4 opacity-50">🍿</div>
                    <p className="text-gray-500 font-medium">Your masterpiece will appear here</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};