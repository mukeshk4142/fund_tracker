import React, { useState, useEffect } from 'react';
import { 
  TrendingDown, ArrowUpRight, ArrowDownLeft,
  Calendar, Activity, Target, IndianRupee
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { motion } from 'framer-motion';

// FIREBASE IMPORTS
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

// Currency Formatter for Indian Rupees
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

const StatCard = ({ title, amount, trend, icon: Icon, colorClass }: any) => (
  <motion.div whileHover={{ y: -5 }} className="glass p-6 rounded-3xl relative overflow-hidden group">
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          {formatCurrency(Number(amount))}
        </h3>
        <div className={`mt-3 flex items-center gap-1 text-sm font-bold ${trend.startsWith('+') || trend.includes('Profitable') ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend.startsWith('+') ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
          <span>{trend}</span>
        </div>
      </div>
      <div className={`h-14 w-14 rounded-2xl ${colorClass} flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform`}>
        <Icon size={24} />
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBalance: 0,
    income: 0,
    expenses: 0,
    totalDebt: 0,
    totalReceivable: 0,
    recentActivity: [] as any[],
    activeLiabilities: [] as any[]
  });

  useEffect(() => {
    // Shared data holders
    let dailyData: any[] = [];
    let stockData: any[] = [];
    let liabData: any[] = [];
    let lentData: any[] = [];

    const calculateEverything = () => {
      // Helper to sum amounts accurately
      const sum = (arr: any[], type: string) => 
        arr.filter(a => a.type === type).reduce((s, a) => s + (Number(a.amount) || 0), 0);

      const dIncome = sum(dailyData, 'income');
      const dExpense = sum(dailyData, 'expense');
      const sWithdraw = sum(stockData, 'withdrawal');
      const sDeposit = sum(stockData, 'deposit');

      const debt = liabData.reduce((s, l) => s + ((Number(l.amount) || 0) - (Number(l.paid) || 0)), 0);
      const receivable = lentData.reduce((s, r) => s + ((Number(r.amount) || 0) - (Number(r.received) || 0)), 0);

      // Precision Rounding to fix the 2-4 difference
      const totalBal = Math.round(((dIncome - dExpense) + (sWithdraw - sDeposit)) * 100) / 100;

      const combinedActivity = [
        ...dailyData.map(a => ({ ...a, source: 'Daily' })),
        ...stockData.map(a => ({ ...a, source: 'Stock' }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

      setStats({
        totalBalance: totalBal,
        income: dIncome + sWithdraw,
        expenses: dExpense + sDeposit,
        totalDebt: debt,
        totalReceivable: receivable,
        recentActivity: combinedActivity,
        activeLiabilities: liabData.slice(0, 3)
      });
    };

    // Parallel Listeners
    const unsubDaily = onSnapshot(collection(db, 'daily_activities'), (snap) => {
      dailyData = snap.docs.map(doc => doc.data());
      calculateEverything();
    });
    const unsubStock = onSnapshot(collection(db, 'stock_activities'), (snap) => {
      stockData = snap.docs.map(doc => doc.data());
      calculateEverything();
    });
    const unsubLiab = onSnapshot(collection(db, 'liability_obligations'), (snap) => {
      liabData = snap.docs.map(doc => doc.data());
      calculateEverything();
    });
    const unsubLent = onSnapshot(collection(db, 'lent_records'), (snap) => {
      lentData = snap.docs.map(doc => doc.data());
      calculateEverything();
    });

    return () => {
      unsubDaily(); unsubStock(); unsubLiab(); unsubLent();
    };
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Overview Dashboard</h2>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            <Calendar size={16} />
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Balance" amount={stats.totalBalance} trend="Realtime" icon={IndianRupee} colorClass="gradient-indigo" />
        <StatCard title="Total Debt" amount={stats.totalDebt} trend="Active" icon={TrendingDown} colorClass="gradient-rose" />
        <StatCard title="Money to Receive" amount={stats.totalReceivable} trend="Pending" icon={ArrowUpRight} colorClass="gradient-emerald" />
        <StatCard title="Cashflow" amount={stats.income - stats.expenses} trend={stats.income >= stats.expenses ? "Profitable" : "Deficit"} icon={Activity} colorClass="gradient-amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border border-slate-200/60">
           <h3 className="text-xl font-black text-slate-900 mb-8">Financial Overview</h3>
           <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.recentActivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={0.1} fill="#6366f1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-[2.5rem] p-8 border border-slate-200/60 flex flex-col">
          <h3 className="text-xl font-black text-slate-900 mb-8">Recent Activities</h3>
          <div className="space-y-5 flex-1 overflow-y-auto max-h-[400px]">
            {stats.recentActivity.map((tx, i) => {
              const isPlus = tx.type === 'income' || tx.type === 'withdrawal';
              return (
                <div key={i} className="flex items-center justify-between group p-2 hover:bg-slate-50 rounded-2xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl ${isPlus ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} flex items-center justify-center font-bold`}>
                      {isPlus ? '₹' : '₹'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{tx.category || tx.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{tx.source}</p>
                    </div>
                  </div>
                  <p className={`font-black text-sm ${isPlus ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isPlus ? '+' : '-'}{formatCurrency(tx.amount).replace('INR', '')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass rounded-[2.5rem] p-8 border border-slate-200/60">
        <h3 className="text-xl font-black text-slate-900 mb-8">Active Liabilities Tracking</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.activeLiabilities.map((loan: any, i: number) => {
            const percentage = Math.round((Number(loan.paid || 0) / Number(loan.amount)) * 100);
            return (
              <div key={i} className="space-y-3 p-4 bg-slate-50 rounded-3xl">
                <div className="flex justify-between font-black text-sm text-slate-700">
                  <span className="truncate w-32">{loan.name}</span>
                  <span>{percentage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${percentage}%` }} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 text-right">
                  {formatCurrency(loan.paid)} / {formatCurrency(loan.amount)}
                </p>
              </div>
            );
          })}
          {stats.activeLiabilities.length === 0 && <p className="col-span-3 text-center text-slate-400 font-bold">No active liabilities found</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;