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
import { Search, Menu, User, Loader2 } from 'lucide-react';

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
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />
      
      <main className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 hidden lg:flex">
              <Menu size={20} />
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 lg:hidden">
              <Menu size={20} />
            </button>
            <h1 className="font-black text-slate-900 uppercase tracking-tighter italic hidden sm:block">Internal Node</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Authorized Session</p>
            </div>
            <div className="h-10 w-10 rounded-xl gradient-indigo flex items-center justify-center text-white shadow-lg">
              <User size={20} />
            </div>
          </div>
        </header>
        
        <div className="p-4 sm:p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
};

// --- STRICT PRIVATE ROUTE ---
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase se direct status pucho
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617]">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Establishing Secure Connection...</p>
      </div>
    );
  }

  // No Login -> Go to Login Page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        {/* PROTECTED ROUTES */}
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