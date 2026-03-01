import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CreditCard, 
  ShieldCheck, 
  PieChart, 
  Zap, 
  ChevronRight,
  TrendingUp,
  Globe,
  Users
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px] animate-float" />
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-rose-200/30 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-10%] left-[5%] w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-[130px] animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-100/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-indigo flex items-center justify-center text-white shadow-lg">
              <CreditCard size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight gradient-text">FinTrack</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#about" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">About Us</a>
            <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
          </div>

          <Link 
            to="/login" 
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-105 transition-all"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        <section className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-8">
                <Zap size={14} className="fill-indigo-600" />
                <span>Modern Finance Experience</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8">
                Manage your <span className="gradient-text">bills & debt</span> with confidence.
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 leading-relaxed mb-10 max-w-xl">
                The most intuitive financial dashboard for tracking your transitions, managing credit bills, and paying off liabilities faster. Join 50,000+ users worldwide.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto px-10 py-5 gradient-indigo text-white font-bold rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                >
                  Get Started Free
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="w-full sm:w-auto px-10 py-5 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                  Watch Demo
                </button>
              </div>

              <div className="mt-16 flex items-center gap-8 border-t border-slate-100 pt-10">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 w-12 rounded-full border-4 border-white overflow-hidden bg-slate-100 ring-1 ring-slate-100">
                      <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="User" />
                    </div>
                  ))}
                  <div className="h-12 w-12 rounded-full border-4 border-white bg-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-1 ring-slate-100">
                    +5k
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-slate-900">4.9/5 Average Rating</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="relative"
            >
              <div className="relative z-10 rounded-[2.5rem] bg-slate-900 shadow-[0_50px_100px_-20px_rgba(79,70,229,0.3)] overflow-hidden border-[8px] border-slate-800">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bbbda536ad41?auto=format&fit=crop&q=80&w=2070" 
                  alt="Dashboard Preview" 
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 via-transparent to-rose-600/20" />
              </div>
              
              {/* Floating badges */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/4 -left-12 z-20 glass p-5 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/50"
              >
                <div className="h-12 w-12 rounded-xl gradient-emerald flex items-center justify-center text-white">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Savings Growth</p>
                  <p className="text-xl font-extrabold text-slate-900">+24.5%</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-1/4 -right-12 z-20 glass p-5 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/50"
              >
                <div className="h-12 w-12 rounded-xl gradient-rose flex items-center justify-center text-white">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Secure Payments</p>
                  <p className="text-xl font-extrabold text-slate-900">100% Protected</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="max-w-7xl mx-auto px-6 mt-32">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-indigo-600 font-bold text-sm uppercase tracking-[0.2em] mb-4">Core Capabilities</h2>
            <h3 className="text-4xl font-extrabold text-slate-900 mb-6">Everything you need to master your money.</h3>
            <p className="text-lg text-slate-600">Powerful tools designed to simplify your financial life, from daily tracking to complex liability management.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: PieChart, title: 'Smart Analytics', desc: 'Beautifully visualized charts that show exactly where your money is going.', color: 'gradient-indigo' },
              { icon: Users, title: 'Multi-Accounts', desc: 'Manage credit cards, bank accounts, and loans in one unified dashboard.', color: 'gradient-blue' },
              { icon: ShieldCheck, title: 'Bank-Grade Security', desc: 'Your data is encrypted with the highest standards in the industry.', color: 'gradient-emerald' },
              { icon: TrendingUp, title: 'Growth Tracking', desc: 'Set financial goals and watch your progress with real-time updates.', color: 'gradient-rose' },
              { icon: Zap, title: 'Instant Transitions', desc: 'Record daily expenses and income in seconds with our mobile-first UI.', color: 'gradient-amber' },
              { icon: Globe, title: 'Global Access', desc: 'Access your financial records from any device, anywhere in the world.', color: 'gradient-blue' },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group"
              >
                <div className={`h-16 w-16 rounded-2xl ${feature.color} flex items-center justify-center text-white shadow-lg mb-8 group-hover:rotate-6 transition-transform`}>
                  <feature.icon size={30} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h4>
                <p className="text-slate-600 leading-relaxed mb-6">{feature.desc}</p>
                <button className="flex items-center gap-2 text-indigo-600 font-bold text-sm group/btn">
                  Learn more
                  <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl gradient-indigo flex items-center justify-center text-white">
                  <CreditCard size={20} />
                </div>
                <span className="font-bold text-xl tracking-tight">FinTrack</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                The world's most beautiful financial management platform for individuals and small businesses.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-lg mb-8">Product</h5>
              <ul className="space-y-4 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Solutions</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-lg mb-8">Company</h5>
              <ul className="space-y-4 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-lg mb-8">Newsletter</h5>
              <p className="text-slate-400 mb-6">Subscribe to get the latest financial tips and product updates.</p>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full px-4 py-4 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none pr-12 transition-all"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
          <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 text-sm">
            <p>© 2024 FinTrack Inc. All rights reserved.</p>
            <div className="flex items-center gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookies Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
