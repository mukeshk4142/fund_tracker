import React, { useState, useEffect } from 'react';
import { 
  CalendarPlus, TrendingUp, TrendingDown, Plus, Search, Tag, Trash2,
  Filter, MoreVertical, CheckCircle2, Activity, ShoppingBag, Coffee,
  Car, Home, X, IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// FIREBASE IMPORTS
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  note: string;
}

const DailyTransition = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeFilter, setTimeFilter] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Daily');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Helper for Indian Rupee Formatting
  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amt);
  };

  useEffect(() => {
    const q = query(collection(db, 'daily_activities'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(txData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmount || !newCategory) return;

    try {
      // Fix: Rounding to 2 decimal places to prevent calculation differences
      const cleanAmount = Math.round(parseFloat(newAmount) * 100) / 100;

      const txData = {
        type: newType,
        category: newCategory,
        amount: cleanAmount,
        date: newDate,
        note: newNote,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'daily_activities'), txData);

      setShowAddModal(false);
      setNewCategory(''); setNewAmount(''); setNewNote('');
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const deleteTx = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteDoc(doc(db, 'daily_activities', id));
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    }
  };

  const filteredTxs = transactions.filter(t => {
    const now = new Date();
    const tDate = new Date(t.date);
    if (timeFilter === 'Daily') return t.date === new Date().toISOString().split('T')[0];
    if (timeFilter === 'Weekly') {
      const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
      return tDate >= weekAgo;
    }
    if (timeFilter === 'Monthly') return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    if (timeFilter === 'Yearly') return tDate.getFullYear() === now.getFullYear();
    return true;
  });

  const totalIncome = filteredTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const totalExpense = filteredTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('food')) return <Coffee size={18} />;
    if (c.includes('salary')) return <TrendingUp size={18} />;
    if (c.includes('shopping')) return <ShoppingBag size={18} />;
    if (c.includes('transport')) return <Car size={18} />;
    return <Tag size={18} />;
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Daily Transitions</h2>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            <CalendarPlus size={16} />
            {loading ? 'Syncing...' : 'Cloud Connected'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
            {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map((filter) => (
              <button key={filter} onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${timeFilter === filter ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                {filter}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 gradient-indigo text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2">
            <Plus size={18} /> New Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-[2.5rem] border border-slate-200/60">
            <p className="text-slate-500 text-sm font-bold uppercase mb-2">Income</p>
            <h3 className="text-3xl font-black text-emerald-500">{formatINR(totalIncome)}</h3>
        </div>
        <div className="glass p-8 rounded-[2.5rem] border border-slate-200/60">
            <p className="text-slate-500 text-sm font-bold uppercase mb-2">Expense</p>
            <h3 className="text-3xl font-black text-rose-500">{formatINR(totalExpense)}</h3>
        </div>
        <div className="glass p-8 rounded-[2.5rem] border border-slate-200/60">
            <p className="text-slate-500 text-sm font-bold uppercase mb-2">Net Balance</p>
            <h3 className={`text-3xl font-black ${(totalIncome - totalExpense) >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
              {formatINR(totalIncome - totalExpense)}
            </h3>
        </div>
      </div>

      <div className="glass rounded-[2.5rem] p-6 border border-slate-200/60">
        <h3 className="text-xl font-black text-slate-900 mb-8 px-2">Transactions History</h3>
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredTxs.map((t) => (
              <motion.div key={t.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white ${t.type === 'income' ? 'gradient-emerald' : 'gradient-rose'}`}>
                    {getCategoryIcon(t.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-slate-900">{t.category}</p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {t.type}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm italic line-clamp-1">"{t.note}"</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-10 mt-4 sm:mt-0">
                  <div className="text-left sm:text-right">
                    <p className={`text-xl font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-900'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatINR(t.amount).replace('INR', '')}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase">{t.date}</p>
                  </div>
                  <button onClick={() => deleteTx(t.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredTxs.length === 0 && <p className="text-center py-10 text-slate-400 font-bold">No entries found for this period</p>}
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md glass-dark rounded-[2.5rem] p-8 shadow-2xl">
              <h3 className="text-xl font-black text-white mb-6">New Transition</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="flex p-1 bg-slate-800 rounded-2xl">
                  {['income', 'expense'].map((type) => (
                    <button key={type} type="button" onClick={() => setNewType(type as any)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${newType === type ? 'bg-white text-slate-900' : 'text-slate-400'}`}>
                      {type}
                    </button>
                  ))}
                </div>
                <input type="text" placeholder="Category" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-bold" required />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input type="number" step="0.01" placeholder="Amount" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="w-full p-3 pl-8 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-black" required />
                </div>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-bold" required />
                <textarea placeholder="Note" value={newNote} onChange={e => setNewNote(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none h-24 resize-none" />
                <button type="submit" className="w-full py-4 gradient-indigo text-white font-black rounded-xl uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/20">
                  Save to Cloud
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DailyTransition;