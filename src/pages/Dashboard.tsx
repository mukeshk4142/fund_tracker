import React from 'react';
import { 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  MoreVertical,
  Activity,
  Target
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { name: 'Jan', income: 4000, expenses: 2400 },
  { name: 'Feb', income: 3000, expenses: 1398 },
  { name: 'Mar', income: 2000, expenses: 9800 },
  { name: 'Apr', income: 2780, expenses: 3908 },
  { name: 'May', income: 1890, expenses: 4800 },
  { name: 'Jun', income: 2390, expenses: 3800 },
  { name: 'Jul', income: 3490, expenses: 4300 },
];

const categoryData = [
  { name: 'Shopping', value: 400, color: '#6366f1' },
  { name: 'Food', value: 300, color: '#f43f5e' },
  { name: 'Transport', value: 200, color: '#10b981' },
  { name: 'Bills', value: 278, color: '#f59e0b' },
];

const StatCard = ({ title, amount, trend, icon: Icon, colorClass }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass p-6 rounded-3xl relative overflow-hidden group"
  >
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">${amount}</h3>
        <div className={`mt-3 flex items-center gap-1 text-sm font-bold ${trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend.startsWith('+') ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
          <span>{trend}</span>
          <span className="text-slate-400 font-medium ml-1">vs last month</span>
        </div>
      </div>
      <div className={`h-14 w-14 rounded-2xl ${colorClass} flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform`}>
        <Icon size={24} />
      </div>
    </div>
    <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500 ${colorClass}`} />
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = React.useState({
    totalBalance: 0,
    income: 0,
    expenses: 0,
    totalDebt: 0,
    totalReceivable: 0,
    recentActivity: [] as any[]
  });

  React.useEffect(() => {
    // 1. Daily Activities
    const dailyActivities = JSON.parse(localStorage.getItem('daily_activities') || '[]');
    const dailyIncome = dailyActivities
      .filter((a: any) => a.type === 'income')
      .reduce((sum: number, a: any) => sum + Number(a.amount), 0);
    const dailyExpense = dailyActivities
      .filter((a: any) => a.type === 'expense')
      .reduce((sum: number, a: any) => sum + Number(a.amount), 0);

    // 2. Stock Activities
    const stockActivities = JSON.parse(localStorage.getItem('stock_activities') || '[]');
    const stockWithdrawals = stockActivities
      .filter((a: any) => a.type === 'withdrawal')
      .reduce((sum: number, a: any) => sum + Number(a.amount), 0);
    const stockDeposits = stockActivities
      .filter((a: any) => a.type === 'deposit')
      .reduce((sum: number, a: any) => sum + Number(a.amount), 0);

    // 3. Liabilities (Debt)
    const liabilities = JSON.parse(localStorage.getItem('liability_obligations') || '[]');
    const pendingLiabilities = liabilities.reduce((sum: number, l: any) => sum + (Number(l.amount) - Number(l.paid || 0)), 0);

    // 4. Credit Bills (Debt)
    const bills = JSON.parse(localStorage.getItem('credit_bills') || '[]');
    const pendingBills = bills.reduce((sum: number, b: any) => sum + (Number(b.amount) - Number(b.paid || 0)), 0);

    // 5. Lent Records (Receivables)
    const lentRecords = JSON.parse(localStorage.getItem('lent_records') || '[]');
    const pendingReceivables = lentRecords.reduce((sum: number, r: any) => sum + (Number(r.amount) - Number(r.received || 0)), 0);

    // Calculations
    const dailyNet = dailyIncome - dailyExpense;
    const stockNet = stockWithdrawals - stockDeposits;
    const totalBalance = dailyNet + stockNet;
    const totalDebt = pendingLiabilities + pendingBills;

    // Combine recent activities for display
    const combined = [
      ...dailyActivities.map((a: any) => ({ ...a, source: 'Daily' })),
      ...stockActivities.map((a: any) => ({ ...a, source: 'Stock' })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
     .slice(0, 5);

    setStats({
      totalBalance,
      income: dailyIncome + stockWithdrawals,
      expenses: dailyExpense + stockDeposits,
      totalDebt,
      totalReceivable: pendingReceivables,
      recentActivity: combined
    });
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Overview Dashboard</h2>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            <Calendar size={16} />
            Monday, 14 October 2024
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 glass text-slate-700 font-bold rounded-xl hover:bg-white transition-all border border-slate-200 shadow-sm flex items-center gap-2">
            <Activity size={18} />
            Analytics
          </button>
          <button className="px-5 py-2.5 gradient-indigo text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all flex items-center gap-2">
            <Target size={18} />
            Set Goals
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Balance" 
          amount={stats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} 
          trend="+100%" 
          icon={DollarSign} 
          colorClass="gradient-indigo" 
        />
        <StatCard 
          title="Total Debt" 
          amount={stats.totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })} 
          trend="-0%" 
          icon={TrendingDown} 
          colorClass="gradient-rose" 
        />
        <StatCard 
          title="Money to Receive" 
          amount={stats.totalReceivable.toLocaleString('en-US', { minimumFractionDigits: 2 })} 
          trend="+0%" 
          icon={ArrowUpRight} 
          colorClass="gradient-emerald" 
        />
        <StatCard 
          title="Monthly Cashflow" 
          amount={(stats.income - stats.expenses).toLocaleString('en-US', { minimumFractionDigits: 2 })} 
          trend={stats.income >= stats.expenses ? "+Profitable" : "-Deficit"} 
          icon={Activity} 
          colorClass="gradient-amber" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-8 border border-slate-200/60">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Financial Overview</h3>
              <p className="text-sm font-medium text-slate-500">Monthly income and expenses comparison</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  dx={-10}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '15px'
                  }}
                  itemStyle={{ fontWeight: 700 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#f43f5e" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorExpenses)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-[2.5rem] p-8 border border-slate-200/60 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Spend Analytics</h3>
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
              <MoreVertical size={20} />
            </button>
          </div>
          
          <div className="h-[250px] w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4 flex-1">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-slate-50 rounded-2xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900">${cat.value}</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {Math.round((cat.value / 1178) * 100)}% of total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass rounded-[2.5rem] p-8 border border-slate-200/60">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Transactions</h3>
            <button className="text-indigo-600 font-bold text-sm hover:underline">View All</button>
          </div>
          
          <div className="space-y-5">
            {stats.recentActivity.length > 0 ? stats.recentActivity.map((tx: any, i: number) => {
              const isIncome = tx.type === 'income' || tx.type === 'withdrawal';
              const displayAmount = isIncome ? Number(tx.amount) : -Number(tx.amount);
              return (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-2xl ${isIncome ? 'bg-emerald-50' : 'bg-rose-50'} flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform`}>
                      {isIncome ? '💰' : '💸'}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 tracking-tight">{tx.name || tx.category || 'Transaction'}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg tracking-tight ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isIncome ? '+' : ''}{displayAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest ${isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {tx.source} {tx.type}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <p className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-sm italic">No recent activity found</p>
            )}
          </div>
        </div>

        <div className="glass rounded-[2.5rem] p-8 border border-slate-200/60 overflow-hidden relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Liability</h3>
            <button className="text-indigo-600 font-bold text-sm hover:underline">Manage</button>
          </div>
          
          <div className="space-y-6 relative z-10">
            {(() => {
              const liabilities = JSON.parse(localStorage.getItem('liability_obligations') || '[]');
              const active = liabilities.slice(0, 3);
              
              if (active.length === 0) return <p className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-sm italic">No active liabilities</p>;
              
              return active.map((loan: any, i: number) => {
                const percentage = Math.min(100, Math.round((Number(loan.paid || 0) / Number(loan.amount)) * 100));
                return (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-slate-900 tracking-tight truncate max-w-[150px]">{loan.name}</p>
                      <span className="text-xs font-black text-slate-900">{percentage}% Cleared</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                        className={`h-full ${i % 2 === 0 ? 'gradient-indigo' : 'gradient-rose'}`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>${Number(loan.paid || 0).toLocaleString()} Paid</span>
                      <span>${Number(loan.amount).toLocaleString()} Total</span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
          
          <div className="mt-8 p-6 bg-slate-900 rounded-3xl relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-white font-black text-lg tracking-tight mb-2">Need a quick loan?</h4>
              <p className="text-slate-400 text-sm font-medium mb-4">Get up to $50,000 with instant approval and low interest.</p>
              <button className="px-6 py-2.5 bg-white text-slate-900 font-black rounded-xl hover:scale-105 transition-all text-sm">
                Apply Now
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 gradient-indigo rounded-full blur-2xl opacity-40 group-hover:scale-150 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
