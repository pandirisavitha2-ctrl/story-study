import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Circle, Plus, Trash2, BrainCircuit, Target, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateStudyTasks } from '../services/gemini';
import { Task, UserProfile } from '../types';
import { cn } from '../lib/utils';

export default function StudyPlanner() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Student',
    strengths: ['Math', 'History'],
    weaknesses: ['Biology', 'Physics'],
    upcomingExams: [{ subject: 'Biology Final', date: '2026-04-15' }]
  });

  useEffect(() => {
    const savedTasks = localStorage.getItem('study_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('study_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleGenerateTasks = async () => {
    setLoading(true);
    try {
      const { tasks: newTasks } = await generateStudyTasks(profile);
      const formattedTasks = newTasks.map((t: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: t.title,
        description: t.description,
        completed: false,
        dueDate: new Date().toISOString().split('T')[0],
        type: t.type || 'study'
      }));
      setTasks([...tasks, ...formattedTasks]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-rose-600 flex items-center gap-2">
            <Target className="text-rose-500" />
            Study Planner
          </h2>
          <p className="text-gray-600">Your personalized path to success!</p>
        </div>
        <button
          onClick={handleGenerateTasks}
          disabled={loading}
          className="bg-rose-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-rose-600 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <BrainCircuit className="animate-spin" />
          ) : (
            <>
              <BrainCircuit className="w-5 h-5" />
              AI Generate
            </>
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-rose-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle2 className="text-rose-500" />
                Tasks
              </h3>
              <span className="text-sm font-medium text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
                {completedCount}/{tasks.length} Done
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {tasks.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No tasks yet. Let AI help you plan!</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                        task.completed ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-rose-50 hover:border-rose-200"
                      )}
                    >
                      <button onClick={() => toggleTask(task.id)}>
                        {task.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-rose-300" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h4 className={cn("font-bold text-gray-800", task.completed && "line-through")}>
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-500">{task.description}</p>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-6 rounded-3xl text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-amber-300" />
              <h3 className="text-xl font-bold">Progress</h3>
            </div>
            <div className="relative h-4 bg-white/20 rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="absolute inset-0 bg-white"
              />
            </div>
            <p className="text-sm font-medium opacity-90">{Math.round(progress)}% of daily goals reached</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-indigo-100">
            <h3 className="font-bold text-gray-800 mb-4">Upcoming Exams</h3>
            <div className="space-y-3">
              {profile.upcomingExams.map((exam, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl">
                  <span className="font-medium text-indigo-700">{exam.subject}</span>
                  <span className="text-xs font-bold text-indigo-400">{exam.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
