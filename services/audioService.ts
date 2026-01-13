let audioCtx: AudioContext | null = null;
let isMuted = localStorage.getItem('emoji_muted') === 'true';

const getCtx = (sampleRate: number = 24000) => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
  } else if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const toggleMute = () => {
    isMuted = !isMuted;
    localStorage.setItem('emoji_muted', isMuted.toString());
    return isMuted;
};

export const getMuteState = () => isMuted;

const playTone = (
  freq: number, 
  type: 'sine' | 'square' | 'triangle' | 'sawtooth', 
  duration: number, 
  startTime: number = 0, 
  vol: number = 0.1
) => {
  if (isMuted) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
  
  gain.gain.setValueAtTime(vol, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration);
};

export const playCorrect = () => {
  playTone(523.25, 'sine', 0.1, 0, 0.1); // C5
  playTone(659.25, 'sine', 0.1, 0.1, 0.1); // E5
  playTone(783.99, 'sine', 0.3, 0.2, 0.1); // G5
};

export const playIncorrect = () => {
  playTone(150, 'sawtooth', 0.1, 0, 0.1);
  playTone(100, 'sawtooth', 0.3, 0.1, 0.1);
};

export const playGameOver = () => {
  playTone(392.00, 'triangle', 0.3, 0, 0.1); // G4
  playTone(369.99, 'triangle', 0.3, 0.3, 0.1); // F#4
  playTone(349.23, 'triangle', 0.3, 0.6, 0.1); // F4
  playTone(293.66, 'triangle', 0.8, 0.9, 0.1); // D4
};

export const playPop = () => {
  playTone(800, 'sine', 0.05, 0, 0.05);
};

export const playSuccess = () => {
    playTone(880, 'sine', 0.1, 0, 0.05);
    playTone(1108, 'sine', 0.2, 0.1, 0.05);
}

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const playRawAudio = async (base64String: string, sampleRate: number = 24000) => {
  if (isMuted) return;
  try {
    const ctx = getCtx(sampleRate);
    const bytes = decodeBase64(base64String);
    const audioBuffer = await decodeAudioData(bytes, ctx, sampleRate);
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start();
    
    return source;
  } catch (e) {
    console.error("Error playing raw audio:", e);
  }
};