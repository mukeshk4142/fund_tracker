import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, HandCoins, Calendar, User, ArrowDownLeft, 
  CheckCircle2, X, CreditCard, Edit2, Trash2, IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// FIREBASE IMPORTS
import { db } from '../lib/firebase';
import { 
  collection, addDoc, deleteDoc, doc, onSnapshot, 
  query, orderBy, serverTimestamp, updateDoc 
} from 'firebase/firestore';

interface LentEntry {
  id: string;
  name: string;
  amount: number;
  received: number; 
  date: string;
  remarks: string;
  status: 'active' | 'cleared';
}

const LentTracker = () => {
  const [lentList, setLentList] = useState<LentEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLentId, setSelectedLentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    remarks: ''
  });

  const [receiveData, setReceiveData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    remarks: ''
  });

  const formatRupee = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // FETCH FROM FIREBASE
  useEffect(() => {
    const q = query(collection(db, 'lent_records'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LentEntry[];
      setLentList(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddLent = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Math.round(parseFloat(formData.amount) * 100) / 100;
    
    try {
      if (isEditing && selectedLentId) {
        // 1. UPDATE EXISTING RECORD
        const entryRef = doc(db, 'lent_records', selectedLentId);
        await updateDoc(entryRef, {
          name: formData.name,
          amount: amountNum,
          date: formData.date,
          remarks: formData.remarks
        });
      } else {
        // 2. ADD NEW RECORD
        await addDoc(collection(db, 'lent_records'), {
          name: formData.name,
          amount: amountNum,
          received: 0,
          date: formData.date,
          remarks: formData.remarks,
          status: 'active',
          createdAt: serverTimestamp()
        });

        // 3. LOG TO GLOBAL ACTIVITY (as money going out/lent)
        await addDoc(collection(db, 'global_activities'), {
          type: 'expense',
          category: 'Money Lent',
          name: formData.name,
          amount: amountNum,
          date: formData.date,
          source: 'Lent',
          remarks: `Lent to ${formData.name}: ${formData.remarks}`,
          createdAt: serverTimestamp()
        });
      }

      setShowAddModal(false);
      setIsEditing(false);
      setSelectedLentId(null);
      setFormData({ name: '', date: new Date().toISOString().split('T')[0], amount: '', remarks: '' });
    } catch (error) {
      console.error("Error saving record: ", error);
    }
  };

  const handleReceivePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLentId) return;

    const amountRec = Math.round(parseFloat(receiveData.amount) * 100) / 100;
    const person = lentList.find(i => i.id === selectedLentId);

    if (person) {
      try {
        const newReceived = Math.round((Number(person.received) + amountRec) * 100) / 100;
        const entryRef = doc(db, 'lent_records', selectedLentId);

        await updateDoc(entryRef, {
          received: newReceived,
          status: newReceived >= person.amount ? 'cleared' : 'active'
        });

        // LOG TO GLOBAL ACTIVITY (as money coming in/income)
        await addDoc(collection(db, 'global_activities'), {
          type: 'income',
          category: 'Payment Received',
          name: person.name,
          amount: amountRec,
          date: receiveData.date,
          source: 'Lent',
          remarks: `Received from ${person.name}: ${receiveData.remarks}`,
          createdAt: serverTimestamp()
        });

        setShowReceiveModal(false);
        setSelectedLentId(null);
        setReceiveData({ date: new Date().toISOString().split('T')[0], amount: '', remarks: '' });
      } catch (error) {
        console.error("Error updating receipt: ", error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this record?')) {
      try {
        await deleteDoc(doc(db, 'lent_records', id));
      } catch (error) {
        console.error("Error deleting: ", error);
      }
    }
  };

  const handleEdit = (item: LentEntry) => {
    setFormData({
      name: item.name,
      amount: item.amount.toString(),
      date: item.date,
      remarks: item.remarks
    });
    setSelectedLentId(item.id);
    setIsEditing(true);
    setShowAddModal(true);
  };

  const filteredList = lentList.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOutstanding = lentList.reduce((acc, curr) => acc + (Number(curr.amount) - Number(curr.received)), 0);
  const totalReceived = lentList.reduce((acc, curr) => acc + Number(curr.received), 0);
  const totalPrincipal = lentList.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Lent Tracker</h1>
          <p className="text-slate-500 font-medium">{loading ? 'Syncing...' : 'Manage people who owe you money'}</p>
        </div>
        <button 
          onClick={() => {
            setIsEditing(false);
            setFormData({ name: '', date: new Date().toISOString().split('T')[0], amount: '', remarks: '' });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus size={20} /> LEND MONEY
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-bold uppercase text-xs mb-2">Total Principal</p>
          <div className="text-2xl font-black text-indigo-600">{formatRupee(totalPrincipal)}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-bold uppercase text-xs mb-2 text-rose-500">Total Outstanding</p>
          <div className="text-2xl font-black text-rose-600">{formatRupee(totalOutstanding)}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-bold uppercase text-xs mb-2 text-emerald-500">Total Received</p>
          <div className="text-2xl font-black text-emerald-600">{formatRupee(totalReceived)}</div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Receivables List (Cloud)</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl w-full md:w-64 outline-none font-medium focus:ring-2 focus:ring-indigo-500 transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b">
                <th className="px-6 py-4">Person</th>
                <th className="px-6 py-4">Lent</th>
                <th className="px-6 py-4">Received</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">{item.name[0]}</div>
                      <div>
                        <div className="font-black text-slate-900 text-sm">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{item.date}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-700 text-sm">{formatRupee(item.amount).replace('INR','')}</td>
                  <td className="px-6 py-4 font-black text-emerald-600 text-sm">{formatRupee(item.received).replace('INR','')}</td>
                  <td className="px-6 py-4 font-black text-rose-500 text-sm">{formatRupee(item.amount - item.received).replace('INR','')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black ${item.status === 'cleared' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {item.status !== 'cleared' && (
                        <button onClick={() => { setSelectedLentId(item.id); setShowReceiveModal(true); }} className="bg-emerald-600 text-white px-2 py-1 rounded-lg text-[10px] font-black hover:scale-105 transition-transform">RECEIVE</button>
                      )}
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-300 hover:text-indigo-600 transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-300 hover:text-rose-600 transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredList.length === 0 && <p className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">No lending records found</p>}
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8">
              <h2 className="text-xl font-black text-slate-900 mb-6">{isEditing ? 'Edit Lending' : 'Record Lending'}</h2>
              <form onSubmit={handleAddLent} className="space-y-4">
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Person Name" className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none font-bold" />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input required type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="Amount" className="w-full p-3 pl-8 bg-slate-50 border-none rounded-2xl outline-none font-black text-indigo-600" />
                </div>
                <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none font-bold" />
                <textarea value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} placeholder="Note..." className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none font-bold h-24 resize-none" />
                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all">Save to Cloud</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Receive Modal */}
        {showReceiveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReceiveModal(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8">
              <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Record Receipt</h2>
              <form onSubmit={handleReceivePayment} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input required type="number" step="0.01" value={receiveData.amount} onChange={(e) => setReceiveData({...receiveData, amount: e.target.value})} placeholder="Amount Received" className="w-full p-3 pl-8 bg-slate-50 border-none rounded-2xl outline-none font-black text-emerald-600" />
                </div>
                <input required type="date" value={receiveData.date} onChange={(e) => setReceiveData({...receiveData, date: e.target.value})} className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none font-bold" />
                <textarea value={receiveData.remarks} onChange={(e) => setReceiveData({...receiveData, remarks: e.target.value})} placeholder="Notes..." className="w-full p-3 bg-slate-50 border-none rounded-2xl outline-none font-bold h-24 resize-none" />
                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all">Confirm Receipt</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LentTracker;