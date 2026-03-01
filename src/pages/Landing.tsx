import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, CreditCard, Star, Lock, 
  ArrowUpRight, BarChart3, Fingerprint, Globe
} from 'lucide-react';

const Landing = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] animate-float" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <CreditCard size={22} className="text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              FundManage
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {['Features', 'Security', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-400 transition-colors">
                {item}
              </a>
            ))}
          </div>

          {/* STRICT LINK TO LOGIN */}
          <Link 
            to="/login" 
            className="px-8 py-2.5 bg-white text-black font-black rounded-full hover:bg-indigo-500 hover:text-white transition-all text-xs uppercase tracking-widest"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="initial" animate="animate">
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-8 backdrop-blur-md">
              <Star size={12} className="fill-indigo-400" />
              <span>Next-Gen Wealth Intelligence</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-6xl lg:text-8xl font-black leading-[0.9] mb-8 tracking-tighter">
              Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-400 to-rose-400">Money</span> <br />
              Like a <span className="italic">Pro.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg font-medium">
              Experience the ultimate financial hub. Track debt, monitor assets, and analyze market income with our secure cloud-native architecture.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-5">
              <Link 
                to="/login" 
                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
              >
                Get Started Now
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Image Preview */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="relative">
            <div className="relative z-10 rounded-[3rem] bg-slate-900 border border-white/10 shadow-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1611974717483-5853096e5746?auto=format&fit=crop&q=80&w=2070" 
                alt="Dashboard" 
                className="w-full h-full object-cover opacity-60 grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </header>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-slate-950/80 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <CreditCard size={24} className="text-indigo-500" />
            <span className="font-black text-xl uppercase tracking-tighter italic">FundManage</span>
          </div>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">
            Cloud Infrastructure • Encrypted Database • Global Node Access
          </p>
      </footer>
    </div>
  );
};

export default Landing;