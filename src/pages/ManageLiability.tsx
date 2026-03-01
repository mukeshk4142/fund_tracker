import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, History, Trash2, TrendingDown, Scale, AlertCircle, 
  CheckCircle2, User, Calendar, IndianRupee, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// FIREBASE IMPORTS
import { db } from '../lib/firebase';
import { 
  collection, addDoc, deleteDoc, doc, onSnapshot, 
  query, orderBy, serverTimestamp, updateDoc 
} from 'firebase/firestore';

interface Liability {
  id: string;
  name: string;
  amount: number;
  paid: number;
  date: string;
  remarks: string;
  status: 'active' | 'cleared' | 'warning';
}

const ManageLiability = () => {
  const navigate = useNavigate();
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form States
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRemarks, setNewRemarks] = useState('');

  const [selectedLiabilityId, setSelectedLiabilityId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentRemarks, setPaymentRemarks] = useState('');

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
    const q = query(collection(db, 'liability_obligations'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Liability[];
      setLiabilities(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ADD NEW LIABILITY
  const handleAddLiability = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amount = Math.round(parseFloat(newAmount) * 100) / 100;
      const newLiability = {
        name: newName,
        amount: amount,
        paid: 0,
        date: newDate,
        remarks: newRemarks,
        status: 'active',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'liability_obligations'), newLiability);
      setShowAddModal(false);
      setNewName(''); setNewAmount(''); setNewRemarks('');
    } catch (error) {
      console.error("Error adding liability: ", error);
    }
  };

  // RECORD PAYMENT
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const payAmt = Math.round(parseFloat(paymentAmount) * 100) / 100;
    const liability = liabilities.find(l => l.id === selectedLiabilityId);

    if (liability) {
      try {
        const newPaid = Math.round((Number(liability.paid) + payAmt) * 100) / 100;
        const liabilityRef = doc(db, 'liability_obligations', selectedLiabilityId);
        
        await updateDoc(liabilityRef, {
          paid: newPaid,
          status: newPaid >= liability.amount ? 'cleared' : 'active'
        });

        // Log transition to global history
        await addDoc(collection(db, 'global_activities'), {
          type: 'expense',
          category: 'Liability Payment',
          name: liability.name,
          amount: payAmt,
          date: paymentDate,
          remarks: paymentRemarks,
          source: 'Liability'
        });

        setShowPaymentModal(false);
        setPaymentAmount(''); setPaymentRemarks('');
      } catch (error) {
        console.error("Error updating payment: ", error);
      }
    }
  };

  const deleteLiability = async (id: string) => {
    if (window.confirm("Delete this record permanently?")) {
      await deleteDoc(doc(db, 'liability_obligations', id));
    }
  };

  const totalOutstanding = liabilities.reduce((acc, l) => acc + (Number(l.amount) - Number(l.paid)), 0);
  const totalPaid = liabilities.reduce((acc, l) => acc + Number(l.paid), 0);
  const totalBorrowed = liabilities.reduce((acc, l) => acc + Number(l.amount), 0);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Manage Liability</h2>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            <Scale size={16} />
            {loading ? 'Syncing Cloud...' : 'Track borrowings and repayments'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 gradient-indigo text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2">
            <Plus size={18} /> Add Liability
          </button>
          <button onClick={() => setShowPaymentModal(true)} className="px-5 py-2.5 gradient-emerald text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2">
            <IndianRupee size={18} /> Record Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="gradient-rose p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
          <p className="text-rose-100 text-sm font-bold uppercase mb-2 opacity-80">Outstanding Balance</p>
          <h3 className="text-3xl font-black">{formatINR(totalOutstanding)}</h3>
          <div className="mt-6 flex items-center gap-2 text-rose-100/80 text-xs font-bold">
            <AlertCircle size={14} /> {liabilities.filter(l => l.status !== 'cleared').length} Active Lenders
          </div>
        </div>
        
        <div className="gradient-emerald p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
          <p className="text-emerald-100 text-sm font-bold uppercase mb-2 opacity-80">Total Repaid</p>
          <h3 className="text-3xl font-black">{formatINR(totalPaid)}</h3>
          <div className="mt-6 flex items-center gap-2 text-emerald-100/80 text-xs font-bold">
            <CheckCircle2 size={14} /> Progress: {Math.round((totalPaid / totalBorrowed) * 100 || 0)}%
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border border-slate-200/60 relative overflow-hidden group">
          <p className="text-slate-500 text-sm font-bold uppercase mb-2">Lifetime Borrowed</p>
          <h3 className="text-3xl font-black text-slate-900">{formatINR(totalBorrowed)}</h3>
        </div>
      </div>

      <div className="glass rounded-[2.5rem] p-8 border border-slate-200/60 overflow-hidden">
        <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-widest">Active Lenders List (Cloud)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-4">Lender</th>
                <th className="py-4 px-4">Borrowed</th>
                <th className="py-4 px-4">Paid</th>
                <th className="py-4 px-4">Remaining</th>
                <th className="py-4 px-4">Progress</th>
                <th className="py-4 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {liabilities.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50 transition-all border-b border-slate-50 group">
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white ${l.status === 'cleared' ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                        <User size={18} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-tight">{l.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{l.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-4 font-black text-sm text-slate-900">{formatINR(l.amount).replace('INR', '')}</td>
                  <td className="py-5 px-4 font-black text-sm text-emerald-600">{formatINR(l.paid).replace('INR', '')}</td>
                  <td className="py-5 px-4 font-black text-base">
                    {formatINR(l.amount - l.paid).replace('INR', '')}
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${l.status === 'cleared' ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                               style={{ width: `${(l.paid / l.amount) * 100}%` }} />
                       </div>
                       <span className="text-[10px] font-black text-slate-400">{Math.round((l.paid / l.amount) * 100)}%</span>
                    </div>
                  </td>
                  <td className="py-5 px-4 text-center">
                    <button onClick={() => deleteLiability(l.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {liabilities.length === 0 && <p className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest">No cloud records found</p>}
        </div>
      </div>

      {/* MODALS (Simplified for brevity) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative w-full max-w-md glass-dark rounded-[2.5rem] p-8 shadow-2xl">
              <h3 className="text-xl font-black text-white mb-6">New Liability</h3>
              <form onSubmit={handleAddLiability} className="space-y-4">
                <input type="text" placeholder="Lender Name" value={newName} onChange={e => setNewName(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-bold" required />
                <input type="number" step="0.01" placeholder="Borrowed Amount" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-black" required />
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-bold" required />
                <textarea placeholder="Remarks" value={newRemarks} onChange={e => setNewRemarks(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none h-24" />
                <button type="submit" className="w-full py-4 gradient-indigo text-white font-black rounded-xl uppercase tracking-widest text-xs">Save to Cloud</button>
              </form>
            </motion.div>
          </div>
        )}

        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPaymentModal(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative w-full max-w-md glass-dark rounded-[2.5rem] p-8 shadow-2xl">
              <h3 className="text-xl font-black text-white mb-6">Record Repayment</h3>
              <form onSubmit={handleAddPayment} className="space-y-4">
                <select required value={selectedLiabilityId} onChange={e => setSelectedLiabilityId(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-bold">
                  <option value="">Select Lender...</option>
                  {liabilities.filter(l => l.status !== 'cleared').map(l => (
                    <option key={l.id} value={l.id}>{l.name} (Bal: {formatINR(l.amount - l.paid)})</option>
                  ))}
                </select>
                <input type="number" step="0.01" placeholder="Amount Paid" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-black" required />
                <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-bold" required />
                <button type="submit" className="w-full py-4 gradient-emerald text-white font-black rounded-xl uppercase tracking-widest text-xs">Record Payment</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageLiability;