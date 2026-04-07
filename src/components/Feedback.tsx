import React, { useState } from 'react';
import { MessageSquare, Star, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Feedback() {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(true);
      const feedback = {
        rating,
        comment,
        date: new Date().toISOString(),
        userId: 'current-user'
      };
      
      const existingFeedback = JSON.parse(localStorage.getItem('app_feedback') || '[]');
      localStorage.setItem('app_feedback', JSON.stringify([feedback, ...existingFeedback]));
      
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/40 backdrop-blur-3xl p-12 rounded-[3rem] border border-white/10 shadow-2xl space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-white">Thank You!</h2>
          <p className="text-white/60 text-lg">Your feedback helps us make StoryStudy better for everyone.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setRating(0);
              setComment('');
            }}
            className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all"
          >
            Send Another
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="text-center space-y-2">
        <div className="inline-flex p-4 bg-white/10 rounded-full mb-4">
          <MessageSquare className="w-12 h-12 text-indigo-400" />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight">Share Your Thoughts</h2>
        <p className="text-white/60 text-lg">How are you enjoying your learning journey?</p>
      </header>

      <div className="bg-black/40 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 space-y-8">
        <div className="space-y-4 text-center">
          <label className="text-sm font-black text-white/40 uppercase tracking-widest block">Overall Rating</label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="p-2 transition-all transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "w-10 h-10 transition-all",
                    (hoveredRating || rating) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-white/10"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-white/40 uppercase tracking-widest ml-2">Your Comments</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What do you love? What could be better?"
              className="w-full px-6 py-4 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-2xl outline-none transition-all font-medium min-h-[150px] text-white"
            />
          </div>

          <button
            type="submit"
            disabled={rating === 0 || loading}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
            ) : (
              <>
                <Send className="w-6 h-6" />
                Submit Feedback
              </>
            )}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
          <h4 className="font-bold text-white mb-1">Direct Support</h4>
          <p className="text-sm text-white/40">Need help with something specific? Contact our team.</p>
        </div>
        <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
          <h4 className="font-bold text-white mb-1">Feature Requests</h4>
          <p className="text-sm text-white/40">Have a great idea for a new feature? Let us know!</p>
        </div>
      </div>
    </div>
  );
}
