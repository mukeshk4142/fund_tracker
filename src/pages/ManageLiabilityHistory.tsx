import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search,
  Filter,
  Calendar,
  User,
  History,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Transition {
  id: string;
  liabilityId: string;
  name: string;
  amount: number;
  date: string;
  type: 'borrow' | 'payment';
  remarks: string;
}

const ManageLiabilityHistory = () => {
  const navigate = useNavigate();
  const [transitions, setTransitions] = useState<Transition[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'borrow' | 'payment'>('all');

  useEffect(() => {
    const savedGlobal = localStorage.getItem('global_transitions');
    if (savedGlobal) {
      setTransitions(JSON.parse(savedGlobal).sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } else {
      // If no global exists yet, try to pull from legacy liability transitions or use defaults
      const savedLegacy = localStorage.getItem('liability_transitions');
      if (savedLegacy) {
        const legacy = JSON.parse(savedLegacy);
        const transformed = legacy.map((t: any) => ({
          ...t,
          category: t.type === 'borrow' ? 'Liability' : 'Liability Repayment'
        }));
        setTransitions(transformed);
        localStorage.setItem('global_transitions', JSON.stringify(transformed));
      } else {
        const initial = [
          { id: '1', name: 'John Doe', amount: 5000, date: '2024-10-01', type: 'borrow', category: 'Liability', remarks: 'Business startup loan' },
          { id: '2', name: 'John Doe', amount: -2000, date: '2024-10-10', type: 'payment', category: 'Liability Repayment', remarks: 'First installment' },
        ];
        setTransitions(initial as any[]);
        localStorage.setItem('global_transitions', JSON.stringify(initial));
      }
    }
  }, []);

  const downloadExcel = () => {
    const data = transitions.map(t => ({
      Date: t.date,
      Name: t.name,
      Type: t.type.toUpperCase(),
      Amount: t.amount,
      Remarks: t.remarks
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transitions');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `Liability_Transitions_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredTransitions = transitions.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.remarks.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all transition history? This will reset the global log.')) {
      localStorage.removeItem('global_transitions');
      localStorage.removeItem('liability_transitions');
      setTransitions([]);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/manage-liability')}
            className="p-3 glass rounded-2xl hover:bg-white transition-all text-slate-600 border border-slate-200 shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Transition History</h2>
            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
              <History size={16} />
              Full log of all borrowing and payments
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={clearHistory}
            className="px-5 py-2.5 glass text-rose-500 font-bold rounded-xl hover:bg-rose-50 transition-all border border-rose-100 shadow-sm flex items-center gap-2"
          >
            <Trash2 size={18} />
            Clear Log
          </button>
          <button 
            onClick={downloadExcel}
            className="px-5 py-2.5 gradient-emerald text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all flex items-center gap-2"
          >
            <FileSpreadsheet size={18} />
            Download Excel
          </button>
        </div>
      </div>

      <div className="glass rounded-[2.5rem] p-6 border border-slate-200/60">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or remarks..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-slate-900 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0">
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              {(['all', 'borrow', 'payment'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    filterType === type 
                      ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' 
                      : 'text-slate-500 hover:text-indigo-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden xl:block overflow-x-auto -mx-6 px-6">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-6 gap-4 py-4 px-6 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                <div className="col-span-2">Transition Detail</div>
                <div>Amount</div>
                <div>Date</div>
                <div className="col-span-2">Remarks</div>
              </div>

              <div className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                  {filteredTransitions.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-20 flex flex-col items-center justify-center text-slate-400"
                    >
                      <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Search size={24} className="opacity-20" />
                      </div>
                      <p className="font-bold">No transitions found matching your search</p>
                    </motion.div>
                  ) : (
                    filteredTransitions.map((t, i) => (
                      <motion.div 
                        key={t.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: i * 0.05 }}
                        className="grid grid-cols-6 gap-4 py-6 px-6 items-center hover:bg-slate-50/50 transition-all rounded-2xl group"
                      >
                        <div className="col-span-2 flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                            t.type === 'borrow' ? 'gradient-rose' : 'gradient-emerald'
                          }`}>
                            {t.type === 'borrow' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 tracking-tight flex items-center gap-2">
                              {t.name}
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest ${
                                t.type === 'borrow' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                              }`}>
                                {(t as any).category || t.type}
                              </span>
                            </p>
                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                              <User size={12} />
                              ID: #{t.id.slice(-6)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className={`text-lg font-black tracking-tight ${
                            t.type === 'borrow' ? 'text-rose-500' : 'text-emerald-500'
                          }`}>
                            {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400" />
                            {t.date}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-slate-500 font-medium italic line-clamp-2">
                            "{t.remarks || 'No remarks provided'}"
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="xl:hidden space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredTransitions.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  <p className="font-bold">No transitions found</p>
                </div>
              ) : (
                filteredTransitions.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-white border border-slate-100 rounded-[2rem] space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                          t.type === 'borrow' ? 'gradient-rose' : 'gradient-emerald'
                        }`}>
                          {t.type === 'borrow' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 tracking-tight">{t.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-black tracking-tight ${
                          t.type === 'borrow' ? 'text-rose-500' : 'text-emerald-500'
                        }`}>
                          {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toLocaleString()}
                        </p>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest ${
                          t.type === 'borrow' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {t.type}
                        </span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                      <p className="text-xs text-slate-500 font-medium italic">
                        "{t.remarks || 'No remarks provided'}"
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageLiabilityHistory;
