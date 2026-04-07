import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, Target, Loader2, Upload, Trash2, ArrowRight, Sparkles, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { generateStudyRoadmap } from '../services/gemini';
import { cn } from '../lib/utils';
import FlowChart from './FlowChart';

type Step = 'setup' | 'upload' | 'generating' | 'result';

interface FilePreview {
  name: string;
  data: string;
  mimeType: string;
}

export default function StudyRoadmap() {
  const [step, setStep] = useState<Step>('setup');
  const [subjects, setSubjects] = useState(1);
  const [examDate, setExamDate] = useState('');
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [roadmapData, setRoadmapData] = useState<any[] | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('study_roadmaps') || '[]');
    setHistory(saved);
  }, [step]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  };

  const processFiles = (selectedFiles: File[]) => {
    selectedFiles.forEach(file => {
      if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
        alert('Please upload PDF or Image files only.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles(prev => [...prev, {
          name: file.name,
          data: reader.result as string,
          mimeType: file.type
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (files.length === 0) return;
    setStep('generating');
    setLoading(true);
    try {
      const result = await generateStudyRoadmap(subjects, examDate, files, (text) => {
        const cleanStreamingText = text
          .replace(/```roadmap-json\s*[\s\S]*?\s*```/g, '')
          .replace(/```roadmap-json\s*[\s\S]*/g, '')
          .trim();
        setRoadmap(cleanStreamingText);
        if (step !== 'result') setStep('result');
      });
      
      // Extract JSON data
      const jsonMatch = result.match(/```roadmap-json\s*([\s\S]*?)\s*```/);
      let jsonData = null;
      if (jsonMatch) {
        try {
          jsonData = JSON.parse(jsonMatch[1]);
          setRoadmapData(jsonData);
        } catch (e) {
          console.error("Failed to parse roadmap JSON", e);
        }
      }

      // Clean markdown
      const cleanRoadmap = result.replace(/```roadmap-json\s*[\s\S]*?\s*```/g, '').trim();
      setRoadmap(cleanRoadmap);
      
      // Save to history
      const savedRoadmaps = JSON.parse(localStorage.getItem('study_roadmaps') || '[]');
      const newRoadmap = {
        id: Math.random().toString(36).substr(2, 9),
        subjects,
        examDate,
        content: cleanRoadmap,
        jsonData: jsonData,
        date: new Date().toLocaleString()
      };
      localStorage.setItem('study_roadmaps', JSON.stringify([newRoadmap, ...savedRoadmaps]));
      
      setStep('result');
    } catch (error) {
      console.error(error);
      alert('Failed to generate roadmap. Please try again.');
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center space-y-2 relative">
        <h2 className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-3">
          <Target className="text-rose-500 w-10 h-10" />
          Academic Strategist
        </h2>
        <p className="text-white/70 text-lg">Create a zero-gap study roadmap in seconds.</p>
        
        {history.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="absolute right-0 top-0 p-3 bg-white/5 border border-white/10 rounded-2xl text-rose-400 font-bold shadow-sm hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <History className="w-5 h-5" />
            <span className="hidden sm:inline">History</span>
          </button>
        )}
      </header>

      <div className="bg-black/40 backdrop-blur-3xl p-4 sm:p-8 rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden relative text-white">
        <AnimatePresence mode="wait">
          {showHistory ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white">Past Roadmaps</h3>
                <button onClick={() => setShowHistory(false)} className="text-rose-400 font-bold">Back to Creator</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setRoadmap(item.content);
                      setRoadmapData(item.jsonData || null);
                      setStep('result');
                      setShowHistory(false);
                    }}
                    className="text-left p-6 rounded-3xl border border-white/10 hover:border-rose-500/50 bg-white/5 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-lg text-white">{item.subjects} Subjects Plan</h4>
                        <p className="text-sm text-white/50">Exam Date: {item.examDate}</p>
                      </div>
                      <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">{item.date}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : step === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-white/40 uppercase tracking-widest ml-2">How many subjects?</label>
                  <input
                    type="number"
                    min="1"
                    value={subjects}
                    onChange={(e) => setSubjects(parseInt(e.target.value))}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 focus:border-rose-500 rounded-2xl outline-none transition-all font-bold text-xl text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-white/40 uppercase tracking-widest ml-2">When is your exam?</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 focus:border-rose-500 rounded-2xl outline-none transition-all font-bold text-xl text-white"
                  />
                </div>
              </div>
              <button
                onClick={() => setStep('upload')}
                disabled={!examDate}
                className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-rose-500/20 hover:bg-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Next Step
                <ArrowRight className="w-6 h-6" />
              </button>
            </motion.div>
          )}

          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); processFiles(Array.from(e.dataTransfer.files)); }}
                className={cn(
                  "border-4 border-dashed rounded-[2rem] p-12 text-center transition-all relative cursor-pointer",
                  dragging ? "border-rose-500 bg-rose-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                )}
              >
                <input
                  type="file"
                  multiple
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="bg-rose-500/20 p-6 rounded-full inline-block mb-4">
                  <Upload className="w-10 h-10 text-rose-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Upload Syllabus / Textbooks</h3>
                <p className="text-white/40">Drop your PDFs here to analyze the content.</p>
              </div>

              {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-3 truncate">
                        <BookOpen className="w-5 h-5 text-rose-400 flex-shrink-0" />
                        <span className="font-bold text-white truncate">{file.name}</span>
                      </div>
                      <button onClick={() => removeFile(i)} className="text-rose-400 hover:text-rose-600">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('setup')}
                  className="flex-1 bg-white/5 text-white/60 py-5 rounded-2xl font-black text-xl hover:bg-white/10 transition-all border border-white/10"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={files.length === 0}
                  className="flex-[2] bg-rose-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-rose-500/20 hover:bg-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-6 h-6" />
                  Generate Roadmap
                </button>
              </div>
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20 text-center space-y-6"
            >
              <div className="relative inline-block">
                <Loader2 className="w-20 h-20 text-rose-500 animate-spin" />
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white">Strategizing...</h3>
                <p className="text-white/60 max-w-xs mx-auto">Analyzing content and calculating the perfect distribution.</p>
              </div>
            </motion.div>
          )}

          {step === 'result' && roadmap && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <Calendar className="text-rose-500" />
                  Your Study Roadmap
                </h3>
                <button
                  onClick={() => setStep('setup')}
                  className="text-rose-500 font-bold hover:underline"
                >
                  Create New
                </button>
              </div>

              {roadmapData && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-4">
                    <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30">
                      <Sparkles className="text-rose-400 w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-wider">Visual Strategy Map</h3>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">AI-Optimized Learning Path</p>
                    </div>
                  </div>
                  <FlowChart 
                    data={roadmapData.map((d: any) => ({
                      step: d.day,
                      desc: `${d.topic}: ${d.objective}`
                    }))} 
                  />
                </div>
              )}

              <div className="prose prose-invert prose-rose max-w-none prose-headings:font-black prose-table:border prose-table:border-white/10 prose-th:bg-white/5 prose-th:p-4 prose-td:p-4">
                <ReactMarkdown>{roadmap}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
