import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { GlassCard } from '../components/GlassCard';
import { ShieldAlert, Lock, Mail, ArrowRight, Eye, EyeOff, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminLogin = () => {
  const { login } = useAuth();
  const { addToast } = useNotifications();
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
      
      // Strict role check for Admin portal
      if (user.role !== 'admin') {
        localStorage.removeItem('fb_token');
        setError('Access Denied: This console is restricted to the platform administrator.');
        addToast('Access Denied', 'Unauthorized login attempt logged.', 'emergency');
        setLoading(false);
        return;
      }

      addToast('Welcome, Administrator', 'Console verification successful.', 'success');
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
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
          <Link to="/" className="inline-flex flex-col items-center gap-2 group mb-4">
            <div className="w-10 h-10 rounded-full bg-white border border-red-200/80 flex items-center justify-center shadow-sm text-red-500 group-hover:scale-105 transition-all duration-300">
              <Shield className="w-5.5 h-5.5 text-red-500 fill-red-500/10" />
            </div>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              ShareBite Admin
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">Administrative Gateway</h2>
          <p className="text-xs text-slate-500 mt-2">Enter credentials to unlock system configuration panels</p>
        </div>

        <GlassCard className="p-8 border-red-200/60 bg-white/50 backdrop-blur-md shadow-lg" glowColor="red">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-full">
              <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/25 text-red-600 text-xs rounded-xl font-bold text-center leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Email</label>
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
                  placeholder="Enter administrator email"
                  autoComplete="off"
                  className="form-input-premium focus:border-red-500/60 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Password</label>
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
                  placeholder="Enter console password"
                  autoComplete="new-password"
                  className="form-input-premium focus:border-red-500/60 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)]"
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

            {/* Secure login action */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 disabled:from-red-800 disabled:to-purple-800 text-white font-bold rounded-xl btn-3d-slate transition-all flex items-center justify-center gap-2 group text-sm relative overflow-hidden"
            >
              <span className={`flex items-center gap-2 transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                <span>Authenticate Session</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </span>
              )}
            </button>
          </form>
        </GlassCard>

        <p className="text-center text-xs text-slate-500 mt-6">
          Standard Partner?{' '}
          <Link to="/login" className="text-red-500 hover:underline font-semibold">
            Go to Portal Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
