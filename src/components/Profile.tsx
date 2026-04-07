import React, { useState, useEffect } from 'react';
import { User, Target, Brain, Calendar, Save, Sparkles, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface ProfileProps {
  onNavigate?: (view: string) => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Student',
    strengths: [],
    weaknesses: [],
    upcomingExams: []
  });
  const [newExam, setNewExam] = useState({ subject: '', date: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('user_profile', JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addExam = () => {
    if (newExam.subject && newExam.date) {
      setProfile({
        ...profile,
        upcomingExams: [...profile.upcomingExams, newExam]
      });
      setNewExam({ subject: '', date: '' });
    }
  };

  const removeExam = (index: number) => {
    setProfile({
      ...profile,
      upcomingExams: profile.upcomingExams.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <header className="text-center">
        <div className="inline-flex p-4 bg-white/10 rounded-full mb-4">
          <User className="w-12 h-12 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-black text-white">Your Learning Profile</h2>
        <p className="text-white/60">Tell us about yourself so AI can plan better!</p>
      </header>

      <div className="bg-black/40 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 space-y-6">
        <div className="space-y-4">
          <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Learning Style
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Visual', 'Auditory', 'Reading', 'Kinesthetic'].map((style) => (
              <button
                key={style}
                onClick={() => setProfile({ ...profile, learningStyle: style as any })}
                className={cn(
                  "px-4 py-3 rounded-xl font-bold text-sm transition-all border-2",
                  profile.learningStyle === style 
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                    : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                )}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-2">Your Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full px-6 py-4 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-2xl outline-none transition-all font-bold text-lg text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-400 uppercase tracking-widest ml-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Strengths
            </label>
            <textarea
              placeholder="e.g. Math, Creative Writing"
              value={profile.strengths.join(', ')}
              onChange={(e) => setProfile({ ...profile, strengths: e.target.value.split(',').map(s => s.trim()) })}
              className="w-full px-6 py-4 bg-emerald-500/5 border border-emerald-500/20 focus:border-emerald-500 rounded-2xl outline-none transition-all font-medium min-h-[100px] text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-rose-400 uppercase tracking-widest ml-2 flex items-center gap-1">
              <Brain className="w-3 h-3" /> Weaknesses
            </label>
            <textarea
              placeholder="e.g. Physics Formulas, History Dates"
              value={profile.weaknesses.join(', ')}
              onChange={(e) => setProfile({ ...profile, weaknesses: e.target.value.split(',').map(s => s.trim()) })}
              className="w-full px-6 py-4 bg-rose-500/5 border border-rose-500/20 focus:border-rose-500 rounded-2xl outline-none transition-all font-medium min-h-[100px] text-white"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-2 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Upcoming Exams
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Subject"
              value={newExam.subject}
              onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl outline-none transition-all font-medium text-white"
            />
            <input
              type="date"
              value={newExam.date}
              onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
              className="px-4 py-3 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl outline-none transition-all font-medium text-white"
            />
            <button
              onClick={addExam}
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
            >
              <Target className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-2">
            {profile.upcomingExams.map((exam, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex flex-col">
                  <span className="font-bold text-white">{exam.subject}</span>
                  <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">{exam.date}</span>
                </div>
                <button onClick={() => removeExam(i)} className="text-rose-400 hover:text-rose-600">
                  <Save className="w-5 h-5 rotate-45" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          {saved ? (
            <>
              <Sparkles className="animate-bounce" />
              Profile Saved!
            </>
          ) : (
            <>
              <Save className="w-6 h-6" />
              Save Profile
            </>
          )}
        </button>
      </div>

      <div className="bg-black/40 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 text-center">
        <p className="text-white/60 mb-4">How are we doing? Your feedback helps us improve.</p>
        <button 
          onClick={() => onNavigate?.('feedback')}
          className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <MessageSquare className="w-5 h-5" />
          Share Your Feedback
        </button>
      </div>
    </div>
  );
}
