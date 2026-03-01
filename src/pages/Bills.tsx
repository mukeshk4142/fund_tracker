import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Calendar, AlertCircle, CheckCircle2, IndianRupee, X,
  CreditCard as CardIcon, Landmark, Wallet, ArrowRight, 
  ChevronDown, Trash2, Clock
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

  // 1. FILTER STATES (Default: Current Month & Year)
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear().toString();
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = ["2023", "2024", "2025", "2026"];

  // Form States
  const [newBill, setNewBill] = useState({ name: '', type: 'Card', totalAmount: '', dueDate: '', remarks: '' });
  const [newPayment, setNewPayment] = useState({ billId: '', amount: '', date: new Date().toISOString().split('T')[0], remark: '' });

  // Helper for Indian Rupee Formatting
  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  // FETCH DATA FROM FIREBASE
  useEffect(() => {
    const q = query(collection(db, 'credit_bills'), orderBy('dueDate', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bill[];
      setBills(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. FILTERED DATA LOGIC (Selected month/year ke hisab se filter)
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const date = new Date(bill.dueDate);
      const billMonth = date.toLocaleString('default', { month: 'long' });
      const billYear = date.getFullYear().toString();
      return billMonth === selectedMonth && billYear === selectedYear;
    });
  }, [bills, selectedMonth, selectedYear]);

  // 3. STATS CALCULATION (Per Month)
  const totalOutstanding = filteredBills.reduce((acc, b) => acc + (Number(b.totalAmount) - Number(b.paidAmount)), 0);
  const totalPaid = filteredBills.reduce((acc, b) => acc + Number(b.paidAmount), 0);

  // 4. DUE DATE HIGHLIGHTING LOGIC
  const getDueStatus = (dueDateStr: string, isCleared: boolean) => {
    if (isCleared) return { label: 'Cleared', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: <CheckCircle2 size={14}/> };
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dueDateStr);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Overdue', color: 'text-rose-600', bg: 'bg-rose-50', icon: <AlertCircle size={14}/> };
    if (diffDays <= 3) return { label: `Due in ${diffDays} days`, color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock size={14}/> };
    return { label: `Due in ${diffDays} days`, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <Calendar size={14}/> };
  };

  // ADD NEW BILL
  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amount = Math.round(parseFloat(newBill.totalAmount) * 100) / 100;
      
      // 1. Save to Bills Collection
      await addDoc(collection(db, 'credit_bills'), {
        name: newBill.name,
        type: newBill.type,
        totalAmount: amount,
        paidAmount: 0,
        dueDate: newBill.dueDate,
        remarks: newBill.remarks,
        createdAt: serverTimestamp()
      });

      // 2. Sync to Global Activity (as a Liability/Borrow type)
      await addDoc(collection(db, 'global_activities'), {
        type: 'borrow',
        category: 'Credit Bill Generated',
        name: newBill.name,
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        source: 'Bills',
        remarks: `Bill generated for ${newBill.name}`
      });

      setShowAddBillModal(false);
      setNewBill({ name: '', type: 'Card', totalAmount: '', dueDate: '', remarks: '' });
    } catch (err) { console.error(err); }
  };

  // RECORD PAYMENT
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Math.round(parseFloat(newPayment.amount) * 100) / 100;
    const bill = bills.find(b => b.id === newPayment.billId);
    
    if (bill) {
      try {
        const billRef = doc(db, 'credit_bills', newPayment.billId);
        await updateDoc(billRef, {
          paidAmount: Math.round((Number(bill.paidAmount) + amount) * 100) / 100
        });

        // Sync to Global Activity (as an Expense/Payment type)
        await addDoc(collection(db, 'global_activities'), {
          type: 'payment',
          category: 'Bill Payment',
          name: bill.name,
          amount: amount,
          date: newPayment.date,
          source: 'Bills',
          remarks: `Payment for ${bill.name}`
        });

        setShowPayBillModal(false);
        setNewPayment({ billId: '', amount: '', date: new Date().toISOString().split('T')[0], remark: '' });
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER WITH FILTERS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Credit Bills</h2>
          <div className="flex items-center gap-2 text-slate-500 font-medium mt-1">
            <Receipt size={16} />
            <span>{loading ? 'Syncing...' : `Showing ${selectedMonth} ${selectedYear}`}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Year Dropdown */}
          <div className="relative group">
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:rotate-180 transition-transform" size={16} />
          </div>

          {/* Month Dropdown */}
          <div className="relative group">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:rotate-180 transition-transform" size={16} />
          </div>

          <button onClick={() => setShowAddBillModal(true)} className="px-5 py-2.5 gradient-indigo text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2">
            <Plus size={18} /> Add Bill
          </button>
        </div>
      </div>

      {/* MONTHLY SUMMARY STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Outstanding', value: formatINR(totalOutstanding), icon: Wallet, color: 'gradient-rose' },
          { label: 'Total Paid', value: formatINR(totalPaid), icon: CheckCircle2, color: 'gradient-emerald' },
          { label: 'Month Scope', value: selectedMonth, icon: Calendar, color: 'gradient-indigo' },
          { label: 'Bills Left', value: `${filteredBills.filter(b => b.totalAmount > b.paidAmount).length} Pending`, icon: AlertCircle, color: 'gradient-amber' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
            <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h4 className="text-xl font-black text-slate-900 mt-1">{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* BILL LISTING */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredBills.length > 0 ? filteredBills.map((bill) => {
            const progress = (bill.paidAmount / bill.totalAmount) * 100;
            const remaining = bill.totalAmount - bill.paidAmount;
            const isCleared = remaining <= 0;
            const status = getDueStatus(bill.dueDate, isCleared);

            return (
              <motion.div key={bill.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} 
                className={`relative overflow-hidden p-8 rounded-[3rem] border-2 transition-all ${isCleared ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-white border-slate-100 hover:shadow-2xl'}`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${isCleared ? 'bg-white/20 text-white' : 'bg-indigo-600 text-white shadow-xl'}`}>
                      {bill.type === 'Card' ? <CardIcon size={28} /> : <Landmark size={28} />}
                    </div>
                    <div>
                      <h3 className={`font-black text-xl tracking-tight leading-none ${isCleared ? 'text-white' : 'text-slate-900'}`}>{bill.name}</h3>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md mt-2 inline-block ${isCleared ? 'bg-white/30' : 'bg-slate-100 text-slate-500'}`}>{bill.type}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase ${status.bg} ${status.color} shadow-sm`}>
                    {status.icon} {status.label}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between">
                    <div>
                      <p className={`text-[10px] font-black uppercase mb-1 ${isCleared ? 'text-white/70' : 'text-slate-400'}`}>Amount Due</p>
                      <p className="text-3xl font-black tracking-tighter">{isCleared ? formatINR(0) : formatINR(remaining)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-[10px] font-black uppercase mb-1 ${isCleared ? 'text-white/70' : 'text-slate-400'}`}>Due Date</p>
                      <p className={`text-sm font-black ${!isCleared && status.color.includes('rose') ? 'text-rose-600 animate-pulse' : ''}`}>
                        {new Date(bill.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className={`h-2.5 w-full rounded-full ${isCleared ? 'bg-white/20' : 'bg-slate-100'}`}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={`h-full rounded-full ${isCleared ? 'bg-white' : 'bg-indigo-600'}`} />
                    </div>
                    <div className="flex justify-between text-[10px] font-black">
                      <span>{Math.round(progress)}% PAID</span>
                      <span>{formatINR(bill.totalAmount)} TOTAL</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!isCleared && (
                      <button onClick={() => { setNewPayment({ ...newPayment, billId: bill.id }); setShowPayBillModal(true); }} 
                        className="flex-1 py-3 bg-slate-900 text-white font-black rounded-2xl shadow-lg hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                      >
                        PAY NOW <ArrowRight size={16} />
                      </button>
                    )}
                    <button onClick={() => deleteDoc(doc(db, 'credit_bills', bill.id))} className={`p-3 rounded-2xl ${isCleared ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-rose-50 text-rose-500 hover:bg-rose-100'}`}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          }) : (
            <div className="col-span-full py-20 text-center glass rounded-[3rem] border border-dashed border-slate-200">
               <Calendar className="mx-auto text-slate-200 mb-4" size={64} />
               <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No bills found for {selectedMonth} {selectedYear}</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showAddBillModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddBillModal(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Add New Bill</h2>
                <form onSubmit={handleAddBill} className="space-y-4">
                  <div className="flex p-1.5 bg-slate-100 rounded-2xl">
                    {['Card', 'Loan'].map((t) => (
                      <button key={t} type="button" onClick={() => setNewBill({ ...newBill, type: t as any })} 
                        className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${newBill.type === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                      >{t}</button>
                    ))}
                  </div>
                  <input required type="text" value={newBill.name} onChange={(e) => setNewBill({ ...newBill, name: e.target.value })} placeholder="Bank Name (e.g. Kotak)" className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-indigo-500" />
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="date" value={newBill.dueDate} onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-none" />
                    <input required type="number" step="0.01" value={newBill.totalAmount} onChange={(e) => setNewBill({ ...newBill, totalAmount: e.target.value })} placeholder="Amount (₹)" className="w-full bg-slate-50 p-4 rounded-2xl font-black border-none" />
                  </div>
                  <textarea value={newBill.remarks} onChange={(e) => setNewBill({ ...newBill, remarks: e.target.value })} placeholder="Add any note..." className="w-full bg-slate-50 p-4 rounded-2xl font-medium h-24 border-none resize-none" />
                  <button type="submit" className="w-full gradient-indigo text-white font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest text-sm">Save to Cloud</button>
                </form>
            </motion.div>
          </div>
        )}

        {showPayBillModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPayBillModal(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-8">
                <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Record Payment</h2>
                <form onSubmit={handleAddPayment} className="space-y-4">
                  <select required value={newPayment.billId} onChange={(e) => setNewPayment({ ...newPayment, billId: e.target.value })} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select Bill...</option>
                    {bills.filter(b => b.totalAmount > b.paidAmount).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="date" value={newPayment.date} onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })} className="w-full bg-slate-50 p-4 rounded-2xl font-bold border-none" />
                    <input required type="number" step="0.01" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} placeholder="Pay Amount (₹)" className="w-full bg-slate-50 p-4 rounded-2xl font-black border-none" />
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest text-sm">Confirm Payment</button>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Bills;