import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
  Activity,
  Scale,
  Receipt,
  Smartphone,
  CheckCircle2,
  HandCoins
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface UnifiedTransaction {
  id: string;
  type: string;
  category: string;
  name: string;
  amount: number;
  date: string;
  remarks: string;
  origin: 'Daily' | 'Liability' | 'Credit Bill' | 'Fund Transfer' | 'Lent Tracker' | 'Stock Income';
}

const Transfer = () => {
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrigin, setFilterOrigin] = useState('All');

  useEffect(() => {
    // Collect data from all sources
    const aggregateData = () => {
      let combined: UnifiedTransaction[] = [];

      // 1. Daily Transitions
      const daily = JSON.parse(localStorage.getItem('fintrack_daily_transitions') || '[]');
      combined = [...combined, ...daily.map((t: any) => ({
        id: t.id || Math.random().toString(),
        type: t.type,
        category: 'Daily Activity',
        name: t.category,
        amount: t.amount,
        date: t.date,
        remarks: t.description || '',
        origin: 'Daily'
      }))];

      // 2. Liabilities
      const liabilityLog = JSON.parse(localStorage.getItem('fintrack_liabilities_log') || '[]');
      const liabilities = JSON.parse(localStorage.getItem('fintrack_liabilities') || '[]');
      
      // Add initial borrowings
      combined = [...combined, ...liabilities.map((l: any) => ({
        id: `lib-init-${l.id}`,
        type: 'Borrowing',
        category: 'Liability',
        name: l.name,
        amount: l.amount,
        date: l.date,
        remarks: l.remarks || 'Initial borrowing',
        origin: 'Liability'
      }))];

      // Add payments
      combined = [...combined, ...liabilityLog.map((log: any) => ({
        id: log.id,
        type: 'Payment',
        category: 'Liability Repayment',
        name: log.liabilityName,
        amount: log.amount,
        date: log.date,
        remarks: log.remarks || '',
        origin: 'Liability'
      }))];

      // 3. Credit Bills
      const billLog = JSON.parse(localStorage.getItem('fintrack_bills_log') || '[]');
      const bills = JSON.parse(localStorage.getItem('fintrack_bills') || '[]');

      // Add bill additions
      combined = [...combined, ...bills.map((b: any) => ({
        id: `bill-init-${b.id}`,
        type: 'Statement',
        category: 'Credit Bill',
        name: b.name,
        amount: b.amount,
        date: b.dueDate, // or creation date if available
        remarks: `Monthly ${b.type} Bill`,
        origin: 'Credit Bill'
      }))];

      // Add bill payments
      combined = [...combined, ...billLog.map((log: any) => ({
        id: log.id,
        type: 'Payment',
        category: 'Bill Payment',
        name: log.billName,
        amount: log.amount,
        date: log.date,
        remarks: log.remarks || '',
        origin: 'Credit Bill'
      }))];

      // 4. Fund Transfers & Lent Tracker Activities (shared storage for simple transfers)
      const transfers = JSON.parse(localStorage.getItem('global_transitions') || '[]');
      combined = [...combined, ...transfers.map((t: any) => ({
        ...t,
        origin: t.source === 'Lent Tracker' ? 'Lent Tracker' : 'Fund Transfer'
      }))];

      // 5. Stock Income
      const stock = JSON.parse(localStorage.getItem('stock_transactions') || '[]');
      combined = [...combined, ...stock.map((s: any) => ({
        id: `stock-${s.id}`,
        type: s.type === 'withdraw' ? 'Withdrawal' : 'Deposit',
        category: 'Stock Activity',
        name: `Stock ${s.type === 'withdraw' ? 'Withdrawal' : 'Deposit'}`,
        amount: s.amount,
        date: s.date,
        remarks: s.remark || '',
        origin: 'Stock Income'
      }))];

      return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    setTransactions(aggregateData());
  }, []);

  const isIncome = (type: string, origin: string, category: string) => {
    const lowerType = type.toLowerCase();
    const lowerCategory = category.toLowerCase();
    const lowerOrigin = origin.toLowerCase();

    if (lowerOrigin === 'daily' && lowerType === 'income') return true;
    if (lowerOrigin === 'liability' && lowerType === 'borrowing') return true;
    if (lowerOrigin === 'lent tracker' && lowerCategory === 'payment received') return true;
    if (lowerOrigin === 'stock income' && lowerType === 'withdrawal') return true;
    if (lowerType === 'repayment received' || lowerType === 'income') return true;
    
    return false;
  };

  const filtered = transactions.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterOrigin === 'All' || t.origin === filterOrigin;
    return matchesSearch && matchesFilter;
  });

  const downloadExcel = () => {
    const dataToExport = filtered.map(t => ({
      Date: t.date,
      Name: t.name,
      Category: t.category,
      Type: t.type,
      Amount: t.amount,
      Origin: t.origin,
      Remarks: t.remarks
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transitions");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `FinTrack_History_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getIcon = (type: string, origin: string) => {
    if (origin === 'Daily') {
      return type === 'Income' ? <ArrowDownLeft className="text-emerald-500" /> : <ArrowUpRight className="text-rose-500" />;
    }
    if (origin === 'Liability') {
      return type === 'Borrowing' ? <Scale className="text-amber-500" /> : <CheckCircle2 className="text-emerald-500" />;
    }
    if (origin === 'Credit Bill') {
      return type === 'Statement' ? <Receipt className="text-indigo-500" /> : <CheckCircle2 className="text-emerald-500" />;
    }
    if (origin === 'Lent Tracker') {
      return type === 'expense' ? <ArrowUpRight className="text-amber-600" /> : <HandCoins className="text-emerald-600" />;
    }
    if (origin === 'Stock Income') {
      return type === 'Withdrawal' ? <ArrowDownLeft className="text-emerald-500" /> : <ArrowUpRight className="text-rose-500" />;
    }
    return <Smartphone className="text-blue-500" />;
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">GLOBAL ACTIVITY</h1>
          <p className="text-slate-500 font-bold flex items-center gap-2 mt-1 uppercase tracking-widest text-xs">
            <Activity size={16} />
            Unified Transaction History Hub
          </p>
        </div>
        <button
          onClick={downloadExcel}
          className="px-8 py-4 gradient-indigo text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Download size={20} />
          DOWNLOAD REPORT (EXCEL)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name, category, or remarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold shadow-sm"
          />
        </div>
        <div className="md:col-span-2 flex gap-4">
          <div className="flex-1 relative">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select
              value={filterOrigin}
              onChange={(e) => setFilterOrigin(e.target.value)}
              className="w-full pl-14 pr-10 py-5 bg-white border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-black uppercase tracking-widest text-xs appearance-none cursor-pointer shadow-sm"
            >
              <option value="All">All Sources</option>
              <option value="Daily">Daily Activities</option>
              <option value="Liability">Liabilities</option>
              <option value="Credit Bill">Credit Bills</option>
              <option value="Lent Tracker">Money Lent</option>
              <option value="Stock Income">Stock Income</option>
              <option value="Fund Transfer">Direct Transfers</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass rounded-[3rem] overflow-hidden shadow-2xl border border-white/40">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900/5">
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Activity Details</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Source / Category</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((t) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={t.id}
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-5">
                        <div className={`h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                          {getIcon(t.type, t.origin)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 tracking-tight leading-none mb-1.5">{t.name}</p>
                          <p className="text-xs font-bold text-slate-400 italic truncate max-w-[250px]">{t.remarks}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="space-y-1">
                        <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                          {t.origin}
                        </span>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter mt-1">{t.category}</p>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-2 text-slate-600 font-black text-sm">
                        <Calendar size={14} className="text-indigo-400" />
                        {new Date(t.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <p className={`text-2xl font-black tracking-tighter ${
                        isIncome(t.type, t.origin, t.category) ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isIncome(t.type, t.origin, t.category) ? '+' : '-'}
                        {t.origin === 'Lent Tracker' ? '₹' : '$'}{Math.round(Math.abs(t.amount)).toLocaleString()}
                      </p>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-40">
                      <div className="h-24 w-24 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-400">
                        <Activity size={48} />
                      </div>
                      <p className="font-black text-slate-500 uppercase tracking-widest text-sm">No Activity Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transfer;