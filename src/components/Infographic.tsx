import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { motion } from 'motion/react';
import { Download, Share2, Maximize2, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface InfographicData {
  label: string;
  value: number;
}

interface InfographicProps {
  data: InfographicData[];
  title?: string;
  type?: 'bar' | 'pie';
}

const COLORS = ['#6366f1', '#f43f5e', '#fbbf24', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Infographic({ data, title, type = 'bar' }: InfographicProps) {
  if (!data || data.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative w-full bg-slate-900/50 rounded-[2.5rem] border border-white/10 p-8 shadow-2xl backdrop-blur-xl overflow-hidden"
    >
      {/* Poster Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30">
            {type === 'bar' ? <BarChart3 className="w-4 h-4 text-rose-400" /> : <PieChartIcon className="w-4 h-4 text-rose-400" />}
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">{title || 'Topic Analysis'}</h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Statistical Data Breakdown</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-rose-500/20 rounded-full blur-[100px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      </div>
      
      <div className="h-[300px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="label" 
                stroke="rgba(255,255,255,0.4)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis 
                stroke="rgba(255,255,255,0.4)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  color: '#fff',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                  padding: '12px 16px'
                }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={2000}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
                nameKey="label"
                animationDuration={2000}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  color: '#fff',
                  backdropFilter: 'blur(12px)'
                }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/5 relative z-10">
        {data.slice(0, 4).map((item, i) => (
          <div key={i} className="space-y-2 group/item">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.1em] truncate group-hover/item:text-white/50 transition-colors">{item.label}</div>
            </div>
            <div className="flex items-baseline gap-1">
              <div className="text-2xl font-black text-white tracking-tighter">{item.value}</div>
              <div className="text-xs font-bold text-white/40">%</div>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="h-full rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Poster Footer */}
      <div className="mt-8 flex justify-between items-center opacity-20">
        <div className="text-[8px] font-bold text-white uppercase tracking-[0.4em]">Data Visualization Engine v2.0</div>
        <div className="flex gap-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-1 h-1 bg-white rounded-full" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
