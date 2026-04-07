import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Users, Sparkles, Trophy, ArrowRight, BrainCircuit, Video, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState([
    { label: 'Study Groups', value: '0', icon: Users, color: 'text-emerald-400' },
    { label: 'AI Stories', value: '0', icon: Sparkles, color: 'text-amber-400' },
    { label: 'Avg Quiz', value: '0%', icon: Trophy, color: 'text-rose-400' },
  ]);
  const [userName, setUserName] = useState('Student');

  useEffect(() => {
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      setUserName(JSON.parse(savedProfile).name);
    }

    const sessions = JSON.parse(localStorage.getItem('study_sessions') || '[]');
    const stories = JSON.parse(localStorage.getItem('story_history') || '[]');
    const quizResults = JSON.parse(localStorage.getItem('quiz_results') || '[]');
    
    const avgScore = quizResults.length > 0 
      ? Math.round(quizResults.reduce((acc: number, curr: any) => acc + curr.score, 0) / quizResults.length)
      : 0;

    setStats([
      { label: 'Study Groups', value: sessions.length.toString(), icon: Users, color: 'text-emerald-400' },
      { label: 'AI Stories', value: stories.length.toString(), icon: Sparkles, color: 'text-amber-400' },
      { label: 'Avg Quiz', value: `${avgScore}%`, icon: Trophy, color: 'text-rose-400' },
    ]);
  }, []);

  const cards = [
    {
      title: 'AI Story Tutor',
      description: 'Turn your boring textbooks into magical stories.',
      icon: BrainCircuit,
      color: 'bg-amber-500',
      view: 'tutor',
      action: 'Start Learning'
    },
    {
      title: 'Study Roadmap',
      description: 'Create a zero-gap study plan for your exams.',
      icon: Calendar,
      color: 'bg-rose-500',
      view: 'roadmap',
      action: 'Create Plan'
    },
    {
      title: 'Quiz Challenge',
      description: 'Test your knowledge and see brutal results.',
      icon: Sparkles,
      color: 'bg-indigo-500',
      view: 'quiz',
      action: 'Take Quiz'
    },
    {
      title: 'Study Groups',
      description: 'Organize sessions with your classmates.',
      icon: Users,
      color: 'bg-emerald-500',
      view: 'groups',
      action: 'Find Groups'
    },
    {
      title: 'My Profile',
      description: 'Update your goals and track your progress.',
      icon: Trophy,
      color: 'bg-gray-500',
      view: 'profile',
      action: 'View Profile'
    },
    {
      title: 'Feedback',
      description: 'Help us improve your learning experience.',
      icon: MessageSquare,
      color: 'bg-indigo-600',
      view: 'feedback',
      action: 'Share Thoughts'
    }
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter">
            Welcome back, <span className="text-indigo-400">{userName}!</span> 👋
          </h1>
          <p className="text-white/60 mt-2 text-lg font-medium">Your academic journey continues. What's the goal for today?</p>
        </div>
        <div className="hidden sm:block h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 border-4 border-white/20 shadow-2xl animate-pulse" />
      </header>

      {/* Quick Start Guide */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-[3rem] bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-white/10 backdrop-blur-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-40 h-40 text-white" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-xl">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Quick Start Guide</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Upload Content', desc: 'Drop your PDFs or images in the AI Tutor.' },
              { step: '02', title: 'Get Stories', desc: 'AI transforms boring facts into epic tales.' },
              { step: '03', title: 'Ace Exams', desc: 'Take the Quiz Challenge and win.' }
            ].map((s, i) => (
              <div key={i} className="space-y-2">
                <div className="text-3xl font-black text-indigo-400/30">{s.step}</div>
                <h4 className="font-bold text-white">{s.title}</h4>
                <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0"
          >
            <div className={cn("p-3 rounded-2xl bg-white/5", stat.color.replace('text-', 'bg-').replace('-400', '-400/10'))}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div className="flex-1 sm:mt-4">
              <div className="text-3xl font-black text-white">{stat.value}</div>
              <div className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(card.view)}
            className="text-left group relative overflow-hidden bg-black/40 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 hover:bg-black/50 transition-all"
          >
            <div className={cn("inline-flex p-4 rounded-2xl text-white mb-6 shadow-lg", card.color)}>
              <card.icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">{card.title}</h3>
            <p className="text-white/70 mb-8 leading-relaxed">{card.description}</p>
            <div className="flex items-center gap-2 font-bold text-indigo-400 group-hover:gap-4 transition-all">
              {card.action}
              <ArrowRight className="w-5 h-5" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
