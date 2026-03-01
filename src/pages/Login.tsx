import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Github, Chrome, CreditCard } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-y-auto bg-slate-950">
      {/* Animated background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-600/30 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-dark border-slate-700/30 p-8 rounded-3xl overflow-hidden">
          <div className="flex flex-col items-center mb-8">
            <div className="h-14 w-14 rounded-2xl gradient-indigo flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 mb-4 ring-1 ring-white/20">
              <CreditCard size={28} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-slate-400 mt-2 font-medium">Log in to manage your finances</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-white placeholder-slate-500 transition-all font-medium"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-white placeholder-slate-500 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none font-medium">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500/20 focus:ring-offset-slate-900" />
                Remember me
              </label>
              <a href="#" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Forgot password?</a>
            </div>

            <button
              type="submit"
              className="w-full py-4 gradient-indigo text-white font-bold rounded-2xl shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
            >
              <LogIn size={20} />
              Sign In
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Or continue with</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <button className="flex items-center justify-center gap-3 py-3 px-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white font-semibold hover:bg-slate-800 hover:border-indigo-500/50 transition-all group">
              <Github size={20} className="group-hover:scale-110 transition-transform" />
              <span>Github</span>
            </button>
            <button className="flex items-center justify-center gap-3 py-3 px-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white font-semibold hover:bg-slate-800 hover:border-indigo-500/50 transition-all group">
              <Chrome size={20} className="group-hover:scale-110 transition-transform" />
              <span>Google</span>
            </button>
          </div>

          <p className="text-center mt-8 text-slate-400 text-sm font-medium">
            Don't have an account? <a href="#" className="text-indigo-400 hover:text-indigo-300 font-bold">Sign up now</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
