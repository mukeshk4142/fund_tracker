import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, CreditCard, ShieldCheck, PieChart, Zap, 
  ChevronRight, TrendingUp, Globe, Users
} from 'lucide-react';

// FIREBASE AUTH IMPORT
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Landing = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setIsLoggedIn(true);
      else setIsLoggedIn(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px] animate-float" />
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-rose-200/30 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-100/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-indigo flex items-center justify-center text-white shadow-lg">
              <CreditCard size={20} />
            </div>
            {/* Aap chahein to yahan apne project ka naam likh sakte hain */}
            <span className="font-bold text-xl tracking-tight gradient-text">FundManage</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
          </div>

          <Link 
            to={isLoggedIn ? "/dashboard" : "/login"} 
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all"
          >
            {isLoggedIn ? "Go to Dashboard" : "Sign In"}
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        <section className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-8">
                <Zap size={14} className="fill-indigo-600" />
                <span>Modern Finance Experience</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8">
                Manage your <span className="gradient-text">bills & debt</span> with confidence.
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 leading-relaxed mb-10 max-w-xl">
                Track your daily transitions, manage market stock income, and pay off your liabilities faster. Cloud-synced and secure.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link 
                  to={isLoggedIn ? "/dashboard" : "/login"} 
                  className="w-full sm:w-auto px-10 py-5 gradient-indigo text-white font-bold rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                >
                  {isLoggedIn ? "Enter Dashboard" : "Get Started Free"}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative">
              <div className="relative z-10 rounded-[2.5rem] bg-slate-900 shadow-2xl overflow-hidden border-[8px] border-slate-800">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bbbda536ad41?auto=format&fit=crop&q=80&w=2070" 
                  alt="Dashboard Preview" 
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              
              {/* Floating badges with Rupee Fix */}
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-1/4 -left-12 z-20 glass p-5 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/50"
              >
                <div className="h-12 w-12 rounded-xl gradient-emerald flex items-center justify-center text-white">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Net Profit</p>
                  <p className="text-xl font-extrabold text-slate-900">₹24,500</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white py-10 text-center border-t border-slate-800">
         <p className="text-slate-500 text-sm font-medium">© 2024 FundManage Cloud Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;