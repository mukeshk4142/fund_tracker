import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Calendar, AlertCircle, CheckCircle2, IndianRupee, X,
  CreditCard as CardIcon, Landmark, Wallet, ArrowRight, 
  ChevronDown, Trash2, Clock, Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// FIREBASE IMPORTS
import { db } from '../lib/firebase';
import { 
  collection, addDoc, deleteDoc, doc, onSnapshot, 
  query, orderBy, serverTimestamp, updateDoc 
} from 'firebase/firestore';

interface Bill {
  id: string;
  name: string;
  type: 'Card' | 'Loan';
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  remarks?: string;
}

const Bills = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [showPayBillModal, setShowPayBillModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = ["2023", "2024", "2025", "2026"];

  const [newBill, setNewBill] = useState({ name: '', type: 'Card', totalAmount: '', dueDate: '', remarks: '' });
  const [newPayment, setNewPayment] = useState({ billId: '', amount: '', date: new Date().toISOString().split('T')[0] });

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amt || 0);
  };

  useEffect(() => {
    try {
      const q = query(collection(db, 'credit_bills'), orderBy('dueDate', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Bill[];
        setBills(data);
        setLoading(false);
      }, (error) => {
        console.error("Firebase Error:", error);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Setup Error:", err);
    }
  }, []);

  // Filter Logic with Safety Checks
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      if (!bill.dueDate) return false;
      const d = new Date(bill.dueDate);
      if (isNaN(d.getTime())) return false; // Skip invalid dates
      return d.toLocaleString('default', { month: 'long' }) === selectedMonth && 
             d.getFullYear().toString() === selectedYear;
    });
  }, [bills, selectedMonth, selectedYear]);

  const totalOutstanding = filteredBills.reduce((acc, b) => acc + (Number(b.totalAmount || 0) - Number(b.paidAmount || 0)), 0);
  const totalPaid = filteredBills.reduce((acc, b) => acc + Number(b.paidAmount || 0), 0);

  const getDueStatus = (dueDateStr: string, isCleared: boolean) => {
    if (isCleared) return { label: 'Cleared', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: <CheckCircle2 size={14}/> };
    const today = new Date(); today.setHours(0,0,0,0);
    const due = new Date(dueDateStr);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return { label: 'Overdue', color: 'text-rose-600', bg: 'bg-rose-50', icon: <AlertCircle size={14}/> };
    if (diff <= 3) return { label: `Due in ${diff} days`, color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock size={14}/> };
    return { label: `Due in ${diff} days`, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <Calendar size={14}/> };
  };

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newBill.totalAmount);
    if (isNaN(amount)) return;
    await addDoc(collection(db, 'credit_bills'), {
      name: newBill.name, type: newBill.type, totalAmount: amount,
      paidAmount: 0, dueDate: newBill.dueDate, remarks: newBill.remarks,
      createdAt: serverTimestamp()
    });
    setShowAddBillModal(false);
    setNewBill({ name: '', type: 'Card', totalAmount: '', dueDate: '', remarks: '' });
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newPayment.amount);
    const bill = bills.find(b => b.id === newPayment.billId);
    if (bill && !isNaN(amount)) {
      await updateDoc(doc(db, 'credit_bills', bill.id), {
        paidAmount: (Number(bill.paidAmount || 0) + amount)
      });
      await addDoc(collection(db, 'global_activities'), {
        type: 'payment', category: 'Bill Payment', name: bill.name,
        amount: amount, date: newPayment.date, source: 'Bills', createdAt: serverTimestamp()
      });
      setShowPayBillModal(false);
      setNewPayment({ billId: '', amount: '', date: new Date().toISOString().split('T')[0] });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-slate-400">Loading Cloud Data...</div>;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Credit Bills</h2>
          <p className="text-slate-500 font-medium">Monthly obligation tracker</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="p-2.5 bg-white border border-slate-200 rounded-xl font-bold outline-none">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="p-2.5 bg-white border border-slate-200 rounded-xl font-bold outline-none">
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button onClick={() => setShowAddBillModal(true)} className="px-5 py-2.5 gradient-indigo text-white font-bold rounded-xl flex items-center gap-2 shadow-lg">
            <Plus size={18} /> Add Bill
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Outstanding', value: formatINR(totalOutstanding), icon: Wallet, color: 'gradient-rose' },
          { label: 'Paid', value: formatINR(totalPaid), icon: CheckCircle2, color: 'gradient-emerald' },
          { label: 'Month', value: selectedMonth, icon: Calendar, color: 'gradient-indigo' },
          { label: 'Bills Left', value: filteredBills.filter(b => b.totalAmount > b.paidAmount).length, icon: AlertCircle, color: 'gradient-amber' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
            <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center text-white mb-4 shadow-md`}>
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h4 className="text-xl font-black text-slate-900 mt-1">{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredBills.map((bill) => {
            const isCleared = (bill.paidAmount || 0) >= (bill.totalAmount || 0);
            const status = getDueStatus(bill.dueDate, isCleared);
            const progress = ((bill.paidAmount || 0) / (bill.totalAmount || 1)) * 100;

            return (
              <motion.div key={bill.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`p-8 rounded-[3rem] border-2 transition-all ${isCleared ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-white border-slate-100'}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                       {bill.type === 'Card' ? <CardIcon size={24} /> : <Landmark size={24} />}
                    </div>
                    <div>
                      <h3 className="font-black text-lg">{bill.name}</h3>
                      <span className="text-[9px] uppercase font-black">{bill.type}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${status.bg} ${status.color}`}>
                    {status.label}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase opacity-60">Due</p>
                      <p className="text-2xl font-black">{formatINR((bill.totalAmount || 0) - (bill.paidAmount || 0))}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase opacity-60">Date</p>
                      <p className="text-sm font-black">{bill.dueDate}</p>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
                  </div>

                  <div className="flex gap-2">
                    {!isCleared && (
                      <button onClick={() => { setNewPayment({ ...newPayment, billId: bill.id }); setShowPayBillModal(true); }} className="flex-1 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs">PAY NOW</button>
                    )}
                    <button onClick={() => deleteDoc(doc(db, 'credit_bills', bill.id))} className="p-3 bg-rose-50 text-rose-500 rounded-2xl"><Trash2 size={18} /></button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filteredBills.length === 0 && !loading && <div className="col-span-full py-20 text-center text-slate-400 font-bold">No bills found for this month.</div>}
      </div>

      {/* Add Bill Modal */}
      {showAddBillModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md">
            <h3 className="text-xl font-black mb-6">New Credit Bill</h3>
            <form onSubmit={handleAddBill} className="space-y-4">
              <input required placeholder="Bank Name" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" onChange={e => setNewBill({...newBill, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="date" className="p-4 bg-slate-50 rounded-2xl font-bold outline-none" onChange={e => setNewBill({...newBill, dueDate: e.target.value})} />
                <input required type="number" placeholder="Amount" className="p-4 bg-slate-50 rounded-2xl font-bold outline-none" onChange={e => setNewBill({...newBill, totalAmount: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-4 gradient-indigo text-white font-black rounded-2xl">CREATE BILL</button>
              <button type="button" onClick={() => setShowAddBillModal(false)} className="w-full text-slate-400 font-bold text-sm">Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* Pay Bill Modal */}
      {showPayBillModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md">
            <h3 className="text-xl font-black mb-6">Record Payment</h3>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <input required type="number" placeholder="Amount (₹)" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" onChange={e => setNewPayment({...newPayment, amount: e.target.value})} />
              <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl">CONFIRM PAYMENT</button>
              <button type="button" onClick={() => setShowPayBillModal(false)} className="w-full text-slate-400 font-bold text-sm">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bills;