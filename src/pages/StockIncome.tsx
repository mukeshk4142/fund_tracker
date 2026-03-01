import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, TrendingUp, ArrowUpCircle, ArrowDownCircle, Wallet,
  Calendar, X, Search, Trash2, IndianRupee
} from 'lucide-react';

// FIREBASE IMPORTS
import { db } from '../lib/firebase';
import { 
  collection, addDoc, deleteDoc, doc, onSnapshot, 
  query, orderBy, serverTimestamp 
} from 'firebase/firestore';

interface StockTransaction {
  id: string;
  type: 'withdrawal' | 'deposit'; 
  amount: number;
  date: string;
  remark: string;
}

const StockIncome: React.FC = () => {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'withdrawal' | 'deposit'>('all');
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    type: 'withdrawal' as 'withdrawal' | 'deposit',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    remark: ''
  });

  // Helper for Indian Rupee Formatting
  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amt);
  };

  // FETCH FROM FIREBASE
  useEffect(() => {
    const q = query(collection(db, 'stock_activities'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StockTransaction[];
      setTransactions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;

    try {
      const cleanAmount = Math.round(parseFloat(formData.amount) * 100) / 100;

      const newTx = {
        type: formData.type,
        amount: cleanAmount,
        date: formData.date,
        remark: formData.remark,
        createdAt: serverTimestamp()
      };

      // 1. Save to stock_activities collection
      await addDoc(collection(db, 'stock_activities'), newTx);

      // 2. Sync to Global Activity (Unified Report Hub)
      await addDoc(collection(db, 'global_activities'), {
        type: formData.type === 'withdrawal' ? 'income' : 'expense',
        category: `Stock ${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`,
        amount: cleanAmount,
        date: formData.date,
        source: 'Stock', // Essential for Global filtering
        remarks: formData.remark,
        createdAt: serverTimestamp()
      });
      
      setShowModal(false);
      setFormData({
        type: 'withdrawal',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        remark: ''
      });
    } catch (error) {
      console.error("Error adding stock transaction: ", error);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (window.confirm("Delete this stock record?")) {
      try {
        await deleteDoc(doc(db, 'stock_activities', id));
      } catch (error) {
        console.error("Error deleting: ", error);
      }
    }
  };

  const totals = transactions.reduce((acc, curr) => {
    if (curr.type === 'withdrawal') acc.withdraw += Number(curr.amount);
    else acc.deposit += Number(curr.amount);
    return acc;
  }, { withdraw: 0, deposit: 0 });

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.remark?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || t.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="text-indigo-600 h-8 w-8" />
            Stock Income
          </h1>
          <p className="text-slate-500 font-medium">{loading ? 'Syncing...' : 'Manage market withdrawals & deposits'}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          ADD TRANSACTION
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><ArrowUpCircle size={24} /></div>
            <span className="font-bold text-slate-500 uppercase text-xs">Total Withdrawals</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tighter">
            +{formatINR(totals.withdraw)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600"><ArrowDownCircle size={24} /></div>
            <span className="font-bold text-slate-500 uppercase text-xs">Total Deposits</span>
          </div>
          <div className="text-2xl font-black text-rose-600 tracking-tighter">
            -{formatINR(totals.deposit)}
          </div>
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-200">
          <div className="flex items-center gap-3 mb-4 text-indigo-100">
            <div className="p-2 bg-white/20 rounded-xl"><Wallet size={24} /></div>
            <span className="font-bold uppercase text-xs">Net Stock Profit</span>
          </div>
          <div className="text-2xl font-black text-white tracking-tighter">
            {formatINR(totals.withdraw - totals.deposit)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Cloud History</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search remark..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none w-full sm:w-64 font-medium" />
            </div>
            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
              {(['all', 'withdrawal', 'deposit'] as const).map((filter) => (
                <button key={filter} onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${activeFilter === filter ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {filter === 'withdrawal' ? 'Withdraw' : filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b">
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Remark</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.map((t) => (
                  <motion.tr key={t.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${t.type === 'withdrawal' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {t.type === 'withdrawal' ? 'Withdrawal' : 'Deposit'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-lg font-black tracking-tight ${t.type === 'withdrawal' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'withdrawal' ? '+' : '-'}{formatINR(t.amount).replace('INR', '')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-600">{t.remark || '---'}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm font-bold">{t.date}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => deleteTransaction(t.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={18} /></button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredTransactions.length === 0 && <p className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-sm italic">No records found</p>}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8">
              <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Add Stock Activity</h3>
              <form onSubmit={handleAddTransaction} className="space-y-6">
                <div className="flex gap-4 p-1 bg-slate-50 rounded-2xl border">
                  <button type="button" onClick={() => setFormData({...formData, type: 'withdrawal'})}
                    className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${formData.type === 'withdrawal' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}
                  >WITHDRAW</button>
                  <button type="button" onClick={() => setFormData({...formData, type: 'deposit'})}
                    className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${formData.type === 'deposit' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500'}`}
                  >DEPOSIT</button>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Amount (₹)</label>
                  <input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border rounded-2xl outline-none font-black text-lg focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="0.00" />
                </div>
                <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold text-slate-600 outline-none" />
                <input type="text" value={formData.remark} onChange={(e) => setFormData({...formData, remark: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-bold text-slate-600 outline-none" placeholder="Remark (Optional)" />
                <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl active:scale-[0.98]">
                  SAVE TRANSACTION
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockIncome;