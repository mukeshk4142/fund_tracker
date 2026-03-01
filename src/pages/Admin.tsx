import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldCheck, Settings, Bell, Database, Globe,
  TrendingUp, Activity, ArrowUpRight, MoreVertical,
  CheckCircle2, XCircle, AlertCircle, IndianRupee
} from 'lucide-react';
import { motion } from 'framer-motion';

// FIREBASE IMPORTS
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';

const Admin = () => {
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalVolume: 0,
    pendingBills: 0,
    systemHealth: '99.9%'
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  // Helper for Rupee Formatting
  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  useEffect(() => {
    // 1. Fetch Stats from Global Activities
    const unsubGlobal = onSnapshot(collection(db, 'global_activities'), (snap) => {
      const docs = snap.docs.map(d => d.data());
      const volume = docs.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      
      setStats(prev => ({
        ...prev,
        totalRecords: snap.size,
        totalVolume: volume
      }));

      // Set real logs from latest activities
      const logs = snap.docs.slice(0, 4).map(d => ({
        msg: `${d.data().category}: ${d.data().name || 'New entry'}`,
        time: d.data().date,
        type: d.data().type === 'income' ? 'Success' : 'Update'
      }));
      setRecentLogs(logs);
    });

    // 2. Fetch Pending Bills Count
    const unsubBills = onSnapshot(collection(db, 'credit_bills'), (snap) => {
      const pending = snap.docs.filter(d => d.data().paidAmount < d.data().totalAmount).length;
      setStats(prev => ({ ...prev, pendingBills: pending }));
    });

    return () => { unsubGlobal(); unsubBills(); };
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Admin</h2>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            <ShieldCheck size={16} className="text-indigo-600" />
            Real-time Cloud Database Monitor
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 glass text-slate-700 font-bold rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 hover:bg-white transition-all">
            <Settings size={18} />
            System Config
          </button>
          <button className="px-5 py-2.5 gradient-indigo text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2">
            <Bell size={18} />
            Broadcast
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Logs', value: stats.totalRecords, trend: 'Live Sync', icon: Database, color: 'gradient-indigo' },
          { label: 'System Health', value: stats.systemHealth, trend: 'Stable', icon: Activity, color: 'gradient-emerald' },
          { label: 'Total Volume', value: formatINR(stats.totalVolume), trend: '+Realtime', icon: TrendingUp, color: 'gradient-rose' },
          { label: 'Pending Bills', value: stats.pendingBills, trend: 'Action Required', icon: AlertCircle, color: 'gradient-blue' },
        ].map((stat, i) => (
          <motion.div key={i} whileHover={{ y: -5 }} className="glass p-6 rounded-[2rem] border border-slate-200/60 relative group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                <p className="text-[10px] font-bold text-indigo-600 mt-2 uppercase">{stat.trend}</p>
              </div>
              <div className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                <stat.icon size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECENT SYSTEM LOGS */}
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border border-slate-200/60">
          <h3 className="text-xl font-black text-slate-900 mb-8 px-2">Recent Database Logs</h3>
          <div className="space-y-4">
            {recentLogs.length > 0 ? recentLogs.map((log, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-white border border-slate-50 rounded-[1.5rem] group hover:border-indigo-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl ${log.type === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'} flex items-center justify-center`}>
                    {log.type === 'Success' ? <CheckCircle2 size={20} /> : <Activity size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{log.msg}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{log.time}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded-md text-slate-400 uppercase">Synced</span>
              </div>
            )) : (
              <p className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-xs">No Recent Logs Found</p>
            )}
          </div>
        </div>

        {/* SYSTEM RESOURCES */}
        <div className="glass rounded-[2.5rem] p-8 border border-slate-200/60">
          <h3 className="text-xl font-black text-slate-900 mb-8 px-2">Server Status</h3>
          <div className="space-y-8">
            {[
              { label: 'Firebase Reads', value: 12, color: 'bg-indigo-500' },
              { label: 'Cloud Storage', value: 4, color: 'bg-emerald-500' },
              { label: 'Auth Instances', value: 1, color: 'bg-rose-500' },
              { label: 'API Latency', value: 85, color: 'bg-blue-500' },
            ].map((res, i) => (
              <div key={i} className="space-y-3 px-2">
                <div className="flex items-center justify-between font-bold text-sm">
                  <p className="text-slate-600">{res.label}</p>
                  <span className="text-slate-900">{res.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${res.value}%` }} className={`h-full ${res.color}`} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="font-black text-lg mb-2">Maintenance Mode</h4>
              <p className="text-slate-400 text-xs mb-4">Clear all synchronized test data from the cloud database.</p>
              <button 
                onClick={() => alert("Maintenance mode requires Master Key")}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
              >
                Purge Database
              </button>
            </div>
            <Database className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;