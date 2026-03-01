import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  HandCoins, 
  Calendar, 
  User, 
  ArrowDownLeft, 
  CheckCircle2, 
  X,
  CreditCard,
  Edit2,
  Trash2,
  IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LentEntry {
  id: string;
  name: string;
  amount: number;
  receivedAmount: number;
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

  useEffect(() => {
    const saved = localStorage.getItem('lent_list');
    if (saved) setLentList(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('lent_list', JSON.stringify(lentList));
  }, [lentList]);

  const handleAddLent = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Math.round(parseFloat(formData.amount));
    
    if (isEditing && selectedLentId) {
      setLentList(lentList.map(item => {
        if (item.id === selectedLentId) {
          const newStatus = item.receivedAmount >= amountNum ? 'cleared' : 'active';
          return { 
            ...item, 
            name: formData.name, 
            amount: amountNum, 
            date: formData.date, 
            remarks: formData.remarks,
            status: newStatus
          };
        }
        return item;
      }));

      // Update global activity for the edit
      const globalTransactions = JSON.parse(localStorage.getItem('global_transactions') || '[]');
      const updatedGlobal = globalTransactions.map((t: any) => {
        if (t.name === formData.name && t.category === 'Money Lent' && t.source === 'Lent Tracker') {
          return { ...t, amount: amountNum, remarks: formData.remarks };
        }
        return t;
      });
      localStorage.setItem('global_transactions', JSON.stringify(updatedGlobal));

    } else {
      const newEntry: LentEntry = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        amount: amountNum,
        receivedAmount: 0,
        date: formData.date,
        remarks: formData.remarks,
        status: 'active'
      };

      setLentList([newEntry, ...lentList]);
      
      const globalTransactions = JSON.parse(localStorage.getItem('global_transactions') || '[]');
      const newGlobal = {
        id: 'GT-' + Date.now(),
        name: formData.name,
        amount: amountNum,
        date: formData.date,
        category: 'Money Lent',
        type: 'expense',
        remarks: formData.remarks,
        source: 'Lent Tracker'
      };
      localStorage.setItem('global_transactions', JSON.stringify([newGlobal, ...globalTransactions]));
    }

    setShowAddModal(false);
    setIsEditing(false);
    setSelectedLentId(null);
    setFormData({ name: '', date: new Date().toISOString().split('T')[0], amount: '', remarks: '' });
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

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record? All associated history in Global Activity will remain, but the active lending will be removed.')) {
      const itemToDelete = lentList.find(i => i.id === id);
      setLentList(lentList.filter(item => item.id !== id));
      
      if (itemToDelete) {
        const globalTransactions = JSON.parse(localStorage.getItem('global_transactions') || '[]');
        const updatedGlobal = globalTransactions.filter((t: any) => 
          !(t.name === itemToDelete.name && t.category === 'Money Lent' && t.source === 'Lent Tracker')
        );
        localStorage.setItem('global_transactions', JSON.stringify(updatedGlobal));
      }
    }
  };

  const handleReceivePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLentId) return;

    const amountRec = Math.round(parseFloat(receiveData.amount));
    const updatedList = lentList.map(item => {
      if (item.id === selectedLentId) {
        const newReceived = Math.round(item.receivedAmount + amountRec);
        const newStatus = newReceived >= item.amount ? 'cleared' : 'active';
        return {
          ...item,
          receivedAmount: newReceived,
          status: newStatus as 'active' | 'cleared'
        };
      }
      return item;
    });

    setLentList(updatedList);

    const person = lentList.find(i => i.id === selectedLentId);
    const globalTransactions = JSON.parse(localStorage.getItem('global_transactions') || '[]');
    const newGlobal = {
      id: 'GT-' + Date.now(),
      name: person?.name || 'Unknown',
      amount: amountRec,
      date: receiveData.date,
      category: 'Payment Received',
      type: 'income',
      remarks: receiveData.remarks,
      source: 'Lent Tracker'
    };
    localStorage.setItem('global_transactions', JSON.stringify([newGlobal, ...globalTransactions]));

    setShowReceiveModal(false);
    setSelectedLentId(null);
    setReceiveData({ date: new Date().toISOString().split('T')[0], amount: '', remarks: '' });
  };

  const filteredList = lentList.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOutstanding = lentList.reduce((acc, curr) => acc + (Math.round(curr.amount) - Math.round(curr.receivedAmount)), 0);
  const totalReceived = lentList.reduce((acc, curr) => acc + Math.round(curr.receivedAmount), 0);
  const totalPrincipal = lentList.reduce((acc, curr) => acc + Math.round(curr.amount), 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Money Lent Tracker</h1>
          <p className="text-slate-500 font-medium">Manage people who owe you money</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => {
              setIsEditing(false);
              setFormData({ name: '', date: new Date().toISOString().split('T')[0], amount: '', remarks: '' });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus size={20} />
            LEND MONEY
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <CreditCard size={24} />
            </div>
            <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Total Lent (Principal)</span>
          </div>
          <div className="text-3xl font-black text-indigo-600">{formatRupee(totalPrincipal)}</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <HandCoins size={24} />
            </div>
            <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Total Outstanding</span>
          </div>
          <div className="text-3xl font-black text-rose-600">{formatRupee(totalOutstanding)}</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <ArrowDownLeft size={24} />
            </div>
            <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">Total Received</span>
          </div>
          <div className="text-3xl font-black text-emerald-600">{formatRupee(totalReceived)}</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-900">Receivables List</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl w-full md:w-64 focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Person</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Amount Lent</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Received</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Balance</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">
                        {item.name[0]}
                      </div>
                      <div>
                        <div className="font-black text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-400 font-medium">{item.date}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-700">{formatRupee(item.amount)}</td>
                  <td className="px-6 py-4 font-black text-emerald-600">{formatRupee(item.receivedAmount)}</td>
                  <td className="px-6 py-4 font-black text-rose-500">{formatRupee(item.amount - item.receivedAmount)}</td>
                  <td className="px-6 py-4">
                    {item.status === 'cleared' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">
                        <CheckCircle2 size={14} /> CLEARED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-black">
                        ACTIVE
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.status !== 'cleared' && (
                        <button 
                          onClick={() => {
                            setSelectedLentId(item.id);
                            setShowReceiveModal(true);
                          }}
                          className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-black hover:bg-emerald-700 transition-all"
                        >
                          RECEIVE
                        </button>
                      )}
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen p-4 py-10">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="fixed inset-0" />
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                  <h2 className="text-2xl font-black text-slate-900">{isEditing ? 'Edit Entry' : 'Record Lending'}</h2>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleAddLent} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Person Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Amount</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input required type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Date</label>
                      <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Remarks</label>
                    <textarea value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} placeholder="Reason..." rows={3} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold resize-none" />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 shadow-xl transition-all">SAVE RECORD</button>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReceiveModal && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
            <div className="flex items-center justify-center min-h-screen p-4 py-10">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReceiveModal(false)} className="fixed inset-0" />
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Receive Payment</h2>
                  <button onClick={() => setShowReceiveModal(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleReceivePayment} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Amount Received</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input required type="number" value={receiveData.amount} onChange={(e) => setReceiveData({...receiveData, amount: e.target.value})} placeholder="0.00" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-black text-emerald-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Date Received</label>
                    <input required type="date" value={receiveData.date} onChange={(e) => setReceiveData({...receiveData, date: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Remarks</label>
                    <textarea value={receiveData.remarks} onChange={(e) => setReceiveData({...receiveData, remarks: e.target.value})} placeholder="Notes..." rows={3} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold resize-none" />
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-emerald-700 shadow-xl transition-all">RECORD RECEIPT</button>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LentTracker;
