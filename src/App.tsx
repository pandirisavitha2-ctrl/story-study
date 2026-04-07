import React, { useState, useEffect } from 'react';
import { Home, BookOpen, Calendar, Users, LogOut, Menu, X, Video, Volume2, FileText, User, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AITutor from './components/AITutor';
import StudyRoadmap from './components/StudyRoadmap';
import StudyGroups from './components/StudyGroups';
import Profile from './components/Profile';
import QuizSession from './components/QuizSession';
import Feedback from './components/Feedback';
import { cn } from './lib/utils';

type View = 'dashboard' | 'tutor' | 'roadmap' | 'groups' | 'profile' | 'quiz' | 'feedback';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('Student');

  useEffect(() => {
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserName(profile.name);
    }
  }, [currentView]);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home, color: 'text-indigo-400', bg: 'bg-white/10' },
    { id: 'tutor', label: 'AI Tutor', icon: BookOpen, color: 'text-amber-400', bg: 'bg-white/10' },
    { id: 'roadmap', label: 'Roadmap', icon: Calendar, color: 'text-rose-400', bg: 'bg-white/10' },
    { id: 'quiz', label: 'Quiz', icon: Sparkles, color: 'text-amber-400', bg: 'bg-white/10' },
    { id: 'groups', label: 'Groups', icon: Users, color: 'text-emerald-400', bg: 'bg-white/10' },
    { id: 'profile', label: 'Profile', icon: User, color: 'text-white', bg: 'bg-white/10' },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-white/10' },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={(v) => setCurrentView(v as View)} />;
      case 'tutor': return <AITutor />;
      case 'roadmap': return <StudyRoadmap />;
      case 'quiz': return <QuizSession />;
      case 'groups': return <StudyGroups />;
      case 'profile': return <Profile onNavigate={(v) => setCurrentView(v as View)} />;
      case 'feedback': return <Feedback />;
      default: return <Dashboard onNavigate={(v) => setCurrentView(v as View)} />;
    }
  };

  return (
    <div className="min-h-screen font-sans relative overflow-hidden">
      {/* Animated Background with 3D/Peaceful Image */}
      <div className="fixed inset-0 -z-10">
        <img 
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2070" 
          alt="Peaceful Nature"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-300/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-300/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {!isLoggedIn ? (
        <Login onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <>
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 bg-black/40 backdrop-blur-3xl border-r border-white/10 p-8 z-50 text-white">
            <div className="flex items-center gap-3 mb-12">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">StoryStudy</h1>
            </div>

            <nav className="flex-1 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as View)}
                  className={cn(
                    "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all",
                    currentView === item.id 
                      ? `${item.bg} ${item.color} shadow-lg` 
                      : "text-white/40 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </button>
              ))}
            </nav>

            <button 
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-white/40 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
            >
              <LogOut className="w-6 h-6" />
              Log Out
            </button>
          </aside>

          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between p-6 bg-black/40 backdrop-blur-3xl border-b border-white/10 sticky top-0 z-40 text-white">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-black text-xl tracking-tight text-white">StoryStudy</span>
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-white/80">
              {isSidebarOpen ? <X /> : <Menu />}
            </button>
          </header>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-3xl z-50 p-8 text-white"
              >
                <div className="flex justify-between items-center mb-12">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-xl text-white">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">StoryStudy</h1>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-white/60">
                    <X />
                  </button>
                </div>
                <nav className="space-y-4">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id as View);
                        setIsSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-black text-xl transition-all",
                        currentView === item.id ? `${item.bg} ${item.color}` : "text-white/40"
                      )}
                    >
                      <item.icon className="w-8 h-8" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main className="lg:ml-72 p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Mobile Bottom Nav */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-3xl border-t border-white/10 flex items-center justify-around p-4 pb-8 z-40">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all",
                  currentView === item.id ? item.color : "text-white/40"
                )}
              >
                <item.icon className={cn("w-6 h-6", currentView === item.id && "scale-110")} />
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
