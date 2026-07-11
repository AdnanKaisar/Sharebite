import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { Mail, Lock, LogIn, ArrowRight, Leaf, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(formData);
      if (user.role === 'donor') navigate('/donor-dashboard');
      else if (user.role === 'ngo') navigate('/ngo-dashboard');
      else if (user.role === 'volunteer') navigate('/volunteer-dashboard');
      else if (user.role === 'admin') navigate('/admin-dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center px-4 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <Link to="/" className="inline-flex flex-col items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200/80 flex items-center justify-center shadow-sm text-emerald-500 group-hover:scale-105 transition-all duration-300">
              <Leaf className="w-5.5 h-5.5 text-emerald-500 fill-emerald-500/10" />
            </div>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
              ShareBite
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">Welcome Back</h2>
          <p className="text-sm text-slate-500 mt-2">Log in to manage your donations and deliveries</p>
        </div>

        <GlassCard className="p-8 border-slate-200/60 bg-white/50 backdrop-blur-md shadow-lg" glowColor="emerald">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-lg font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  autoComplete="off"
                  className="form-input-premium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <Link to="#" className="text-xs text-emerald-500 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  autoComplete="new-password"
                  className="form-input-premium pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 text-white font-bold rounded-xl btn-3d-emerald flex items-center justify-center gap-2 group text-sm relative overflow-hidden"
            >
              <span className={`flex items-center gap-2 transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                <span>Sign In</span>
                <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </span>
              )}
            </button>
          </form>
        </GlassCard>

        <p className="text-center text-xs text-slate-500 mt-6 flex flex-col gap-2">
          <span>
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-500 hover:underline font-semibold inline-flex items-center gap-0.5">
              Create an account <ArrowRight className="w-3 h-3" />
            </Link>
          </span>
          <span className="text-[10px] opacity-75 mt-2 pt-2 border-t border-slate-200">
            System Administrator?{' '}
            <Link to="/admin-login" className="text-emerald-500 hover:underline font-bold">
              Secure Admin Console Login
            </Link>
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
