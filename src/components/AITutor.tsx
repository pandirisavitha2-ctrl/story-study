import React, { useState } from 'react';
import { Upload, BookOpen, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { generateStoryTutorResponse } from '../services/gemini';
import { cn } from '../lib/utils';

export default function AITutor() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const res = await generateStoryTutorResponse(preview);
      setResponse(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h2 className="text-3xl font-bold text-indigo-600 flex items-center justify-center gap-2">
          <Sparkles className="text-amber-400" />
          Your Story Tutor
        </h2>
        <p className="text-gray-600 mt-2">Upload a chapter and let's turn it into a magical story!</p>
      </header>

      <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-indigo-100">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 rounded-2xl p-8 bg-indigo-50/50 hover:bg-indigo-50 transition-colors cursor-pointer relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-64 rounded-lg shadow-md" />
          ) : (
            <div className="text-center">
              <div className="bg-indigo-100 p-4 rounded-full inline-block mb-4">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-indigo-600 font-medium">Click or drag to upload chapter image</p>
              <p className="text-xs text-indigo-400 mt-1">Supports JPG, PNG</p>
            </div>
          )}
        </div>

        {file && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-indigo-200/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <BookOpen className="w-5 h-5" />
                Start the Story!
              </>
            )}
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {response && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-amber-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-24 h-24 text-amber-400" />
            </div>
            <div className="prose prose-indigo max-w-none">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
