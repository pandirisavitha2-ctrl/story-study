import React, { useState, useEffect } from 'react';
import { Users, MapPin, Clock, Calendar, Plus, MessageCircle, Star, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StudySession } from '../types';
import { cn } from '../lib/utils';

export default function StudyGroups() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ user: string, text: string }[]>([]);

  const [newSession, setNewSession] = useState({
    subject: '',
    date: '',
    time: '',
    location: '',
    classmates: ''
  });

  useEffect(() => {
    const savedSessions = localStorage.getItem('study_sessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    } else {
      setSessions([
        {
          id: '1',
          subject: 'Biology 101',
          date: '2026-04-05',
          time: '14:00',
          location: 'Main Library, Room 302',
          classmates: ['Alice', 'Bob', 'Charlie']
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('study_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const session: StudySession = {
      id: Math.random().toString(36).substr(2, 9),
      subject: newSession.subject,
      date: newSession.date,
      time: newSession.time,
      location: newSession.location,
      classmates: newSession.classmates.split(',').map(s => s.trim()).filter(s => s !== '')
    };
    setSessions([session, ...sessions]);
    setIsModalOpen(false);
    setNewSession({ subject: '', date: '', time: '', location: '', classmates: '' });
  };

  const openChat = (session: StudySession) => {
    setActiveSession(session);
    setIsChatOpen(true);
    setChatHistory([
      { user: 'Alice', text: `Hey everyone! Ready for ${session.subject}?` },
      { user: 'Bob', text: 'I brought the snacks!' }
    ]);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatHistory([...chatHistory, { user: 'Me', text: chatMessage }]);
    setChatMessage('');
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Users className="text-emerald-400" />
            Study Groups
          </h2>
          <p className="text-white/60">Learn better together with your classmates!</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Session
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map((session) => (
          <motion.div
            key={session.id}
            whileHover={{ y: -5 }}
            className="bg-black/40 backdrop-blur-3xl p-6 rounded-3xl shadow-2xl border border-white/10 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{session.subject}</h3>
              <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                {session.classmates.length} Attending
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Calendar className="w-4 h-4" />
                {session.date}
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Clock className="w-4 h-4" />
                {session.time}
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <MapPin className="w-4 h-4" />
                {session.location}
              </div>
            </div>

            <div className="flex -space-x-2 overflow-hidden">
              {session.classmates.map((name, i) => (
                <div
                  key={i}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-black bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400 border border-emerald-500/20"
                >
                  {name[0]}
                </div>
              ))}
            </div>

            <div className="pt-4 flex gap-2">
              <button 
                onClick={() => openChat(session)}
                className="flex-1 bg-white/5 text-emerald-400 py-2 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2 border border-white/10"
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </button>
              <button className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors">
                Join Session
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black/80 backdrop-blur-3xl w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-white">New Session</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateSession} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-2">Subject</label>
                  <input
                    required
                    type="text"
                    value={newSession.subject}
                    onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl outline-none transition-all text-white"
                    placeholder="e.g. Physics Midterm Prep"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-2">Date</label>
                    <input
                      required
                      type="date"
                      value={newSession.date}
                      onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl outline-none transition-all text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-2">Time</label>
                    <input
                      required
                      type="time"
                      value={newSession.time}
                      onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl outline-none transition-all text-white"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-2">Location</label>
                  <input
                    required
                    type="text"
                    value={newSession.location}
                    onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl outline-none transition-all text-white"
                    placeholder="e.g. Library Room 101"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-2">Invite Classmates</label>
                  <input
                    type="text"
                    value={newSession.classmates}
                    onChange={(e) => setNewSession({ ...newSession, classmates: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl outline-none transition-all text-white"
                    placeholder="e.g. Alice, Bob, Charlie"
                  />
                  <p className="text-[10px] text-white/40 ml-2">Separate names with commas</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all mt-4"
                >
                  Create Session
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isChatOpen && activeSession && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-black/80 backdrop-blur-3xl w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] h-[80vh] flex flex-col shadow-2xl border border-white/10"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 rounded-xl text-white">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white">{activeSession.subject} Chat</h3>
                    <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Active Now</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-white/40 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={cn("flex flex-col", msg.user === 'Me' ? "items-end" : "items-start")}>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 ml-2 mr-2">
                      {msg.user}
                    </span>
                    <div className={cn(
                      "max-w-[80%] p-4 rounded-2xl font-medium",
                      msg.user === 'Me' ? "bg-emerald-600 text-white" : "bg-white/10 text-white/90 border border-white/10"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="p-6 border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/10 focus:border-emerald-500 rounded-2xl outline-none transition-all font-medium text-white"
                />
                <button
                  type="submit"
                  className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Send className="w-6 h-6" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
