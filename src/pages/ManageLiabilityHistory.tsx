import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search,
  Filter,
  Calendar,
  User,
  History,
  Trash2,
  FileSpreadsheet,
  IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

// FIREBASE IMPORTS
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, where, deleteDoc, doc } from 'firebase/firestore';

interface Transition {
  id: string;
  name: string;
  amount: number;
  date: string;
  type: 'borrow' | 'payment' | 'income' | 'expense';
  remarks: string;
  category: string;
  source: string;
}

const ManageLiabilityHistory = () => {
  const navigate = useNavigate();
  const [transitions, setTransitions] = useState<Transition[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'borrow' | 'payment'>('all');
  const [loading, setLoading] = useState(true);

  // Helper for Indian Rupee Formatting
  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  // FETCH ONLY LIABILITY DATA FROM GLOBAL_ACTIVITIES
  useEffect(() => {
    const q = query(
      collection(db, 'global_activities'), 
      where('source', '==', 'Liability'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transition[];
      setTransitions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const downloadExcel = () => {
    const dataToExport = filteredTransitions.map(t => ({
      Date: t.date,
      Lender_Name: t.name || '---',
      Type: t.type.toUpperCase(),
      Category: t.category,
      Amount: t.amount,
      Remarks: t.remarks || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Liability_History');
    XLSX.writeFile(workbook, `Liability_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredTransitions = transitions.filter(t => {
    const matchesSearch = (t.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (t.remarks || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this record from history? This will not affect your current balance but will remove the log.')) {
      try {
        await deleteDoc(doc(db, 'global_activities', id));
      } catch (error) {
        console.error("Error deleting log: ", error);
      }
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/manage-liability')}
            className="p-3 glass rounded-2xl hover:bg-white transition-all text-slate-600 border border-slate-200 shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Liability Logs</h2>
            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
              <History size={16} />
              {loading ? 'Fetching records...' : `Total ${transitions.length} history entries`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={downloadExcel}
            className="px-5 py-2.5 gradient-emerald text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2"
          >
            <FileSpreadsheet size={18} />
            Export to Excel
          </button>
        </div>
      </div>

      <div className="glass rounded-[2.5rem] p-6 border border-slate-200/60 shadow-sm">
        {/* FILTERS */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by lender or remarks..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            {(['all', 'borrow', 'payment'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                  filterType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-6 py-4">Lender / Detail</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Remarks</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredTransitions.map((t) => (
                  <motion.tr 
                    key={t.id} layout
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/50 transition-all group"
                  >
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md ${
                          t.type === 'borrow' ? 'gradient-rose' : 'gradient-emerald'
                        }`}>
                          {t.type === 'borrow' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{t.name || 'Unknown'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{t.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        t.type === 'borrow' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <p className={`text-lg font-black tracking-tighter ${
                        t.type === 'borrow' ? 'text-rose-500' : 'text-emerald-600'
                      }`}>
                        {t.type === 'borrow' ? '+' : '-'}{formatINR(Math.abs(t.amount)).replace('INR', '')}
                      </p>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                        <Calendar size={14} className="text-indigo-400" />
                        {t.date}
                      </div>
                    </td>
                    <td className="px-6 py-6 max-w-[200px]">
                      <p className="text-xs text-slate-500 font-medium italic truncate">"{t.remarks || 'No notes'}"</p>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredTransitions.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
               No liability records found in the cloud
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageLiabilityHistory;