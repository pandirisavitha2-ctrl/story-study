import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Loader2, AlertCircle, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Modality } from "@google/genai";
import { cn } from '../lib/utils';

export default function LiveTutor() {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are a friendly, vibrant personal tutor for students. Speak simply and encouragingly. Use a story-like tone when explaining concepts.",
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            startStreaming();
          },
          onmessage: async (message) => {
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              playAudio(message.serverContent.modelTurn.parts[0].inlineData.data);
            }
            if (message.serverContent?.modelTurn?.parts[0]?.text) {
              setTranscript(prev => [...prev, { role: 'model', text: message.serverContent!.modelTurn!.parts[0].text! }]);
            }
            if (message.serverContent?.interrupted) {
              stopAudio();
            }
          },
          onerror: (err) => {
            console.error(err);
            setError("Connection error. Please try again.");
            stopSession();
          },
          onclose: () => {
            stopSession();
          }
        }
      });
      sessionRef.current = session;
    } catch (err) {
      console.error(err);
      setError("Failed to start voice session. Check microphone permissions.");
      setIsConnecting(false);
    }
  };

  const startStreaming = async () => {
    if (!streamRef.current || !sessionRef.current) return;
    
    const source = audioContextRef.current!.createMediaStreamSource(streamRef.current);
    const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
    
    source.connect(processor);
    processor.connect(audioContextRef.current!.destination);
    
    processor.onaudioprocess = (e) => {
      if (!isActive) return;
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
      }
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
      sessionRef.current.sendRealtimeInput({
        audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
      });
    };
  };

  const playAudio = async (base64Data: string) => {
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const pcmData = new Int16Array(bytes.buffer);
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) floatData[i] = pcmData[i] / 0x7FFF;
    
    const buffer = audioContextRef.current!.createBuffer(1, floatData.length, 24000);
    buffer.getChannelData(0).set(floatData);
    const source = audioContextRef.current!.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current!.destination);
    source.start();
  };

  const stopAudio = () => {
    // Implementation for stopping current audio playback
  };

  const stopSession = () => {
    setIsActive(false);
    setIsConnecting(false);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    if (sessionRef.current) sessionRef.current.close();
    sessionRef.current = null;
  };

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h2 className="text-3xl font-bold text-emerald-600 flex items-center justify-center gap-2">
          <Volume2 className="text-emerald-500" />
          Voice Tutor
        </h2>
        <p className="text-gray-600 mt-2">Have a real-time conversation with your AI tutor!</p>
      </header>

      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0.2 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 bg-emerald-400 rounded-full"
              />
            )}
          </AnimatePresence>
          
          <button
            onClick={isActive ? stopSession : startSession}
            disabled={isConnecting}
            className={cn(
              "relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all border-8 border-white",
              isActive ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600",
              isConnecting && "opacity-50 cursor-not-allowed"
            )}
          >
            {isConnecting ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : isActive ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </button>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-black text-gray-900">
            {isConnecting ? "Connecting..." : isActive ? "Listening & Speaking" : "Tap to Start Talking"}
          </h3>
          <p className="text-gray-500 mt-1">
            {isActive ? "Go ahead, ask me anything about your studies!" : "Your tutor is ready to chat."}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 font-bold">
            <AlertCircle />
            {error}
          </div>
        )}

        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-xl border-4 border-emerald-50 overflow-hidden">
          <div className="p-4 border-b-2 border-emerald-50 bg-emerald-50/30 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span className="font-black text-emerald-600 uppercase tracking-widest text-xs">Live Transcript</span>
          </div>
          <div className="h-64 overflow-y-auto p-6 space-y-4">
            {transcript.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-300 italic">
                Transcript will appear here...
              </div>
            ) : (
              transcript.map((t, i) => (
                <div key={i} className={cn("flex", t.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl font-medium",
                    t.role === 'user' ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"
                  )}>
                    {t.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
