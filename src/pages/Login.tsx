import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, LogIn, ShieldCheck, Loader2, AlertCircle, Eye, EyeOff, Github, Chrome 
} from 'lucide-react';

// FIREBASE IMPORTS
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- STRICT SECURITY: KILL ANY OLD SESSION ON LOAD ---
  useEffect(() => {
    const clearSession = async () => {
      await signOut(auth); // Clear Firebase session
      localStorage.clear(); // Clear local cache
    };
    clearSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError("Access Denied: Authentication Failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError("External Authority Failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#020617] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl relative">
          <div className="flex flex-col items-center mb-10">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-500 shadow-2xl mb-6">
              <ShieldCheck size={36} />
            </div>
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">System Access</h1>
            <p className="text-slate-500 mt-2 font-bold text-[9px] uppercase tracking-[0.4em]">Secure Login Required</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-black text-center uppercase">
                <AlertCircle size={14} className="inline mr-2" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Identity</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                  className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" placeholder="Email" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} 
                  className="w-full pl-12 pr-12 py-4 bg-black/40 border border-white/5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-xs">
              {loading ? 'Verifying...' : 'Establish Session'}
            </button>
          </form>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <button onClick={handleGoogleLogin} type="button" className="flex items-center justify-center gap-3 py-3 px-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-[10px] uppercase hover:bg-white/10 transition-all">
              <Chrome size={18} /> Google
            </button>
            <button type="button" className="flex items-center justify-center gap-3 py-3 px-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-[10px] uppercase hover:bg-white/10 transition-all">
              <Github size={18} /> Github
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;