import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  History, 
  Trash2, 
  TrendingDown, 
  Scale, 
  AlertCircle, 
  CheckCircle2,
  MoreVertical,
  ChevronRight,
  User,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Liability {
  id: string;
  name: string;
  amount: number;
  paid: number;
  date: string;
  remarks: string;
  status: 'active' | 'cleared' | 'warning';
}

interface Transition {
  id: string;
  liabilityId: string;
  name: string;
  amount: number;
  date: string;
  type: 'borrow' | 'payment';
  remarks: string;
}

const ManageLiability = () => {
  const navigate = useNavigate();
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Global Transition Logger
  const logGlobalTransition = (data: any) => {
    const saved = localStorage.getItem('global_transitions');
    const transitions = saved ? JSON.parse(saved) : [];
    transitions.push({
      id: Date.now().toString(),
      ...data
    });
    localStorage.setItem('global_transitions', JSON.stringify(transitions));
  };

  // Form States
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRemarks, setNewRemarks] = useState('');

  const [selectedLiabilityId, setSelectedLiabilityId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentRemarks, setPaymentRemarks] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('liabilities');
    if (saved) setLiabilities(JSON.parse(saved));
    else {
      const initial = [
        { id: '1', name: 'John Doe', amount: 5000, paid: 2000, date: '2024-10-01', remarks: 'Business startup loan', status: 'active' },
        { id: '2', name: 'Sarah Smith', amount: 12000, paid: 12000, date: '2024-09-15', remarks: 'Equipment purchase', status: 'cleared' },
        { id: '3', name: 'Mike Ross', amount: 8500, paid: 1500, date: '2024-10-05', remarks: 'Home renovation', status: 'warning' },
      ];
      setLiabilities(initial as Liability[]);
      localStorage.setItem('liabilities', JSON.stringify(initial));
    }
  }, []);

  const saveLiabilities = (updated: Liability[]) => {
    setLiabilities(updated);
    localStorage.setItem('liabilities', JSON.stringify(updated));
  };

  const addTransition = (transition: Omit<Transition, 'id'>) => {
    const saved = localStorage.getItem('liability_transitions');
    const transitions = saved ? JSON.parse(saved) : [];
    transitions.push({ ...transition, id: Date.now().toString() });
    localStorage.setItem('liability_transitions', JSON.stringify(transitions));
  };

  const handleAddLiability = (e: React.FormEvent) => {
    e.preventDefault();
    const newLiability: Liability = {
      id: Date.now().toString(),
      name: newName,
      amount: parseFloat(newAmount),
      paid: 0,
      date: newDate,
      remarks: newRemarks,
      status: 'active'
    };
    const updated = [...liabilities, newLiability];
    saveLiabilities(updated);
    
    // Legacy transition for backward compatibility if needed
    addTransition({
      liabilityId: newLiability.id,
      name: newName,
      amount: parseFloat(newAmount),
      date: newDate,
      type: 'borrow',
      remarks: newRemarks
    });

    // Global transition
    logGlobalTransition({
      type: 'borrow',
      category: 'Liability',
      name: newName,
      amount: parseFloat(newAmount),
      date: newDate,
      remarks: newRemarks
    });

    setShowAddModal(false);
    setNewName(''); setNewAmount(''); setNewRemarks('');
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    const updated = liabilities.map(l => {
      if (l.id === selectedLiabilityId) {
        const newPaid = l.paid + amount;
        return { 
          ...l, 
          paid: newPaid, 
          status: newPaid >= l.amount ? 'cleared' : (newPaid > 0 ? 'active' : l.status) 
        } as Liability;
      }
      return l;
    });
    saveLiabilities(updated);
    const liability = liabilities.find(l => l.id === selectedLiabilityId);
    if (liability) {
      addTransition({
        liabilityId: selectedLiabilityId,
        name: liability.name,
        amount: -amount,
        date: paymentDate,
        type: 'payment',
        remarks: paymentRemarks
      });

      // Global transition
      logGlobalTransition({
        type: 'payment',
        category: 'Liability Repayment',
        name: liability.name,
        amount: -amount,
        date: paymentDate,
        remarks: paymentRemarks
      });
    }
    setShowPaymentModal(false);
    setPaymentAmount(''); setPaymentRemarks('');
  };

  const totalOutstanding = liabilities.reduce((acc, l) => acc + (l.amount - l.paid), 0);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Manage Liability</h2>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            <Scale size={16} />
            Track borrowings and repayments
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => navigate('/manage-liability/history')}
            className="px-5 py-2.5 glass text-slate-700 font-bold rounded-xl hover:bg-white transition-all border border-slate-200 shadow-sm flex items-center gap-2"
          >
            <History size={18} />
            View All Transition
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 gradient-indigo text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Add Liability
          </button>
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="px-5 py-2.5 gradient-emerald text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all flex items-center gap-2"
          >
            <DollarSign size={18} />
            Add Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="gradient-indigo p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Total Outstanding</p>
            <h3 className="text-4xl font-black tracking-tight">${totalOutstanding.toLocaleString()}</h3>
            <div className="mt-6 flex items-center gap-2 text-indigo-100/80 text-sm font-medium">
              <AlertCircle size={16} />
              Across {liabilities.filter(l => l.status !== 'cleared').length} active records
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        </div>
        
        <div className="gradient-emerald p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-emerald-100 text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Total Paid</p>
            <h3 className="text-4xl font-black tracking-tight">
              ${liabilities.reduce((acc, l) => acc + l.paid, 0).toLocaleString()}
            </h3>
            <div className="mt-6 flex items-center gap-2 text-emerald-100/80 text-sm font-medium">
              <CheckCircle2 size={16} />
              Repayment Progress: {Math.round((liabilities.reduce((acc, l) => acc + l.paid, 0) / liabilities.reduce((acc, l) => acc + l.amount, 0)) * 100 || 0)}%
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        </div>

        <div className="glass p-8 rounded-[2.5rem] border border-slate-200/60 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Total Debt</p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">
              ${liabilities.reduce((acc, l) => acc + l.amount, 0).toLocaleString()}
            </h3>
            <div className="mt-6 flex items-center gap-2 text-slate-400 text-sm font-medium">
              <TrendingDown size={16} />
              Lifetime borrowed amount
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="glass rounded-[2.5rem] p-8 border border-slate-200/60 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Active Lenders List</h3>
          </div>

          <div className="overflow-x-auto -mx-8 px-8">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-12 gap-4 py-4 px-6 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <div className="col-span-3">Lender Name</div>
                <div className="col-span-2">Borrowed Amount</div>
                <div className="col-span-2">Paid Amount</div>
                <div className="col-span-2">Outstanding</div>
                <div className="col-span-2">Progress</div>
                <div className="col-span-1 text-center">Action</div>
              </div>

              <div className="divide-y divide-slate-50">
                {liabilities.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                    <Scale size={48} className="mb-4 opacity-20" />
                    <p className="font-bold text-lg">No liabilities found</p>
                  </div>
                ) : (
                  liabilities.map((l, i) => (
                    <motion.div 
                      key={l.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="grid grid-cols-12 gap-4 py-6 px-6 items-center hover:bg-slate-50/50 transition-all rounded-2xl group"
                    >
                      <div className="col-span-3 flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg ${
                          l.status === 'cleared' ? 'gradient-emerald' : l.status === 'warning' ? 'gradient-rose' : 'gradient-indigo'
                        }`}>
                          <User size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 tracking-tight leading-tight">{l.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar size={10} />
                            {l.date}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-black text-slate-900">${l.amount.toLocaleString()}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-black text-emerald-600">${l.paid.toLocaleString()}</p>
                      </div>
                      <div className="col-span-2">
                        <p className={`text-base font-black ${l.status === 'cleared' ? 'text-slate-300' : 'text-slate-900'}`}>
                          ${(l.amount - l.paid).toLocaleString()}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(l.paid / l.amount) * 100}%` }}
                              className={`h-full ${l.status === 'cleared' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 w-8">{Math.round((l.paid / l.amount) * 100)}%</span>
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        {l.status !== 'cleared' ? (
                          <button 
                            onClick={() => {
                              setSelectedLiabilityId(l.id);
                              setShowPaymentModal(true);
                            }}
                            className="px-4 py-1.5 gradient-emerald text-white text-[10px] font-black rounded-lg shadow-md hover:scale-105 transition-all uppercase tracking-widest"
                          >
                            Pay
                          </button>
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 size={14} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Liability Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden flex items-center justify-center p-4 py-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-dark rounded-[2.5rem] p-6 sm:p-8 shadow-2xl my-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl gradient-indigo flex items-center justify-center text-white">
                    <Plus size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Add Liability</h3>
                    <p className="text-slate-400 text-sm">Create a new financial obligation</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <form onSubmit={handleAddLiability} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 ml-1">Lender Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={18} />
                    <input 
                      type="text" required value={newName} onChange={e => setNewName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-white transition-all font-medium"
                      placeholder="Who did you borrow from?"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Amount</label>
                    <div className="relative group">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={18} />
                      <input 
                        type="number" required value={newAmount} onChange={e => setNewAmount(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-white transition-all font-medium"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Date</label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={18} />
                      <input 
                        type="date" required value={newDate} onChange={e => setNewDate(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-white transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 ml-1">Remarks</label>
                  <div className="relative group">
                    <FileText className="absolute left-4 top-4 text-slate-500 group-focus-within:text-indigo-400" size={18} />
                    <textarea 
                      value={newRemarks} onChange={e => setNewRemarks(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-white transition-all font-medium min-h-[100px]"
                      placeholder="What is this loan for?"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 gradient-indigo text-white font-black rounded-2xl shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                >
                  Confirm Addition
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden flex items-center justify-center p-4 py-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-dark rounded-[2.5rem] p-6 sm:p-8 shadow-2xl my-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl gradient-emerald flex items-center justify-center text-white">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Record Payment</h3>
                    <p className="text-slate-400 text-sm">Pay off your debts</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <form onSubmit={handleAddPayment} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 ml-1">Select Liability</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400" size={18} />
                    <select 
                      required value={selectedLiabilityId} onChange={e => setSelectedLiabilityId(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-white transition-all font-medium appearance-none"
                    >
                      <option value="">Choose Lender...</option>
                      {liabilities.filter(l => l.status !== 'cleared').map(l => (
                        <option key={l.id} value={l.id}>{l.name} (Bal: ${(l.amount - l.paid).toLocaleString()})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Amount Paid</label>
                    <div className="relative group">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400" size={18} />
                      <input 
                        type="number" required value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-white transition-all font-medium"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 ml-1">Date</label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400" size={18} />
                      <input 
                        type="date" required value={paymentDate} onChange={e => setPaymentDate(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-white transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 ml-1">Remarks</label>
                  <div className="relative group">
                    <FileText className="absolute left-4 top-4 text-slate-500 group-focus-within:text-emerald-400" size={18} />
                    <textarea 
                      value={paymentRemarks} onChange={e => setPaymentRemarks(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-white transition-all font-medium min-h-[100px]"
                      placeholder="Add a note about this payment..."
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 gradient-emerald text-white font-black rounded-2xl shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                >
                  Record Repayment
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageLiability;
