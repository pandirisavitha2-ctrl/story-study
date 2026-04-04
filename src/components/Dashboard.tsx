import React from 'react';
import { BookOpen, Calendar, Users, Sparkles, Trophy, ArrowRight, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const stats = [
    { label: 'Tasks Done', value: '12', icon: Trophy, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Study Hours', value: '24', icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'AI Stories', value: '8', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const cards = [
    {
      title: 'AI Story Tutor',
      description: 'Turn your boring textbooks into magical stories.',
      icon: BrainCircuit,
      color: 'bg-indigo-500',
      view: 'tutor',
      action: 'Start Learning'
    },
    {
      title: 'Study Planner',
      description: 'Personalized tasks based on your strengths.',
      icon: Calendar,
      color: 'bg-rose-500',
      view: 'planner',
      action: 'View Schedule'
    },
    {
      title: 'Study Groups',
      description: 'Organize sessions with your classmates.',
      icon: Users,
      color: 'bg-emerald-500',
      view: 'groups',
      action: 'Find Groups'
    }
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Hello, <span className="text-indigo-600">Student!</span> 👋
          </h1>
          <p className="text-gray-500 mt-1">Ready to ace your exams today?</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 border-4 border-white shadow-lg" />
      </header>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn("p-4 rounded-3xl shadow-sm border-2 border-white", stat.bg)}
          >
            <stat.icon className={cn("w-6 h-6 mb-2", stat.color)} />
            <div className="text-2xl font-black text-gray-900">{stat.value}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
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
            className="text-left group relative overflow-hidden bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-transparent hover:border-indigo-100 transition-all"
          >
            <div className={cn("inline-flex p-4 rounded-2xl text-white mb-6 shadow-lg", card.color)}>
              <card.icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">{card.title}</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">{card.description}</p>
            <div className="flex items-center gap-2 font-bold text-indigo-600 group-hover:gap-4 transition-all">
              {card.action}
              <ArrowRight className="w-5 h-5" />
            </div>
          </motion.button>
        ))}
      </div>

      <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-2">Premium Access</h3>
          <p className="text-lg opacity-90 mb-6 max-w-md">Unlock unlimited AI stories and 1-on-1 expert tutor sessions.</p>
          <button className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-orange-50 transition-all">
            Upgrade Now
          </button>
        </div>
        <Sparkles className="absolute -right-8 -bottom-8 w-64 h-64 opacity-20 rotate-12" />
      </div>
    </div>
  );
}
