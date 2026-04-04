import React, { useState } from 'react';
import { Users, MapPin, Clock, Calendar, Plus, MessageCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StudySession } from '../types';

export default function StudyGroups() {
  const [sessions, setSessions] = useState<StudySession[]>([
    {
      id: '1',
      subject: 'Biology 101',
      date: '2026-04-05',
      time: '14:00',
      location: 'Main Library, Room 302',
      classmates: ['Alice', 'Bob', 'Charlie']
    }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    subject: '',
    date: '',
    time: '',
    location: '',
    classmates: ''
  });

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

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-emerald-600 flex items-center gap-2">
            <Users className="text-emerald-500" />
            Study Groups
          </h2>
          <p className="text-gray-600">Learn better together with your classmates!</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2"
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
            className="bg-white p-6 rounded-3xl shadow-xl border-4 border-emerald-100 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">{session.subject}</h3>
              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">
                {session.classmates.length} Attending
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Calendar className="w-4 h-4" />
                {session.date}
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Clock className="w-4 h-4" />
                {session.time}
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <MapPin className="w-4 h-4" />
                {session.location}
              </div>
            </div>

            <div className="flex -space-x-2 overflow-hidden">
              {session.classmates.map((name, i) => (
                <div
                  key={i}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600 border border-emerald-200"
                >
                  {name[0]}
                </div>
              ))}
            </div>

            <div className="pt-4 flex gap-2">
              <button className="flex-1 bg-emerald-50 text-emerald-600 py-2 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chat
              </button>
              <button className="flex-1 bg-emerald-500 text-white py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors">
                Join Session
              </button>
            </div>
          </motion.div>
        ))}

        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 rounded-3xl text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Star className="w-24 h-24" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Premium Sessions</h3>
            <p className="text-sm opacity-90 mb-4">Get 1-on-1 help from expert tutors in real-time.</p>
          </div>
          <button className="bg-white text-orange-600 py-3 rounded-2xl font-bold shadow-lg hover:bg-orange-50 transition-all">
            Explore Premium
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border-4 border-emerald-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-gray-900">New Session</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <Plus className="rotate-45 w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateSession} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Subject</label>
                  <input
                    required
                    type="text"
                    value={newSession.subject}
                    onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all"
                    placeholder="e.g. Physics Midterm Prep"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Date</label>
                    <input
                      required
                      type="date"
                      value={newSession.date}
                      onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Time</label>
                    <input
                      required
                      type="time"
                      value={newSession.time}
                      onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Location</label>
                  <input
                    required
                    type="text"
                    value={newSession.location}
                    onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all"
                    placeholder="e.g. Library Room 101"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Invite Classmates</label>
                  <input
                    type="text"
                    value={newSession.classmates}
                    onChange={(e) => setNewSession({ ...newSession, classmates: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all"
                    placeholder="e.g. Alice, Bob, Charlie"
                  />
                  <p className="text-[10px] text-gray-400 ml-2">Separate names with commas</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all mt-4"
                >
                  Create Session
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
