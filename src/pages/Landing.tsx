import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, CreditCard, ShieldCheck, PieChart, Zap, 
  ChevronRight, TrendingUp, Globe, Users, Star, 
  Lock, ArrowUpRight, BarChart3, Fingerprint
} from 'lucide-react';

const Landing = () => {
  // Animation Variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans">
      {/* --- DYNAMIC BACKGROUND BLOBS --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      {/* --- NAVIGATION --- */}
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

          <Link 
            to="/login" 
            className="px-8 py-2.5 bg-white text-black font-black rounded-full hover:bg-indigo-500 hover:text-white transition-all text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="initial" animate="animate" variants={stagger}>
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
                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-2xl shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
              >
                Get Started Now
                <ArrowRight size={18} />
              </Link>
              <button className="w-full sm:w-auto px-10 py-5 bg-white/5 text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs backdrop-blur-md">
                View System Docs
              </button>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-16 flex items-center gap-6 border-t border-white/5 pt-10">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">U{i}</div>
                ))}
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Trusted by 10k+ Analysts</p>
            </motion.div>
          </motion.div>

          {/* --- HERO IMAGE PREVIEW --- */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[3rem] bg-slate-900 border-[1px] border-white/10 shadow-[0_0_80px_rgba(79,70,229,0.2)] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1611974717483-5853096e5746?auto=format&fit=crop&q=80&w=2070" 
                alt="Dashboard" 
                className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
            </div>

            {/* FLOATING BADGES */}
            <motion.div 
              animate={{ y: [0, -20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -right-6 z-20 bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/20 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Value</p>
                  <p className="text-2xl font-black text-white">₹85.4L</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-10 -left-10 z-20 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                  <Fingerprint size={24} />
                </div>
                <p className="text-xs font-black uppercase tracking-widest leading-tight">Biometric <br /> Encrypted</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-32 relative">
        <div className="text-center mb-20">
          <h2 className="text-indigo-500 font-black text-xs uppercase tracking-[0.4em] mb-4">The Ecosystem</h2>
          <h3 className="text-4xl lg:text-5xl font-black tracking-tighter">Engineered for financial <br /> freedom.</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: BarChart3, title: 'Real-time Analytics', desc: 'Watch your assets grow with real-time synchronized cloud data.', color: 'from-blue-600 to-cyan-500' },
            { icon: Lock, title: 'AES-256 Security', desc: 'Your financial logs are protected with military-grade encryption.', color: 'from-indigo-600 to-purple-600' },
            { icon: Globe, title: 'Global Sync', desc: 'Access your wealth dashboard from any corner of the globe.', color: 'from-rose-600 to-orange-500' },
          ].map((f, i) => (
            <motion.div 
              key={i} whileHover={{ y: -10 }}
              className="group p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all relative overflow-hidden"
            >
              <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-8 shadow-lg group-hover:rotate-6 transition-transform`}>
                <f.icon size={30} className="text-white" />
              </div>
              <h4 className="text-xl font-black mb-4 tracking-tight">{f.title}</h4>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.desc}</p>
              <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="rounded-[3rem] bg-gradient-to-r from-indigo-900 to-purple-900 p-12 lg:p-20 text-center relative overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
           <div className="relative z-10">
              <h3 className="text-4xl lg:text-6xl font-black tracking-tighter mb-8 text-white">Ready to secure your <br /> financial future?</h3>
              <Link to="/login" className="inline-flex items-center gap-3 px-12 py-5 bg-white text-black font-black rounded-2xl uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all shadow-2xl">
                Authorize Session <ArrowUpRight size={18} />
              </Link>
           </div>
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -ml-32 -mb-32" />
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 border-t border-white/5 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-10">
            <CreditCard size={24} className="text-indigo-500" />
            <span className="font-black text-xl uppercase tracking-tighter italic">FundManage</span>
          </div>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] mb-6">
            Cloud Infrastructure • Encrypted Database • Global Node Access
          </p>
          <div className="h-px w-20 bg-indigo-500/20 mx-auto" />
          <p className="mt-8 text-slate-500 text-xs font-medium italic">© 2024 FundManage Ecosystem. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;