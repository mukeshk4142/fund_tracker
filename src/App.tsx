import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import Bills from './pages/Bills';
import Admin from './pages/Admin';
import DailyTransition from './pages/DailyTransition';
import ManageLiability from './pages/ManageLiability';
import ManageLiabilityHistory from './pages/ManageLiabilityHistory';
import LentTracker from './pages/LentTracker';
import StockIncome from './pages/StockIncome';
import Notes from './pages/Notes';
import Landing from './pages/Landing';
import Login from './pages/Login';
import { Search, Bell, Menu, User, Loader2 } from 'lucide-react';

// FIREBASE AUTH IMPORTS
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden relative">
      <div className="fixed top-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-200/40 rounded-full blur-[100px] -z-10" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-rose-200/40 rounded-full blur-[100px] -z-10" />

      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />
      
      <main className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
        <header className="sticky top-0 z-30 glass border-b border-slate-200/60 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 hidden lg:flex">
              <Menu size={20} />
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 lg:hidden">
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-slate-100/50 rounded-xl w-48 xl:w-80 outline-none text-sm" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">Secure Session</p>
                <p className="text-xs font-medium text-emerald-600">Active</p>
              </div>
              <div className="h-10 w-10 rounded-xl gradient-indigo flex items-center justify-center text-white ring-4 ring-indigo-50 shadow-lg">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-4 sm:p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full h-full">
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
};

// HIGH SECURITY PRIVATE ROUTE
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase ka real-time auth listener (Bypass impossible)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Jab tak verification chal rahi hai, Loading Screen dikhao
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Verifying Access...</p>
      </div>
    );
  }

  // Agar user login nahi hai, toh seedha Login page par redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Agar user hai, toh hi Dashboard dikhao
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        {/* All Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/daily-transition" element={<PrivateRoute><DailyTransition /></PrivateRoute>} />
        <Route path="/transfer" element={<PrivateRoute><Transfer /></PrivateRoute>} />
        <Route path="/bills" element={<PrivateRoute><Bills /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="/manage-liability" element={<PrivateRoute><ManageLiability /></PrivateRoute>} />
        <Route path="/manage-liability/history" element={<PrivateRoute><ManageLiabilityHistory /></PrivateRoute>} />
        <Route path="/lent-tracker" element={<PrivateRoute><LentTracker /></PrivateRoute>} />
        <Route path="/stock-income" element={<PrivateRoute><StockIncome /></PrivateRoute>} />
        <Route path="/notes" element={<PrivateRoute><Notes /></PrivateRoute>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;