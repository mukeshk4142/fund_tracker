import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  StickyNote, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  X,
  ChevronRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonalNote {
  id: string;
  name: string;
  amount: number;
  type: 'Debt' | 'Receive';
  remark: string;
  date: string;
}

const Notes = () => {
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PersonalNote | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Debt' | 'Receive'>('All');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'Debt' as 'Debt' | 'Receive',
    remark: ''
  });

  useEffect(() => {
    const savedNotes = localStorage.getItem('personalNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const saveNotes = (updatedNotes: PersonalNote[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('personalNotes', JSON.parse(JSON.stringify(updatedNotes)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount) || 0;
    
    if (editingNote) {
      const updatedNotes = notes.map(n => 
        n.id === editingNote.id 
          ? { ...n, ...formData, amount, date: new Date().toISOString().split('T')[0] } 
          : n
      );
      saveNotes(updatedNotes);
    } else {
      const newNote: PersonalNote = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        amount,
        type: formData.type,
        remark: formData.remark,
        date: new Date().toISOString().split('T')[0]
      };
      saveNotes([newNote, ...notes]);
    }
    
    closeModal();
  };

  const openModal = (note?: PersonalNote) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        name: note.name,
        amount: note.amount.toString(),
        type: note.type,
        remark: note.remark
      });
    } else {
      setEditingNote(null);
      setFormData({
        name: '',
        amount: '',
        type: 'Debt',
        remark: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  const deleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      saveNotes(notes.filter(n => n.id !== id));
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          note.remark.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || note.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalDebt = notes
    .filter(n => n.type === 'Debt')
    .reduce((sum, n) => sum + n.amount, 0);

  const totalReceive = notes
    .filter(n => n.type === 'Receive')
    .reduce((sum, n) => sum + n.amount, 0);

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
              <StickyNote size={28} />
            </div>
            Personal Financial Notes
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Track informal debts and receivables with ease.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-200 hover:-translate-y-0.5"
        >
          <Plus size={20} />
          ADD NEW NOTE
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass p-6 rounded-3xl border border-white/40 shadow-xl shadow-rose-500/5 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full -z-10 group-hover:bg-rose-500/20 transition-all" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-rose-500/10 text-rose-600 rounded-2xl">
              <ArrowUpCircle size={24} />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Note Debt</p>
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">
            ${totalDebt.toLocaleString()}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full w-fit">
            Money you owe to others
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="glass p-6 rounded-3xl border border-white/40 shadow-xl shadow-emerald-500/5 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -z-10 group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl">
              <ArrowDownCircle size={24} />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total To Receive</p>
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">
            ${totalReceive.toLocaleString()}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full w-fit">
            Money others owe to you
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="glass p-6 rounded-3xl border border-white/40 shadow-xl shadow-indigo-500/5 flex flex-col justify-center bg-gradient-to-br from-indigo-600/5 to-purple-600/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Net Position</p>
              <p className={`text-3xl font-black tracking-tighter ${totalReceive - totalDebt >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                ${(totalReceive - totalDebt).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-sm text-indigo-600">
              <Filter size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="glass rounded-[2rem] border border-white/40 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or remark..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl outline-none transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl">
            {(['All', 'Debt', 'Receive'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  filterType === type 
                    ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-100' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Person / Entity</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Type</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Remark</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => (
                  <motion.tr 
                    layout
                    key={note.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6 text-sm font-semibold text-slate-400 whitespace-nowrap">{note.date}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          note.type === 'Receive' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                        }`}>
                          {note.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-black text-slate-900">{note.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black tracking-tight ${
                        note.type === 'Receive' 
                          ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20' 
                          : 'bg-rose-50 text-rose-600 ring-1 ring-rose-500/20'
                      }`}>
                        {note.type === 'Receive' ? 'TO RECEIVE' : 'TO PAY'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-lg font-black tracking-tight ${
                        note.type === 'Receive' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {note.type === 'Receive' ? '+' : '-'}${note.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-slate-500 max-w-[200px] truncate italic" title={note.remark}>
                        {note.remark || 'No remarks added'}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(note)}
                          className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => deleteNote(note.id)}
                          className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                        <StickyNote size={48} />
                      </div>
                      <p className="text-slate-400 font-bold tracking-tight">No personal notes found.</p>
                      <button 
                        onClick={() => openModal()}
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        Add your first note
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Fully Responsive and Scrollable */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 overflow-y-auto pt-16 md:pt-24">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col mx-4"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {editingNote ? 'Edit Note' : 'Add New Note'}
                  </h2>
                  <p className="text-slate-500 font-medium text-xs mt-0.5">Quick financial record.</p>
                </div>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[75vh]">
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
                    {(['Debt', 'Receive'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs transition-all ${
                          formData.type === type 
                            ? (type === 'Debt' ? 'bg-rose-600 text-white shadow-lg' : 'bg-emerald-600 text-white shadow-lg')
                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                        }`}
                      >
                        {type === 'Debt' ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                        {type === 'Debt' ? 'TO PAY' : 'TO RECEIVE'}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">NAME / ENTITY</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Who is this note about?" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-xl outline-none transition-all font-bold text-slate-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">AMOUNT ($)</label>
                      <input 
                        required
                        type="number" 
                        placeholder="0.00" 
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-xl outline-none transition-all font-black text-xl text-indigo-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">REMARKS</label>
                      <textarea 
                        rows={2}
                        placeholder="Short details..." 
                        value={formData.remark}
                        onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-xl outline-none transition-all font-medium text-slate-900 resize-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className={`w-full py-4 rounded-xl font-black text-base transition-all shadow-xl hover:-translate-y-1 active:scale-[0.98] ${
                      formData.type === 'Debt' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    } text-white uppercase tracking-wider`}
                  >
                    {editingNote ? 'Update Note' : 'Save Note'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notes;
