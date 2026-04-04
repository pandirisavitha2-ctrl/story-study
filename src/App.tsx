import React, { useState } from 'react';
import { Home, BookOpen, Calendar, Users, LogOut, Menu, X, Video, Volume2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AITutor from './components/AITutor';
import StudyPlanner from './components/StudyPlanner';
import StudyGroups from './components/StudyGroups';
import VideoTutor from './components/VideoTutor';
import LiveTutor from './components/LiveTutor';
import AudioTranscriber from './components/AudioTranscriber';
import { cn } from './lib/utils';

type View = 'dashboard' | 'tutor' | 'planner' | 'groups' | 'video' | 'live' | 'audio';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'tutor', label: 'AI Tutor', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'video', label: 'Video Tutor', icon: Video, color: 'text-violet-600', bg: 'bg-violet-50' },
    { id: 'live', label: 'Live Voice', icon: Volume2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'audio', label: 'Audio Notes', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'planner', label: 'Planner', icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'groups', label: 'Groups', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={(v) => setCurrentView(v as View)} />;
      case 'tutor': return <AITutor />;
      case 'planner': return <StudyPlanner />;
      case 'groups': return <StudyGroups />;
      case 'video': return <VideoTutor />;
      case 'live': return <LiveTutor />;
      case 'audio': return <AudioTranscriber />;
      default: return <Dashboard onNavigate={(v) => setCurrentView(v as View)} />;
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50/30 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 bg-white border-r-4 border-indigo-100 p-8 z-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">StoryStudy</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all",
                currentView === item.id 
                  ? `${item.bg} ${item.color} shadow-sm` 
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              )}
            >
              <item.icon className="w-6 h-6" />
              {item.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={() => setIsLoggedIn(false)}
          className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
        >
          <LogOut className="w-6 h-6" />
          Log Out
        </button>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-6 bg-white border-b-4 border-indigo-100 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tight">StoryStudy</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600">
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
            className="lg:hidden fixed inset-0 bg-white z-50 p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">StoryStudy</h1>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-600">
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
                    currentView === item.id ? `${item.bg} ${item.color}` : "text-gray-400"
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
      <main className="lg:ml-72 p-6 lg:p-12 max-w-7xl mx-auto">
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-indigo-100 flex items-center justify-around p-4 pb-8 z-40">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              currentView === item.id ? item.color : "text-gray-300"
            )}
          >
            <item.icon className={cn("w-6 h-6", currentView === item.id && "scale-110")} />
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
