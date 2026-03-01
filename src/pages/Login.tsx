import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Github, Chrome, CreditCard, Loader2 } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // SECURITY: Agar user pehle se login hai, toh use login page nahi dikhna chahiye
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard', { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // 1. Email/Password Login (Strict Security)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Firebase real-time verification
      await signInWithEmailAndPassword(auth, email, password);
      
      // Redirect with 'replace' so user can't go back to login using 'back' button
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error(err.code);
      if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password. Access Denied.");
      } else if (err.code === 'auth/user-not-found') {
        setError("No account found with this email.");
      } else {
        setError("Login failed. Please check your internet or credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Google Login (Secure OAuth)
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError("Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-y-auto bg-slate-950">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-600/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-dark border-slate-700/30 p-8 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-2xl gradient-indigo flex items-center justify-center text-white shadow-2xl mb-4 ring-1 ring-white/10">
              <CreditCard size={32} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Access Control</h1>
            <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Secure Financial Environment</p>
          </div>

          {/* Error Message Display */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-black text-center uppercase tracking-wider"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 ml-1">Email Authority</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-white transition-all font-bold"
                  placeholder="admin@fintrack.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 ml-1">Access Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-white transition-all font-bold"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 gradient-indigo text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
              {loading ? 'AUTHENTICATING...' : 'AUTHORIZE SESSION'}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em]">Identity Provider</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <button className="flex items-center justify-center gap-3 py-3 px-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white font-bold text-xs hover:bg-slate-800 transition-all group">
              <Github size={18} />
              <span>GITHUB</span>
            </button>
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 py-3 px-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white font-bold text-xs hover:bg-slate-800 transition-all group"
            >
              <Chrome size={18} />
              <span>GOOGLE</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;