import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-black/40 backdrop-blur-3xl p-6 sm:p-10 rounded-[3rem] shadow-2xl border border-white/10 relative overflow-hidden text-white"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-32 h-32 text-indigo-500" />
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-indigo-600 rounded-3xl text-white shadow-xl mb-6">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">StoryStudy AI</h1>
          <p className="text-white/60 mt-2">Your magical learning journey starts here!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-white/40 uppercase tracking-wider ml-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-transparent focus:border-indigo-500 focus:bg-white/10 rounded-2xl outline-none transition-all font-medium text-white"
                placeholder="student@school.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-white/40 uppercase tracking-wider ml-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-transparent focus:border-indigo-500 focus:bg-white/10 rounded-2xl outline-none transition-all font-medium text-white"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group"
          >
            Get Started
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center mt-8 text-white/40 font-medium">
          New here? <span className="text-indigo-400 font-bold cursor-pointer hover:underline">Create an account</span>
        </p>
      </motion.div>
    </div>
  );
}
