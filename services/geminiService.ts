import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Puzzle, ChatMessage, Difficulty, Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- ROBUST FALLBACK CONTENT ---
const FALLBACK_PUZZLES: Record<Category, Puzzle[]> = {
    'Countries': [
        { answer: "Thailand", emojis: "🇹🇭🍜🏝️", hint: "Land of Smiles", explanation: "Known for beautiful beaches and spicy food.", funFact: "Thailand is the only Southeast Asian nation never colonized by Europeans." },
        { answer: "Japan", emojis: "🇯🇵🍣🏯", hint: "Land of the Rising Sun", explanation: "Famous for sushi and cherry blossoms.", funFact: "Japan has over 5.5 million vending machines!" }
    ],
    'Food': [
        { answer: "Pizza", emojis: "🇮🇹🍕🧀", hint: "Dough, sauce, cheese", explanation: "A global favorite from Italy.", funFact: "The most expensive pizza in the world costs $12,000!" }
    ],
    'Bible': [
        { answer: "Noah's Ark", emojis: "🕊️🌈🚢", hint: "A giant boat with animals", explanation: "Built to survive a great flood.", funFact: "Noah was reportedly 600 years old when the flood started." }
    ],
    'Movies': [
        { answer: "The Lion King", emojis: "🦁👑🌅", hint: "A young prince finds his way", explanation: "An animated classic about Simba.", funFact: "The roar of the lions in the film was actually provided by voice actor Frank Welker using a trash can." }
    ],
    'Animals': [
        { answer: "Penguin", emojis: "🐧❄️🧊", hint: "A flightless bird in a tuxedo", explanation: "Lives in Antarctica.", funFact: "Penguins can spend up to 75% of their lives in the water." }
    ],
    'Stories': [
        { answer: "Alice in Wonderland", emojis: "🐇🕳️🍵", hint: "Follow the white rabbit", explanation: "A girl falls into a world of madness.", funFact: "Lewis Carroll, the author, suffered from a condition that made things appear larger or smaller than they were." }
    ]
};

const getFallback = (category: Category): Puzzle[] => {
    return FALLBACK_PUZZLES[category] || FALLBACK_PUZZLES['Countries'];
};

const PUZZLE_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      answer: { type: Type.STRING },
      emojis: { type: Type.STRING },
      hint: { type: Type.STRING },
      explanation: { type: Type.STRING },
      funFact: { type: Type.STRING }
    },
    required: ["answer", "emojis", "hint", "explanation", "funFact"],
  },
};

const SOCIAL_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      sender: { type: Type.STRING },
      avatar: { type: Type.STRING },
      text: { type: Type.STRING },
      type: { type: Type.STRING, enum: ["chat", "score", "challenge"] },
      puzzleEmojis: { type: Type.STRING },
      puzzleAnswer: { type: Type.STRING }
    },
    required: ["sender", "avatar", "text", "type"]
  }
};

export const fetchPuzzles = async (count: number = 5, difficulty: Difficulty = 'easy', category: Category = 'Countries'): Promise<Puzzle[]> => {
  try {
    const prompt = `Generate ${count} unique "emoji charades" puzzles for category: ${category}. Difficulty: ${difficulty}. Puzzles should be clever. Return JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: PUZZLE_SCHEMA,
      },
    });

    const jsonText = response.text;
    if (!jsonText) return getFallback(category);
    
    return JSON.parse(jsonText) as Puzzle[];
  } catch (error) {
    console.error("Gemini Error - Falling back to local content:", error);
    return getFallback(category);
  }
};

export const fetchSocialUpdates = async (): Promise<ChatMessage[]> => {
  try {
    const prompt = `Generate 4 social feed items for an emoji trivia app. Mix chat and score updates. Strict JSON.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: SOCIAL_SCHEMA,
      },
    });

    const rawData = JSON.parse(response.text || "[]");
    return rawData.map((item: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      sender: item.sender,
      avatar: item.avatar,
      text: item.text,
      timestamp: 'Just now',
      type: item.type,
      puzzleData: item.type === 'challenge' ? {
        emojis: item.puzzleEmojis,
        answer: item.puzzleAnswer
      } : undefined
    }));
  } catch (error) {
    return [];
  }
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string | null> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
          },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (error) {
      return null;
    }
};

export const generateProEmojiImage = async (emojis: string): Promise<string | null> => {
    try {
        const freshAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `3D rendered high-quality composition of these emojis: ${emojis}. Style: Claymorphism, isolated on white background.`;
        const response = await freshAi.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { imageSize: '1K', aspectRatio: '1:1' } }
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        return null;
    } catch (error) { 
        console.error("Pro Image Fail:", error);
        return null; 
    }
};

export const generateImage = async (prompt: string, usePro: boolean): Promise<string | null> => null;
export const editImage = async (image: string, prompt: string, usePro: boolean): Promise<string | null> => null;
export const generateVideo = async (prompt: string, aspectRatio: string, image?: {base64: string, mimeType: string}): Promise<string | null> => null;