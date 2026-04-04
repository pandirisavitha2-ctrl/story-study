import React, { useState, useEffect } from 'react';
import { Video, Sparkles, Loader2, Play, AlertCircle, Key } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function VideoTutor() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    }
  };

  const handleOpenKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt: `A student-friendly educational animation about: ${prompt}. Colorful, vibrant, and simple.`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': process.env.GEMINI_API_KEY || "",
          },
        });
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        setError("Please select a valid paid API key to use Video generation.");
      } else {
        setError("Failed to generate video. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="bg-amber-100 p-6 rounded-full">
          <Key className="w-12 h-12 text-amber-600" />
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Paid API Key Required</h2>
          <p className="text-gray-500 mb-6">
            Video generation requires a paid Google Cloud project. Please select your API key to continue.
            <br />
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-indigo-600 underline text-sm">Learn about billing</a>
          </p>
          <button
            onClick={handleOpenKey}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all"
          >
            Select API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h2 className="text-3xl font-bold text-violet-600 flex items-center justify-center gap-2">
          <Video className="text-violet-500" />
          Video Tutor
        </h2>
        <p className="text-gray-600 mt-2">Generate magical educational animations from your ideas!</p>
      </header>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-violet-100">
        <div className="space-y-4">
          <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">What should the video be about?</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-6 bg-violet-50/50 border-2 border-transparent focus:border-violet-500 rounded-3xl outline-none transition-all min-h-[120px] font-medium text-lg"
            placeholder="e.g. How photosynthesis works in a magical forest..."
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:shadow-violet-200/50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Creating Magic... (this may take a minute)
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Generate Animation
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 font-bold">
          <AlertCircle />
          {error}
        </div>
      )}

      {videoUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black rounded-[2.5rem] overflow-hidden shadow-2xl aspect-video relative group"
        >
          <video src={videoUrl} controls className="w-full h-full" autoPlay loop />
        </motion.div>
      )}
    </div>
  );
}
