import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Search, ArrowUpRight, ArrowDownLeft, Calendar, 
  Filter, Activity, Scale, Receipt, CheckCircle2, 
  HandCoins, Trash2, TrendingUp, Wallet, IndianRupee
} from 'lucide-react';
import * as XLSX from 'xlsx';

// FIREBASE IMPORTS
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

interface UnifiedTransaction {
  id: string;
  type: 'income' | 'expense' | 'borrow' | 'payment';
  category: string;
  name?: string;
  amount: number;
  date: string;
  remarks?: string;
  source: 'Daily' | 'Stock' | 'Lent' | 'Liability' | 'Bills';
}

const Transfer = () => {
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrigin, setFilterOrigin] = useState('All');
  const [loading, setLoading] = useState(true);

  // Helper for Indian Rupee Formatting
  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  // 1. FETCH UNIFIED DATA FROM CLOUD
  useEffect(() => {
    const q = query(collection(db, 'global_activities'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UnifiedTransaction[];
      setTransactions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. FILTER LOGIC
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (t.remarks || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.category || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterOrigin === 'All' || t.source === filterOrigin;
      return matchesSearch && matchesFilter;
    });
  }, [transactions, searchTerm, filterOrigin]);

  // 3. EXCEL DOWNLOAD FUNCTION
  const downloadExcel = () => {
    const dataToExport = filtered.map(t => ({
      Date: t.date,
      Source: t.source,
      Category: t.category,
      Name: t.name || '---',
      Type: t.type.toUpperCase(),
      Amount: t.amount,
      Remarks: t.remarks || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Unified_History");
    XLSX.writeFile(workbook, `FinTrack_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // 4. ICON & COLOR LOGIC
  const getIcon = (source: string, type: string) => {
    const isIncome = type === 'income' || type === 'payment';
    switch (source) {
      case 'Daily': return <Activity className={isIncome ? "text-emerald-500" : "text-rose-500"} />;
      case 'Stock': return <TrendingUp className={isIncome ? "text-emerald-500" : "text-rose-500"} />;
      case 'Bills': return <Receipt className="text-indigo-500" />;
      case 'Liability': return <Scale className="text-amber-500" />;
      case 'Lent': return isIncome ? <HandCoins className="text-emerald-600" /> : <ArrowUpRight className="text-amber-600" />;
      default: return <Wallet className="text-slate-400" />;
    }
  };

  const isPositive = (type: string) => type === 'income' || type === 'payment';

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">GLOBAL ACTIVITY</h1>
          <p className="text-slate-500 font-bold flex items-center gap-2 mt-1 uppercase tracking-widest text-xs">
            <Activity size={16} />
            {loading ? 'Syncing Cloud Logs...' : `Accessing ${transactions.length} Records`}
          </p>
        </div>
        <button
          onClick={downloadExcel}
          className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
        >
          <Download size={20} />
          DOWNLOAD REPORT (EXCEL)
        </button>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, category, or remarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold"
          />
        </div>
        <div className="md:col-span-2 relative">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <select
            value={filterOrigin}
            onChange={(e) => setFilterOrigin(e.target.value)}
            className="w-full pl-14 pr-10 py-5 bg-white border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 outline-none font-black uppercase tracking-widest text-xs appearance-none cursor-pointer"
          >
            <option value="All">All Sources</option>
            <option value="Daily">Daily Activities</option>
            <option value="Stock">Stock Income</option>
            <option value="Bills">Credit Bills</option>
            <option value="Lent">Lent Tracker</option>
            <option value="Liability">Liabilities</option>
          </select>
        </div>
      </div>

      {/* Activity Table */}
      <div className="glass rounded-[3rem] overflow-hidden shadow-2xl border border-white/40">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900/5">
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Source / Category</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {filtered.map((t) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={t.id}
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-5">
                        <div className={`h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center`}>
                          {getIcon(t.source, t.type)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-none mb-1.5">{t.name || t.category}</p>
                          <p className="text-xs font-bold text-slate-400 italic truncate max-w-[250px]">{t.remarks || 'No remarks'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="space-y-1">
                        <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                          {t.source}
                        </span>
                        <p className="text-xs font-bold text-slate-500 uppercase mt-1">{t.category}</p>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-2 text-slate-600 font-black text-sm">
                        <Calendar size={14} className="text-indigo-400" />
                        {t.date}
                      </div>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <p className={`text-2xl font-black tracking-tighter ${isPositive(t.type) ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isPositive(t.type) ? '+' : '-'}{formatINR(t.amount).replace('INR', '')}
                      </p>
                    </td>
                    <td className="px-8 py-7 text-center">
                      <button 
                        onClick={async () => {
                          if(window.confirm("Delete from Global Log?")) {
                            await deleteDoc(doc(db, 'global_activities', t.id));
                          }
                        }}
                        className="p-3 text-slate-300 hover:text-rose-500 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filtered.length === 0 && !loading && (
            <div className="py-32 text-center">
               <Activity className="mx-auto text-slate-200 mb-4" size={64} />
               <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No synchronized logs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transfer;