import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Fixed: Added AnimatePresence
import { 
  Mail, Lock, LogIn, Github, Chrome, 
  ShieldCheck, Loader2, AlertCircle, Eye, EyeOff 
} from 'lucide-react';

// FIREBASE IMPORTS
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // SECURITY: Check if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard', { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // 1. Email/Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error(err.code);
      if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password. Access Denied.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Connection failed. Check your internet.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Google Login
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError("Google Login failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-[#020617] overflow-hidden">
      {/* --- PREMIUM BACKGROUND ANIMATIONS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.7 }}
              className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(79,70,229,0.3)] mb-6"
            >
              <ShieldCheck size={32} />
            </motion.div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Access System</h1>
            <p className="text-slate-500 mt-2 font-bold text-[10px] uppercase tracking-[0.3em]">Encrypted Financial Node</p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-black text-center uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Identity Log</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/5 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none text-white transition-all font-bold placeholder:text-slate-700"
                  placeholder="admin@fundmanage.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-black/40 border border-white/5 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none text-white transition-all font-bold placeholder:text-slate-700"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
              {loading ? 'Verifying...' : 'Authorize Session'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-10 flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-white/5"></div>
            <span className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em]">Third-Party Auth</span>
            <div className="flex-1 h-[1px] bg-white/5"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button 
              type="button"
              className="flex items-center justify-center gap-3 py-3.5 px-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all group"
            >
              <Github size={18} className="group-hover:rotate-12 transition-transform" />
              <span>Github</span>
            </button>
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 py-3.5 px-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all group"
            >
              <Chrome size={18} className="group-hover:rotate-12 transition-transform" />
              <span>Google</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center mt-8 text-slate-600 text-[9px] font-black uppercase tracking-[0.4em]">
          End-to-End Encrypted Session
        </p>
      </motion.div>
    </div>
  );
};

export default Login;