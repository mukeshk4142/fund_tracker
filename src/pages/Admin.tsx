import React from 'react';
import { 
  Users, 
  ShieldCheck, 
  Settings, 
  Bell, 
  Database, 
  Globe,
  TrendingUp,
  Activity,
  ArrowUpRight,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const Admin = () => {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h2>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            <ShieldCheck size={16} />
            System-wide statistics and management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 glass text-slate-700 font-bold rounded-xl hover:bg-white transition-all border border-slate-200 shadow-sm flex items-center gap-2">
            <Settings size={18} />
            System Config
          </button>
          <button className="px-5 py-2.5 gradient-indigo text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all flex items-center gap-2">
            <Bell size={18} />
            Broadcast
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: '48,251', trend: '+12.5%', icon: Users, color: 'gradient-indigo' },
          { label: 'System Health', value: '99.9%', trend: 'Stable', icon: Activity, color: 'gradient-emerald' },
          { label: 'Daily Volume', value: '$2.4M', trend: '+8.2%', icon: TrendingUp, color: 'gradient-rose' },
          { label: 'Global Nodes', value: '124', trend: 'Online', icon: Globe, color: 'gradient-blue' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="glass p-6 rounded-[2rem] border border-slate-200/60 relative overflow-hidden group"
          >
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                <div className={`mt-3 flex items-center gap-1 text-xs font-black ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-slate-500'}`}>
                  {stat.trend.startsWith('+') && <ArrowUpRight size={14} />}
                  <span>{stat.trend}</span>
                </div>
              </div>
              <div className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform`}>
                <stat.icon size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border border-slate-200/60">
          <div className="flex items-center justify-between mb-8 px-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent System Logs</h3>
            <button className="text-indigo-600 font-black text-sm hover:underline flex items-center gap-1">
              <Database size={16} />
              View Full History
            </button>
          </div>

          <div className="space-y-4">
            {[
              { type: 'Success', msg: 'Backup completed successfully', time: '10 mins ago', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { type: 'Alert', msg: 'Unusual login attempt from IP: 192.168.1.1', time: '25 mins ago', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
              { type: 'Error', msg: 'Database connection failed on Node 4', time: '1 hour ago', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
              { type: 'Update', msg: 'System version 2.4.0 deployed', time: '3 hours ago', icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-white border border-slate-50 rounded-[1.5rem] hover:bg-slate-50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl ${log.bg} ${log.color} flex items-center justify-center`}>
                    <log.icon size={20} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 tracking-tight">{log.msg}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{log.time}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-[2.5rem] p-8 border border-slate-200/60">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8 px-2">System Resources</h3>
          <div className="space-y-8">
            {[
              { label: 'CPU Usage', value: 24, color: 'bg-indigo-500' },
              { label: 'Memory', value: 45, color: 'bg-emerald-500' },
              { label: 'Storage', value: 78, color: 'bg-rose-500' },
              { label: 'Bandwidth', value: 12, color: 'bg-blue-500' },
            ].map((res, i) => (
              <div key={i} className="space-y-3 px-2">
                <div className="flex items-center justify-between">
                  <p className="font-black text-slate-900 text-sm tracking-tight">{res.label}</p>
                  <span className="text-xs font-black text-slate-900">{res.value}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${res.value}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-full ${res.color}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 gradient-indigo rounded-[2rem] text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="font-black text-lg mb-2">Cloud Infrastructure</h4>
              <p className="text-indigo-100 text-xs font-medium leading-relaxed mb-4">You are currently using 40% of your allocated monthly resources.</p>
              <button className="px-5 py-2 bg-white text-indigo-600 font-black text-xs uppercase tracking-widest rounded-lg">Expand Plan</button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
