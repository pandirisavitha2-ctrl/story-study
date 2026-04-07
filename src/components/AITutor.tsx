import React, { useState, useEffect, useRef } from 'react';
import { Upload, BookOpen, Sparkles, Loader2, History, Trash2, Pause, Volume2, Send, User, Bot, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { generateStoryTutorResponse } from '../services/gemini';
import { cn } from '../lib/utils';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface StoryHistory {
  id: string;
  title: string;
  content: string;
  date: string;
  chatHistory?: ChatMessage[];
}

export default function AITutor() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [language, setLanguage] = useState('English');
  const [history, setHistory] = useState<StoryHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [contentFeedback, setContentFeedback] = useState<'up' | 'down' | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('story_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('story_history', JSON.stringify(history));
  }, [history]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile: File | undefined | null) => {
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
        alert('Please upload an image or a PDF file.');
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    processFile(droppedFile);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSpeak = () => {
    if (!response) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = response.replace(/[#*`]/g, ''); // Clean markdown
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Set language for speech synthesis
    if (language === 'Telugu') utterance.lang = 'te-IN';
    else if (language === 'Hindi') utterance.lang = 'hi-IN';
    else utterance.lang = 'en-US';

    utterance.onend = () => setIsSpeaking(false);
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleSubmit = async () => {
    if (!preview || !file) return;
    setLoading(true);
    setResponse(null);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    try {
      const res = await generateStoryTutorResponse(preview, file.type, undefined, language);
      setResponse(res);
      setChatMessages([{ role: 'model', text: res }]);
      saveToHistory(file.name, res);
    } catch (error: any) {
      console.error(error);
      alert('Error generating content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = (title: string, content: string, chatHistory?: ChatMessage[]) => {
    const newStory: StoryHistory = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      content,
      date: new Date().toLocaleString(),
      chatHistory: chatHistory || [{ role: 'model', text: content }]
    };
    setHistory([newStory, ...history]);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !response || chatLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: chatInput };
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are an AI Tutor. You just provided an explanation/story based on study material. The user is asking follow-up questions. 
          Context of the explanation: ${response}
          Language: ${language}
          Keep your answers helpful, concise, and educational.`
        }
      });

      // Convert our history to Gemini format
      const historyForGemini = chatMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...historyForGemini,
          { role: 'user', parts: [{ text: chatInput }] }
        ],
        config: {
          systemInstruction: `You are an AI Tutor. You just provided an explanation/story based on study material. The user is asking follow-up questions. 
          Context of the explanation: ${response}
          Language: ${language}
          Keep your answers helpful, concise, and educational.`
        }
      });

      const modelText = result.text || "I'm sorry, I couldn't generate a response.";
      setChatMessages(prev => [...prev, { role: 'model', text: modelText }]);
      
      // Update history with new chat messages
      setHistory(prev => prev.map(item => 
        item.content === response ? { ...item, chatHistory: [...newMessages, { role: 'model', text: modelText }] } : item
      ));
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
  };

  const loadFromHistory = (item: StoryHistory) => {
    setResponse(item.content);
    setChatMessages(item.chatHistory || [{ role: 'model', text: item.content }]);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="text-left">
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-amber-400" />
            AI Tutor Studio
          </h2>
          <p className="text-white/70 mt-2">Choose how you want to learn today!</p>
        </div>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className={cn(
            "p-4 rounded-2xl transition-all flex items-center gap-2 font-bold",
            showHistory ? "bg-indigo-600 text-white" : "bg-white/10 text-white shadow-lg border border-white/10 hover:bg-white/20"
          )}
        >
          <History className="w-5 h-5" />
          <span className="hidden sm:inline">History</span>
        </button>
      </header>

      <div className="flex flex-wrap gap-4 p-2 bg-white/5 backdrop-blur-xl rounded-2xl w-fit mx-auto lg:mx-0 border border-white/10">
        <div className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white/10 text-amber-400 shadow-lg">
          <BookOpen className="w-5 h-5" />
          Story Tutor
        </div>
        
        <div className="flex bg-white/5 rounded-xl shadow-sm p-1 border border-white/10">
          {['English', 'Hindi', 'Telugu'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                language === lang ? "bg-indigo-600 text-white" : "text-white/60 hover:bg-white/10"
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black/40 backdrop-blur-2xl p-4 sm:p-6 rounded-3xl shadow-2xl border border-white/10 text-white">
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 sm:p-8 transition-all cursor-pointer relative min-h-[200px]",
                dragging ? "border-white/40 bg-white/10" : "border-white/20 bg-white/5 hover:bg-white/10"
              )}
            >
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {preview ? (
                <div className="relative w-full flex flex-col items-center">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="absolute -top-4 -right-4 bg-rose-500 text-white p-2 rounded-full shadow-lg hover:bg-rose-600 transition-all z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {file?.type === 'application/pdf' ? (
                    <div className="flex flex-col items-center gap-2 p-8 text-indigo-600">
                      <BookOpen className="w-16 h-16" />
                      <p className="font-bold text-center break-all">{file.name}</p>
                    </div>
                  ) : (
                    <div className="relative group">
                      <img src={preview} alt="Preview" className="max-h-64 rounded-xl shadow-2xl border-4 border-white" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <p className="text-white font-bold text-sm">Click to change</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center pointer-events-none">
                  <div className="bg-white/10 p-6 rounded-full inline-block mb-4">
                    <Upload className={cn("w-10 h-10 text-indigo-400 transition-transform", dragging && "scale-110")} />
                  </div>
                  <h4 className="text-white font-black text-lg mb-1">Drop your study material here</h4>
                  <p className="text-white/70 font-medium">or click to browse from your device</p>
                  <p className="text-xs text-white/40 mt-4 font-bold uppercase tracking-widest">Supports JPG, PNG, PDF</p>
                </div>
              )}
            </div>

            {file && (
              <div className="space-y-4">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <BookOpen className="w-5 h-5" />
                      Generate Explanation
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {response && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/40 backdrop-blur-3xl p-4 sm:p-8 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden text-white"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                    AI Explanation
                  </h3>
                  <button
                    onClick={handleSpeak}
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold transition-all w-full sm:w-auto",
                      isSpeaking ? "bg-rose-500/20 text-rose-400" : "bg-indigo-500/20 text-indigo-400"
                    )}
                  >
                    {isSpeaking ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    {isSpeaking ? 'Stop' : 'Listen'}
                  </button>
                </div>

                <div className="prose prose-invert prose-indigo max-w-none mb-6">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>

                <div className="flex items-center gap-4 mb-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-sm font-bold text-white/40 uppercase tracking-widest">Was this helpful?</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setContentFeedback('up')}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        contentFeedback === 'up' ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-white/10 text-white/40"
                      )}
                    >
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setContentFeedback('down')}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        contentFeedback === 'down' ? "bg-rose-500/20 text-rose-400" : "hover:bg-white/10 text-white/40"
                      )}
                    >
                      <ThumbsDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-8 mt-8">
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-indigo-400" />
                    Follow-up Chat
                  </h4>
                  
                  <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex gap-3 max-w-[85%]",
                          msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          msg.role === 'user' ? "bg-indigo-600" : "bg-white/10"
                        )}>
                          {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={cn(
                          "p-4 rounded-2xl text-sm leading-relaxed",
                          msg.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white/5 text-white/90 border border-white/10 rounded-tl-none"
                        )}>
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex gap-3 mr-auto">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10">
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask a follow-up question..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-14 outline-none focus:border-indigo-500 transition-all text-white"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={chatLoading || !chatInput.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-black/40 backdrop-blur-3xl p-6 rounded-3xl shadow-2xl border border-white/10 h-fit lg:sticky lg:top-24 text-white"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <History className="text-indigo-500" />
                Past Sessions
              </h3>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {history.length === 0 ? (
                  <p className="text-center py-8 text-gray-400 text-sm">No history yet.</p>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all group cursor-pointer"
                      onClick={() => loadFromHistory(item)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2 flex-1 truncate">
                          <BookOpen className="w-3 h-3 text-amber-500" />
                          <h4 className="font-bold text-white text-sm truncate">{item.title}</h4>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHistoryItem(item.id);
                          }}
                          className="text-gray-300 hover:text-rose-500 transition-colors ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{item.date}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
