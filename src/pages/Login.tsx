import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Github, Chrome, CreditCard, Loader2 } from 'lucide-react';

// FIREBASE IMPORTS
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 1. Email/Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Firebase login successful
      localStorage.setItem('isLoggedIn', 'true'); // Backward compatibility
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || "Failed to login. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Google Login
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/dashboard');
    } catch (err: any) {
      setError("Google Login Failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-y-auto bg-slate-950">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-600/30 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-dark border-slate-700/30 p-8 rounded-3xl overflow-hidden">
          <div className="flex flex-col items-center mb-8">
            <div className="h-14 w-14 rounded-2xl gradient-indigo flex items-center justify-center text-white shadow-2xl mb-4">
              <CreditCard size={28} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-slate-400 mt-2 font-medium">Log in to manage your finances</p>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-2xl focus:border-indigo-500 outline-none text-white transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-2xl focus:border-indigo-500 outline-none text-white transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 gradient-indigo text-white font-bold rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Or continue with</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <button className="flex items-center justify-center gap-3 py-3 px-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white font-semibold hover:bg-slate-800 transition-all group">
              <Github size={20} />
              <span>Github</span>
            </button>
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 py-3 px-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white font-semibold hover:bg-slate-800 transition-all group"
            >
              <Chrome size={20} />
              <span>Google</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;