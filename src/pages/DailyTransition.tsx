import React, { useState, useEffect } from 'react';
import { 
  CalendarPlus, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Tag, 
  Trash2,
  Filter,
  MoreVertical,
  CheckCircle2,
  Activity,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [timeFilter, setTimeFilter] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | '5 Year'>('Daily');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const saved = localStorage.getItem('daily_transitions');
    if (saved) setTransactions(JSON.parse(saved));
    else {
      const initial = [
        { id: '1', type: 'income', category: 'Salary', amount: 5000, date: '2024-10-14', note: 'Monthly salary' },
        { id: '2', type: 'expense', category: 'Food', amount: 45.50, date: '2024-10-14', note: 'Lunch with colleagues' },
        { id: '3', type: 'expense', category: 'Transport', amount: 15.00, date: '2024-10-13', note: 'Uber ride' },
      ];
      setTransactions(initial as Transaction[]);
      localStorage.setItem('daily_transitions', JSON.stringify(initial));
    }
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newTx: Transaction = {
      id: Date.now().toString(),
      type: newType,
      category: newCategory,
      amount: parseFloat(newAmount),
      date: newDate,
      note: newNote,
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    localStorage.setItem('daily_transitions', JSON.stringify(updated));

    // Global transition logger
    const logGlobalTransition = (data: any) => {
      const saved = localStorage.getItem('global_transitions');
      const transitions = saved ? JSON.parse(saved) : [];
      transitions.push({
        id: Date.now().toString(),
        ...data
      });
      localStorage.setItem('global_transitions', JSON.stringify(transitions));
    };

    logGlobalTransition({
      type: newType === 'income' ? 'payment' : 'borrow', // internal visualization types
      category: `Daily ${newType} - ${newCategory}`,
      name: newCategory,
      amount: newType === 'income' ? parseFloat(newAmount) : -parseFloat(newAmount),
      date: newDate,
      remarks: newNote
    });

    setShowAddModal(false);
    setNewCategory(''); setNewAmount(''); setNewNote('');
  };

  const deleteTx = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem('daily_transitions', JSON.stringify(updated));
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      if (timeFilter === 'Daily') {
        return t.date === new Date().toISOString().split('T')[0];
      } else if (timeFilter === 'Weekly') {
        const lastWeek = new Date();
        lastWeek.setDate(now.getDate() - 7);
        return tDate >= lastWeek;
      } else if (timeFilter === 'Monthly') {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === 'Yearly') {
        return tDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === '5 Year') {
        return tDate.getFullYear() >= now.getFullYear() - 5;
      }
      return true;
    });
  };

  const filteredTxs = getFilteredTransactions();
  const totalIncome = filteredTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filteredTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('food')) return <Coffee size={18} />;
    if (c.includes('salary')) return <TrendingUp size={18} />;
    if (c.includes('shopping')) return <ShoppingBag size={18} />;
    if (c.includes('transport') || c.includes('uber')) return <Car size={18} />;
    if (c.includes('rent') || c.includes('home')) return <Home size={18} />;
    return <Tag size={18} />;
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Daily Transitions</h2>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            <CalendarPlus size={16} />
            Track your daily income and expenses
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
            {(['Daily', 'Weekly', 'Monthly', 'Yearly', '5 Year'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  timeFilter === filter 
                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

          <button 
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 gradient-indigo text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            New Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden group border border-slate-200/60">
          <div className="relative z-10">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">{timeFilter === 'Daily' ? "Today's" : timeFilter} Income</p>
            <h3 className="text-4xl font-black text-emerald-500 tracking-tight">${totalIncome.toLocaleString()}</h3>
            <div className="mt-6 flex items-center gap-2 text-slate-400 text-sm font-medium">
              <TrendingUp size={16} className="text-emerald-500" />
              Total earnings received
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 gradient-emerald rounded-full blur-3xl opacity-5 group-hover:scale-150 transition-transform duration-700" />
        </div>
        
        <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden group border border-slate-200/60">
          <div className="relative z-10">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">{timeFilter === 'Daily' ? "Today's" : timeFilter} Expense</p>
            <h3 className="text-4xl font-black text-rose-500 tracking-tight">${totalExpense.toLocaleString()}</h3>
            <div className="mt-6 flex items-center gap-2 text-slate-400 text-sm font-medium">
              <TrendingDown size={16} className="text-rose-500" />
              Total money spent
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 gradient-rose rounded-full blur-3xl opacity-5 group-hover:scale-150 transition-transform duration-700" />
        </div>

        <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden group border border-slate-200/60">
          <div className="relative z-10">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">{timeFilter === 'Daily' ? 'Net Balance' : timeFilter + ' Net'}</p>
            <h3 className={`text-4xl font-black tracking-tight ${(totalIncome - totalExpense) >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
              ${(totalIncome - totalExpense).toLocaleString()}
            </h3>
            <div className="mt-6 flex items-center gap-2 text-slate-400 text-sm font-medium">
              <Activity size={16} className="text-indigo-500" />
              Your actual savings
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 gradient-indigo rounded-full blur-3xl opacity-5 group-hover:scale-150 transition-transform duration-700" />
        </div>
      </div>

      <div className="glass rounded-[2.5rem] p-6 border border-slate-200/60">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-8 px-2">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search entries..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-slate-900 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
            {filteredTxs.map((t, i) => (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                    t.type === 'income' ? 'gradient-emerald' : 'gradient-rose'
                  }`}>
                    {getCategoryIcon(t.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-black text-slate-900 tracking-tight">{t.category}</p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${
                        t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                        {t.type}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mt-0.5 line-clamp-1 italic">"{t.note}"</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-10 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-50">
                  <div className="text-left sm:text-right">
                    <p className={`text-xl font-black tracking-tight ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-900'}`}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => deleteTx(t.id)}
                      className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] overflow-y-auto pt-16 md:pt-24">
            <div className="flex items-start justify-center min-h-screen p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddModal(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="relative w-full max-w-md glass-dark rounded-[2.5rem] p-6 sm:p-7 shadow-2xl mx-4"
              >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl gradient-indigo flex items-center justify-center text-white">
                    <CalendarPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">New Transition</h3>
                    <p className="text-slate-400 text-xs">Add income or expense</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-4">
                <div className="flex p-1.5 bg-slate-800/50 border border-slate-700 rounded-2xl">
                  {(['income', 'expense'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewType(type)}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        newType === type 
                          ? 'bg-white text-slate-900 shadow-xl' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category</label>
                  <div className="relative group">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={16} />
                    <input 
                      type="text" required value={newCategory} onChange={e => setNewCategory(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-white transition-all font-bold text-sm"
                      placeholder="Food, Salary, Rent..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Amount</label>
                    <div className="relative group">
                      <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={16} />
                      <input 
                        type="number" required value={newAmount} onChange={e => setNewAmount(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-white transition-all font-black text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Date</label>
                    <input 
                      type="date" required value={newDate} onChange={e => setNewDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-white transition-all font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Note</label>
                  <textarea 
                    value={newNote} onChange={e => setNewNote(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-white transition-all font-medium text-sm min-h-[80px] resize-none"
                    placeholder="Brief description..."
                  />
                </div>

                <button 
                  type="submit"
                  className={`w-full py-4 text-white font-black rounded-xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 uppercase tracking-widest text-xs ${
                    newType === 'income' ? 'gradient-emerald shadow-emerald-500/30' : 'gradient-indigo shadow-indigo-500/30'
                  }`}
                >
                  <CheckCircle2 size={18} />
                  Add {newType}
                </button>
              </form>
            </motion.div>
          </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DailyTransition;
