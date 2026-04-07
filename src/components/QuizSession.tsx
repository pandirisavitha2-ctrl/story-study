import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Brain, Trophy, ArrowRight, CheckCircle2, XCircle, AlertCircle, History, Trash2, Upload, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from '../lib/utils';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizResult {
  id: string;
  subject: string;
  score: number;
  total: number;
  date: string;
  feedback: string;
}

export default function QuizSession() {
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [brutalFeedback, setBrutalFeedback] = useState('');
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('quiz_results') || '[]');
    setHistory(saved);
  }, []);

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

  const generateQuiz = async () => {
    if (!subject && !file) return;
    setLoading(true);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      let contents: any;
      if (preview && file) {
        contents = {
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: preview.split(',')[1]
              }
            },
            {
              text: `Generate a 5-question multiple choice quiz based on the provided content. ${subject ? `Focus on the topic: "${subject}".` : ''} 
              Make the questions challenging. 
              Return the response in JSON format.`
            }
          ]
        };
      } else {
        contents = `Generate a 5-question multiple choice quiz about "${subject}". 
        Make the questions challenging. 
        Return the response in JSON format.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Exactly 4 options"
                },
                correctAnswer: { 
                  type: Type.INTEGER,
                  description: "Index of the correct option (0-3)"
                },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      setQuestions(data);
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    setLoading(true);
    const score = questions.reduce((acc, q, i) => acc + (q.correctAnswer === finalAnswers[i] ? 1 : 0), 0);
    const percentage = Math.round((score / questions.length) * 100);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const feedbackResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `The student scored ${score}/${questions.length} (${percentage}%) on a quiz about "${subject}". 
        Provide a "brutal" and honest assessment of their performance. 
        If they did well, be encouraging but firm. If they did poorly, be blunt about their lack of preparation. 
        Keep it under 3 sentences.`,
      });

      const feedback = feedbackResponse.text;
      setBrutalFeedback(feedback);

      const result: QuizResult = {
        id: Math.random().toString(36).substr(2, 9),
        subject,
        score: percentage,
        total: questions.length,
        date: new Date().toLocaleString(),
        feedback
      };

      const newHistory = [result, ...history];
      setHistory(newHistory);
      localStorage.setItem('quiz_results', JSON.stringify(newHistory));
      setShowResult(true);
    } catch (error) {
      console.error("Failed to get feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('quiz_results', JSON.stringify(newHistory));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div className="text-left">
          <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Brain className="text-amber-500 w-10 h-10" />
            Quiz Challenge
          </h2>
          <p className="text-white/70 text-lg mt-1">Test your limits and face the brutal truth.</p>
        </div>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className={cn(
            "p-4 rounded-2xl transition-all flex items-center gap-2 font-bold",
            showHistory ? "bg-amber-600 text-white" : "bg-white text-amber-600 shadow-lg border-2 border-amber-50"
          )}
        >
          <History className="w-5 h-5" />
          <span className="hidden sm:inline">History</span>
        </button>
      </header>

      <div className="bg-black/40 backdrop-blur-3xl p-4 sm:p-8 rounded-[3rem] shadow-2xl border border-white/10 min-h-[400px] flex flex-col relative overflow-hidden text-white">
        <AnimatePresence mode="wait">
          {showHistory ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white">Past Results</h3>
                <button onClick={() => setShowHistory(false)} className="text-amber-600 font-bold">Back to Quiz</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {history.length === 0 ? (
                  <p className="text-center py-12 text-gray-400 font-bold">No quiz history yet. Take a challenge!</p>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="p-6 rounded-3xl border-2 border-amber-50 bg-amber-50/30 flex justify-between items-center group">
                      <div className="space-y-1">
                        <h4 className="font-black text-lg text-white">{item.subject}</h4>
                        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">{item.date}</p>
                        <p className="text-sm text-white/60 italic max-w-md">"{item.feedback}"</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className={cn(
                            "text-3xl font-black",
                            item.score >= 80 ? "text-emerald-500" : item.score >= 50 ? "text-amber-500" : "text-rose-500"
                          )}>
                            {item.score}%
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteHistoryItem(item.id)}
                          className="text-gray-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          ) : questions.length === 0 ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col items-center justify-center space-y-8"
            >
              <div className="bg-amber-100 p-8 rounded-full">
                <Sparkles className="w-16 h-16 text-amber-500" />
              </div>
              
              <div className="w-full max-w-md space-y-6">
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-8 transition-all cursor-pointer relative min-h-[160px]",
                    dragging ? "border-amber-500 bg-amber-500/10" : "border-white/20 bg-white/5 hover:bg-white/10"
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
                        <div className="flex flex-col items-center gap-2 p-4 text-amber-500">
                          <FileText className="w-12 h-12" />
                          <p className="font-bold text-center text-sm break-all">{file.name}</p>
                        </div>
                      ) : (
                        <div className="relative group">
                          <img src={preview} alt="Preview" className="max-h-32 rounded-xl shadow-2xl border-2 border-white/20" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center pointer-events-none">
                      <div className="bg-amber-500/10 p-4 rounded-full inline-block mb-2">
                        <Upload className={cn("w-8 h-8 text-amber-500 transition-transform", dragging && "scale-110")} />
                      </div>
                      <h4 className="text-white font-black text-sm mb-1">Upload study material</h4>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-widest">JPG, PNG, PDF</p>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm font-black uppercase tracking-widest">
                    <span className="bg-black/40 px-4 text-white/40">OR</span>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Enter subject or topic"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-8 py-5 bg-white/5 border-2 border-white/10 focus:border-amber-500 rounded-3xl outline-none transition-all font-bold text-xl text-center text-white"
                />
                <button
                  onClick={generateQuiz}
                  disabled={loading || (!subject && !file)}
                  className="w-full bg-amber-500 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-amber-100 hover:bg-amber-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Brain className="w-6 h-6" />}
                  {loading ? "Generating Quiz..." : "Start Challenge"}
                </button>
              </div>
            </motion.div>
          ) : showResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center space-y-8 text-center"
            >
              <div className="relative">
                {/* Simulated Confetti */}
                {Math.round((answers.reduce((acc, a, i) => acc + (questions[i].correctAnswer === a ? 1 : 0), 0) / questions.length) * 100) >= 80 && (
                  <div className="absolute inset-0 pointer-events-none overflow-visible">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                        animate={{ 
                          opacity: 0, 
                          y: (Math.random() - 0.5) * 400, 
                          x: (Math.random() - 0.5) * 400,
                          rotate: Math.random() * 360,
                          scale: 0
                        }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="absolute top-1/2 left-1/2 w-3 h-3 rounded-sm"
                        style={{ backgroundColor: ['#6366f1', '#f43f5e', '#fbbf24', '#10b981'][i % 4] }}
                      />
                    ))}
                  </div>
                )}
                <div className={cn(
                  "w-48 h-48 rounded-full flex items-center justify-center shadow-2xl relative z-10",
                  (answers.reduce((acc, a, i) => acc + (questions[i].correctAnswer === a ? 1 : 0), 0) / questions.length) >= 0.8 
                    ? "bg-emerald-100 text-emerald-600" 
                    : "bg-rose-100 text-rose-600"
                )}>
                  <Trophy className="w-24 h-24" />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl px-6 py-2 rounded-full shadow-lg border border-white/20 font-black text-2xl text-white z-20">
                  {Math.round((answers.reduce((acc, a, i) => acc + (questions[i].correctAnswer === a ? 1 : 0), 0) / questions.length) * 100)}%
                </div>
              </div>

              <div className="space-y-4 max-w-lg">
                <h3 className="text-3xl font-black text-white">The Brutal Truth</h3>
                <p className="text-xl text-white/70 font-medium leading-relaxed italic">
                  "{brutalFeedback}"
                </p>
              </div>

              <div className="w-full max-w-2xl space-y-4">
                <h4 className="text-left font-black text-white/40 uppercase tracking-widest text-sm">Review Answers</h4>
                <div className="space-y-3">
                  {questions.map((q, i) => (
                    <div key={i} className={cn(
                      "p-4 rounded-2xl border-2 text-left flex items-start gap-4",
                      answers[i] === q.correctAnswer ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
                    )}>
                      {answers[i] === q.correctAnswer ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1" /> : <XCircle className="w-5 h-5 text-rose-500 mt-1" />}
                      <div className="space-y-1">
                        <p className="font-bold text-white">{q.question}</p>
                        <p className="text-sm text-white/50">{q.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={generateQuiz}
                  className="bg-amber-500 text-white px-12 py-5 rounded-3xl font-black text-xl shadow-xl shadow-amber-100 hover:bg-amber-600 transition-all flex items-center gap-3"
                >
                  Retry Subject
                  <Sparkles className="w-6 h-6" />
                </button>
                <button
                  onClick={() => {
                    setQuestions([]);
                    setShowResult(false);
                  }}
                  className="bg-gray-900 text-white px-12 py-5 rounded-3xl font-black text-xl shadow-xl hover:bg-gray-800 transition-all flex items-center gap-3"
                >
                  New Subject
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Question {currentQuestion + 1} of {questions.length}</span>
                  <h3 className="text-2xl font-black text-white">{questions[currentQuestion].question}</h3>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 flex items-center justify-center font-black text-amber-500">
                  {currentQuestion + 1}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {questions[currentQuestion].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className="group text-left p-6 rounded-3xl border-2 border-white/10 bg-white/5 hover:border-amber-500 hover:bg-amber-500/10 transition-all flex items-center justify-between"
                  >
                    <span className="font-bold text-lg text-white group-hover:text-amber-500">{option}</span>
                    <div className="w-8 h-8 rounded-full border-2 border-white/20 group-hover:border-amber-500 flex items-center justify-center font-black text-white/40 group-hover:text-amber-500">
                      {String.fromCharCode(65 + i)}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-8 flex items-center gap-2">
                <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-black text-white/40">{Math.round(((currentQuestion) / questions.length) * 100)}%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
