import React, { useState, useRef } from 'react';
import { Mic, MicOff, Loader2, FileText, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';

export default function AudioTranscriber() {
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: {
            parts: [
              { text: "Please transcribe this audio accurately. If it's a student asking a question, format it clearly." },
              { inlineData: { data: base64Data, mimeType: "audio/webm" } }
            ]
          }
        });
        setTranscript(response.text || "No speech detected.");
      };
    } catch (err) {
      console.error(err);
      setError("Transcription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h2 className="text-3xl font-bold text-amber-600 flex items-center justify-center gap-2">
          <FileText className="text-amber-500" />
          Audio Notes
        </h2>
        <p className="text-gray-600 mt-2">Record your thoughts or lectures and let AI transcribe them!</p>
      </header>

      <div className="flex flex-col items-center space-y-8">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={loading}
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all border-4 border-white",
            isRecording ? "bg-rose-500 animate-pulse" : "bg-amber-500 hover:bg-amber-600",
            loading && "opacity-50 cursor-not-allowed"
          )}
        >
          {loading ? (
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-10 h-10 text-white" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </button>

        <div className="text-center">
          <h3 className="text-xl font-black text-gray-900">
            {loading ? "Transcribing..." : isRecording ? "Recording..." : "Tap to Record"}
          </h3>
        </div>

        {error && (
          <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 font-bold">
            <AlertCircle />
            {error}
          </div>
        )}

        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-amber-100 relative"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-12 h-12 text-amber-400" />
            </div>
            <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-4">Transcription</h4>
            <p className="text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
              {transcript}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
