import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  X,
  CreditCard as CardIcon,
  Landmark,
  ShieldCheck,
  MoreVertical,
  Receipt,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Bill {
  id: string;
  name: string;
  type: 'Card' | 'Loan';
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  remarks?: string;
}

interface BillPayment {
  id: string;
  billId: string;
  billName: string;
  amount: number;
  date: string;
  remark: string;
}

const Bills = () => {
  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('credit_bills_v2');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Chase Sapphire Preferred', type: 'Card', totalAmount: 5000, paidAmount: 2500, dueDate: '2024-04-15', remarks: 'Monthly statement' },
      { id: '2', name: 'HDFC Home Loan', type: 'Loan', totalAmount: 45000, paidAmount: 15000, dueDate: '2024-04-05', remarks: 'Home EMI' },
      { id: '3', name: 'Apple Card', type: 'Card', totalAmount: 1200, paidAmount: 1200, dueDate: '2024-03-25', remarks: 'Electronics purchase' },
    ];
  });

  const [payments, setPayments] = useState<BillPayment[]>(() => {
    const saved = localStorage.getItem('bill_payments_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [showPayBillModal, setShowPayBillModal] = useState(false);
  
  const [newBill, setNewBill] = useState({ name: '', type: 'Card', totalAmount: '', dueDate: '', remarks: '' });
  const [newPayment, setNewPayment] = useState({ billId: '', amount: '', date: new Date().toISOString().split('T')[0], remark: '' });

  useEffect(() => {
    localStorage.setItem('credit_bills_v2', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('bill_payments_v2', JSON.stringify(payments));
  }, [payments]);

  const logGlobalTransition = (data: any) => {
    const saved = localStorage.getItem('global_transitions');
    const transitions = saved ? JSON.parse(saved) : [];
    transitions.push({
      id: Date.now().toString(),
      ...data
    });
    localStorage.setItem('global_transitions', JSON.stringify(transitions));
  };

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBill.name || !newBill.totalAmount || !newBill.dueDate) return;

    const bill: Bill = {
      id: Date.now().toString(),
      name: newBill.name,
      type: newBill.type as 'Card' | 'Loan',
      totalAmount: parseFloat(newBill.totalAmount),
      paidAmount: 0,
      dueDate: newBill.dueDate,
      remarks: newBill.remarks
    };

    setBills([bill, ...bills]);

    logGlobalTransition({
      type: 'borrow',
      category: `Credit Bill Added`,
      name: bill.name,
      amount: -bill.totalAmount, // outgoing/liability
      date: new Date().toISOString().split('T')[0],
      remarks: bill.remarks
    });

    setShowAddBillModal(false);
    setNewBill({ name: '', type: 'Card', totalAmount: '', dueDate: '', remarks: '' });
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.billId || !newPayment.amount || !newPayment.date) return;

    const amount = parseFloat(newPayment.amount);
    const bill = bills.find(b => b.id === newPayment.billId);
    if (!bill) return;

    setBills(bills.map(b => 
      b.id === newPayment.billId 
        ? { ...b, paidAmount: Math.min(b.paidAmount + amount, b.totalAmount) }
        : b
    ));

    const payment: BillPayment = {
      id: Date.now().toString(),
      billId: newPayment.billId,
      billName: bill.name,
      amount: amount,
      date: newPayment.date,
      remark: newPayment.remark
    };

    setPayments([payment, ...payments]);

    logGlobalTransition({
      type: 'payment',
      category: `Credit Bill Repayment`,
      name: bill.name,
      amount: -amount,
      date: newPayment.date,
      remarks: newPayment.remark
    });

    setShowPayBillModal(false);
    setNewPayment({ billId: '', amount: '', date: new Date().toISOString().split('T')[0], remark: '' });
  };

  const totalOutstanding = bills.reduce((acc, b) => acc + (b.totalAmount - b.paidAmount), 0);
  const totalPaid = bills.reduce((acc, b) => acc + b.paidAmount, 0);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Credit Bills</h2>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            <Receipt size={16} />
            Manage your cards and loan statements monthly
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddBillModal(true)} className="px-5 py-2.5 gradient-indigo text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2">
            <Plus size={18} /> Add Bill
          </button>
          <button onClick={() => setShowPayBillModal(true)} className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2">
            <Wallet size={18} /> Pay Bill
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Outstanding', value: `$${totalOutstanding.toLocaleString()}`, icon: DollarSign, color: 'gradient-rose' },
          { label: 'Next Due', value: bills.filter(b => b.totalAmount > b.paidAmount).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate || 'None', icon: Calendar, color: 'gradient-indigo' },
          { label: 'Paid (Month)', value: `$${totalPaid.toLocaleString()}`, icon: ShieldCheck, color: 'gradient-emerald' },
          { label: 'Pending Bills', value: `${bills.filter(b => b.totalAmount > b.paidAmount).length} Remaining`, icon: AlertCircle, color: 'gradient-blue' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-[2rem] border border-slate-200/60 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6`}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h4 className="text-xl font-black text-slate-900 tracking-tight mt-1">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {bills.map((bill, i) => {
            const progress = (bill.paidAmount / bill.totalAmount) * 100;
            const remaining = bill.totalAmount - bill.paidAmount;
            const isCleared = remaining <= 0;

            return (
              <motion.div key={bill.id} layout initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className={`relative overflow-hidden p-8 rounded-[3rem] shadow-2xl border-2 transition-all group ${isCleared ? 'bg-gradient-to-br from-emerald-600 to-teal-600 border-emerald-400' : 'bg-white border-slate-100 hover:shadow-2xl hover:border-indigo-200 hover:-translate-y-2'}`}>
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className={`h-16 w-16 rounded-2xl shadow-xl flex items-center justify-center transition-all ${isCleared ? 'bg-white/20 text-white' : 'bg-indigo-600 text-white'}`}>
                      {bill.type === 'Card' ? <CardIcon size={32} /> : <Landmark size={32} />}
                    </div>
                    <div>
                      <h3 className={`font-black text-2xl tracking-tight leading-none mb-1.5 ${isCleared ? 'text-white' : 'text-indigo-950'}`}>{bill.name}</h3>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isCleared ? 'bg-white/30 text-white' : 'bg-indigo-50 text-indigo-600'}`}>{bill.type}</span>
                    </div>
                  </div>
                  {isCleared && <CheckCircle2 size={32} className="text-white drop-shadow-lg" />}
                </div>

                <div className="space-y-8 relative z-10">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCleared ? 'text-white/80' : 'text-slate-500'}`}>Amount Due</p>
                      <p className={`text-4xl font-black ${isCleared ? 'text-white' : 'text-slate-900'}`}>${(isCleared ? 0 : remaining).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isCleared ? 'text-white/80' : 'text-slate-500'}`}>Total</p>
                      <p className={`text-lg font-black ${isCleared ? 'text-white' : 'text-slate-600'}`}>${bill.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className={`h-3 w-full rounded-full p-0.5 ${isCleared ? 'bg-white/20' : 'bg-slate-100'}`}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={`h-full rounded-full ${isCleared ? 'bg-white' : 'bg-indigo-600'}`} />
                    </div>
                  </div>

                  {!isCleared && (
                    <button onClick={() => { setNewPayment({ ...newPayment, billId: bill.id }); setShowPayBillModal(true); }} className="w-full py-4 bg-indigo-600 text-white font-black rounded-[2rem] shadow-xl flex items-center justify-center gap-3">
                      MAKE A PAYMENT <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAddBillModal && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen p-4 py-10">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddBillModal(false)} className="fixed inset-0" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden">
                <div className="gradient-indigo p-8 text-white flex justify-between items-center">
                  <h2 className="text-2xl font-black">Add New Bill</h2>
                  <button onClick={() => setShowAddBillModal(false)}><X size={24} /></button>
                </div>
                <form onSubmit={handleAddBill} className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {['Card', 'Loan'].map((t) => (
                      <button key={t} type="button" onClick={() => setNewBill({ ...newBill, type: t as 'Card' | 'Loan' })} className={`py-3 rounded-2xl font-black ${newBill.type === t ? 'gradient-indigo text-white' : 'bg-slate-100 text-slate-400'}`}>{t}</button>
                    ))}
                  </div>
                  <input required type="text" value={newBill.name} onChange={(e) => setNewBill({ ...newBill, name: e.target.value })} placeholder="Card Name" className="w-full bg-slate-50 p-4 rounded-2xl font-bold" />
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="date" value={newBill.dueDate} onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })} className="w-full bg-slate-50 p-4 rounded-2xl font-bold" />
                    <input required type="number" value={newBill.totalAmount} onChange={(e) => setNewBill({ ...newBill, totalAmount: e.target.value })} placeholder="Amount" className="w-full bg-slate-50 p-4 rounded-2xl font-bold" />
                  </div>
                  <button type="submit" className="w-full gradient-indigo text-white font-black py-4 rounded-[2rem] shadow-xl">Create Bill</button>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPayBillModal && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen p-4 py-10">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPayBillModal(false)} className="fixed inset-0" />
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-emerald-600 p-8 text-white flex justify-between items-center">
                  <h2 className="text-2xl font-black">Pay Bill</h2>
                  <button onClick={() => setShowPayBillModal(false)}><X size={24} /></button>
                </div>
                <form onSubmit={handleAddPayment} className="p-8 space-y-6">
                  <select required value={newPayment.billId} onChange={(e) => setNewPayment({ ...newPayment, billId: e.target.value })} className="w-full bg-slate-50 p-4 rounded-2xl font-bold">
                    <option value="">Select Bill</option>
                    {bills.filter(b => b.totalAmount > b.paidAmount).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="date" value={newPayment.date} onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })} className="w-full bg-slate-50 p-4 rounded-2xl font-bold" />
                    <input required type="number" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} placeholder="Amount" className="w-full bg-slate-50 p-4 rounded-2xl font-bold" />
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-[2rem] shadow-xl">Confirm Payment</button>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Bills;
