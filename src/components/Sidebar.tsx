import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Send, Receipt, ShieldCheck, LogOut, X,
  CreditCard, CalendarPlus, Scale, HandCoins, TrendingUp, StickyNote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// FIREBASE AUTH IMPORT
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, isMobileOpen, setIsMobileOpen }: SidebarProps) => {
  const navigate = useNavigate();

  // Updated Logout Function
  const handleLogout = async () => {
    try {
      if (window.confirm("Are you sure you want to logout?")) {
        await signOut(auth); // Firebase se logout karein
        localStorage.removeItem('isLoggedIn'); // Purana data clean karein
        navigate('/login');
      }
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', color: 'text-indigo-600', activeIcon: 'text-indigo-600' },
    { icon: CalendarPlus, label: 'Daily Transition', path: '/daily-transition', color: 'text-rose-500', activeIcon: 'text-rose-600' },
    { icon: TrendingUp, label: 'Stock Income', path: '/stock-income', color: 'text-cyan-500', activeIcon: 'text-cyan-600' },
    { icon: Send, label: 'Global Activity', path: '/transfer', color: 'text-emerald-500', activeIcon: 'text-emerald-600' },
    { icon: Receipt, label: 'Credit Bills', path: '/bills', color: 'text-amber-500', activeIcon: 'text-amber-600' },
    { icon: Scale, label: 'Manage Liability', path: '/manage-liability', color: 'text-blue-500', activeIcon: 'text-blue-600' },
    { icon: HandCoins, label: 'Money Lent', path: '/lent-tracker', color: 'text-amber-600', activeIcon: 'text-orange-600' },
    { icon: StickyNote, label: 'Personal Note', path: '/notes', color: 'text-purple-500', activeIcon: 'text-purple-600' },
    { icon: ShieldCheck, label: 'Admin', path: '/admin', color: 'text-violet-500', activeIcon: 'text-violet-600' },
  ];

  return (
    <>
      <aside 
        className={`fixed top-0 left-0 h-screen bg-white/80 backdrop-blur-xl border-r border-slate-200 z-50 transition-all duration-300 hidden lg:flex flex-col
          ${isOpen ? 'w-64' : 'w-20'}
        `}
      >
        <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-50">
          <div className="h-10 w-10 min-w-[40px] rounded-xl gradient-indigo flex items-center justify-center text-white shadow-lg">
            <CreditCard size={20} />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="font-black text-xl gradient-text tracking-tight uppercase"
              >
                FundManage
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 py-6 px-3.5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all group relative overflow-hidden
                ${isActive ? 'bg-indigo-50/50 text-indigo-600 shadow-sm shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50/80 hover:text-indigo-600'}
              `}
              title={!isOpen ? item.label : ''}
            >
              <item.icon size={22} className={`transition-all group-hover:scale-110 relative z-10`} />
              {isOpen && (
                <motion.span 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="font-bold text-sm whitespace-nowrap relative z-10"
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-3 py-3 w-full rounded-xl text-rose-500 hover:bg-rose-50 transition-all group"
            title={!isOpen ? 'Logout' : ''}
          >
            <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
            {isOpen && <span className="font-semibold text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside 
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            className="fixed top-0 left-0 h-screen w-72 bg-white z-[60] flex flex-col lg:hidden shadow-2xl"
          >
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl gradient-indigo flex items-center justify-center text-white">
                  <CreditCard size={20} />
                </div>
                <span className="font-bold text-xl gradient-text">FundManage</span>
              </div>
              <button onClick={() => setIsMobileOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={20} /></button>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <item.icon size={22} />
                  <span className="font-semibold">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-6 border-t border-slate-50">
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-4 py-3.5 w-full rounded-xl text-rose-500 hover:bg-rose-50 transition-all font-semibold"
              >
                <LogOut size={22} />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;