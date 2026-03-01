import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, CreditCard, ShieldCheck, PieChart, Zap, 
  ChevronRight, TrendingUp, Globe, Users, Loader2
} from 'lucide-react';

// FIREBASE AUTH IMPORT
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Landing = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // Flicker rokne ke liye
  const navigate = useNavigate();

  // HIGH SECURITY: Direct Firebase Server Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        localStorage.clear(); // Kisi bhi purane flag ko saaf karein
      }
      setAuthLoading(false); // Check complete
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-rose-100/30 rounded-full blur-[100px]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-100/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-indigo flex items-center justify-center text-white shadow-lg">
              <CreditCard size={20} />
            </div>
            <span className="font-black text-xl tracking-tight gradient-text uppercase">FundManage</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors uppercase tracking-widest">Features</a>
          </div>

          {/* Nav Button with Loading Protection */}
          {!authLoading && (
            <Link 
              to={isLoggedIn ? "/dashboard" : "/login"} 
              className="px-6 py-2.5 bg-indigo-600 text-white font-black rounded-xl shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all text-xs uppercase tracking-widest"
            >
              {isLoggedIn ? "Go to Dashboard" : "Sign In"}
            </Link>
          )}
        </div>
      </nav>

      <main className="pt-32 pb-20">
        <section className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mb-8">
                <Zap size={14} className="fill-indigo-600" />
                <span>Enterprise Grade Security</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
                Control your <span className="gradient-text">wealth</span> with precision.
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-xl font-medium">
                The most secure financial cloud dashboard. Manage debt, track market income, and monitor daily expenses with real-time synchronization.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {authLoading ? (
                  <div className="px-10 py-5 bg-slate-100 rounded-2xl flex items-center gap-3 text-slate-400 font-bold uppercase text-xs tracking-widest">
                    <Loader2 className="animate-spin" size={18} /> Verifying Session
                  </div>
                ) : (
                  <Link 
                    to={isLoggedIn ? "/dashboard" : "/login"} 
                    className="w-full sm:w-auto px-10 py-5 gradient-indigo text-white font-black rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group uppercase tracking-widest text-xs"
                  >
                    {isLoggedIn ? "Access Dashboard" : "Get Started Now"}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative">
              <div className="relative z-10 rounded-[3rem] bg-slate-900 shadow-2xl overflow-hidden border-[10px] border-slate-800">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bbbda536ad41?auto=format&fit=crop&q=80&w=2070" 
                  alt="Secure Dashboard" 
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              </div>
              
              {/* Floating badges with Rupee Fix */}
              <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/4 -left-8 z-20 glass p-5 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/50"
              >
                <div className="h-12 w-12 rounded-xl gradient-emerald flex items-center justify-center text-white">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verified Assets</p>
                  <p className="text-xl font-black text-slate-900">₹45,20,000</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 text-white py-12 text-center">
         <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-10">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
              FundManage Cloud Infrastructure • Secure SSL Encrypted
            </p>
         </div>
      </footer>
    </div>
  );
};

export default Landing;