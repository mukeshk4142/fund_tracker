import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  TrendingUp, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet,
  Calendar,
  X,
  Search,
  Trash2,
  Filter
} from 'lucide-react';

interface StockTransaction {
  id: string;
  type: 'withdraw' | 'deposit';
  amount: number;
  date: string;
  remark: string;
}

const StockIncome: React.FC = () => {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'withdraw' | 'deposit'>('all');
  
  // Form State
  const [formData, setFormData] = useState({
    type: 'withdraw' as 'withdraw' | 'deposit',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    remark: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('stock_transactions');
    if (saved) setTransactions(JSON.parse(saved));
  }, []);

  const saveToGlobal = (transaction: StockTransaction) => {
    const globalHistory = JSON.parse(localStorage.getItem('global_activity') || '[]');
    const newEntry = {
      id: `stock-${transaction.id}`,
      name: `Stock ${transaction.type === 'withdraw' ? 'Withdrawal' : 'Deposit'}`,
      category: 'Stock Income',
      type: transaction.type === 'withdraw' ? 'income' : 'expense',
      amount: transaction.amount,
      date: transaction.date,
      remarks: transaction.remark,
      timestamp: Date.now()
    };
    localStorage.setItem('global_activity', JSON.stringify([newEntry, ...globalHistory]));
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;

    const newTransaction: StockTransaction = {
      id: Date.now().toString(),
      type: formData.type,
      amount: parseFloat(formData.amount),
      date: formData.date,
      remark: formData.remark
    };

    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    localStorage.setItem('stock_transactions', JSON.stringify(updated));
    saveToGlobal(newTransaction);
    
    setShowModal(false);
    setFormData({
      type: 'withdraw',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      remark: ''
    });
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem('stock_transactions', JSON.stringify(updated));
    
    // Also remove from global
    const globalHistory = JSON.parse(localStorage.getItem('global_activity') || '[]');
    const filteredGlobal = globalHistory.filter((item: any) => item.id !== `stock-${id}`);
    localStorage.setItem('global_activity', JSON.stringify(filteredGlobal));
  };

  const totals = transactions.reduce((acc, curr) => {
    if (curr.type === 'withdraw') acc.withdraw += curr.amount;
    else acc.deposit += curr.amount;
    return acc;
  }, { withdraw: 0, deposit: 0 });

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.remark.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || t.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="text-indigo-600 h-8 w-8" />
            Stock Income
          </h1>
          <p className="text-slate-500 font-medium">Manage your market withdrawals & deposits</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          ADD TRANSACTION
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <ArrowUpCircle size={24} />
            </div>
            <span className="font-bold text-slate-500 uppercase text-xs tracking-wider">Total Withdrawals</span>
          </div>
          <div className="text-3xl font-black text-emerald-600 tracking-tighter">
            +${totals.withdraw.toLocaleString()}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <ArrowDownCircle size={24} />
            </div>
            <span className="font-bold text-slate-500 uppercase text-xs tracking-wider">Total Deposits</span>
          </div>
          <div className="text-3xl font-black text-rose-600 tracking-tighter">
            -${totals.deposit.toLocaleString()}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-200"
        >
          <div className="flex items-center gap-3 mb-4 text-indigo-100">
            <div className="p-2 bg-white/20 rounded-xl">
              <Wallet size={24} />
            </div>
            <span className="font-bold uppercase text-xs tracking-wider">Net Stock Balance</span>
          </div>
          <div className="text-3xl font-black text-white tracking-tighter">
            ${(totals.withdraw - totals.deposit).toLocaleString()}
          </div>
        </motion.div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Stock Activity</h2>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search remark..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64 font-medium"
              />
            </div>
            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
              {(['all', 'withdraw', 'deposit'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                    activeFilter === filter ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-50">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Remark</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.map((t) => (
                  <motion.tr 
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        t.type === 'withdraw' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {t.type === 'withdraw' ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                        {t.type}al
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-lg font-black tracking-tight ${
                        t.type === 'withdraw' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {t.type === 'withdraw' ? '+' : '-'}${t.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-600">{t.remark || '---'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                        <Calendar size={14} />
                        {new Date(t.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => deleteTransaction(t.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                <TrendingUp size={32} />
              </div>
              <p className="text-slate-400 font-bold">No stock activity found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto pt-16 md:pt-24">
            <div className="flex items-start justify-center min-h-screen p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -20 }}
                className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add Stock Activity</h3>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleAddTransaction} className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Transaction Type</label>
                    <div className="flex gap-4 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, type: 'withdraw'})}
                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                          formData.type === 'withdraw' 
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                          : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <ArrowUpCircle size={18} />
                        WITHDRAW
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, type: 'deposit'})}
                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                          formData.type === 'deposit' 
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' 
                          : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <ArrowDownCircle size={18} />
                        DEPOSIT
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Amount ($)</label>
                    <input 
                      type="number"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-lg transition-all"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Date</label>
                    <input 
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Remark / Note</label>
                    <input 
                      type="text"
                      value={formData.remark}
                      onChange={(e) => setFormData({...formData, remark: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-600 transition-all"
                      placeholder="Brokerage withdraw, Top up..."
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] mt-4"
                  >
                    SAVE TRANSACTION
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockIncome;
