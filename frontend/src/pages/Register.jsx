import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { User, Mail, Lock, Phone, MapPin, UserPlus, Info, Leaf, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'donor',
    donorType: 'individual',
    contactNumber: '',
    address: '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  });

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
      const user = await register(formData);
      if (user.role === 'donor') navigate('/donor-dashboard');
      else if (user.role === 'ngo') navigate('/ngo-dashboard');
      else if (user.role === 'volunteer') navigate('/volunteer-dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
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
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-6 flex flex-col items-center">
          <Link to="/" className="inline-flex flex-col items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200/80 flex items-center justify-center shadow-sm text-emerald-500 group-hover:scale-105 transition-all duration-300">
              <Leaf className="w-5.5 h-5.5 text-emerald-500 fill-emerald-500/10" />
            </div>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
              ShareBite
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">Create an Account</h2>
          <p className="text-sm text-slate-500 mt-2">Join as a partner to list, deliver, or distribute food</p>
        </div>

        <GlassCard className="p-8 border-slate-200/60 bg-white/50 backdrop-blur-md shadow-lg" glowColor="blue">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-lg font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Role Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Join As</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'donor', label: 'Donor' },
                  { value: 'ngo', label: 'NGO' },
                  { value: 'volunteer', label: 'Volunteer' }
                ].map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r.value })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.role === r.value
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 shadow-md shadow-emerald-500/5'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-500'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Donor Type selection */}
            {formData.role === 'donor' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Donor Classification</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'individual', label: '🏠 Individual User' },
                    { value: 'restaurant', label: '🍽️ Restaurant / Business' }
                  ].map(dt => (
                    <button
                      key={dt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, donorType: dt.value })}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 flex items-center justify-center gap-1.5 ${
                        formData.donorType === dt.value
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 shadow-md shadow-emerald-500/5'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-500'
                      }`}
                    >
                      {dt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Warning for NGO */}
            {formData.role === 'ngo' && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-800 text-xs rounded-xl flex gap-2 items-start leading-relaxed">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Notice:</strong> NGO accounts require manual identity verification by our Admin dashboard before food donations can be claimed.
                </span>
              </div>
            )}

            {/* Name Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name / Org Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full or organization name"
                  autoComplete="off"
                  className="form-input-premium"
                />
              </div>
            </div>

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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
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
                  placeholder="Create a strong password"
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

            {/* Contact Number Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  autoComplete="off"
                  className="form-input-premium"
                />
              </div>
            </div>

            {/* Address Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <MapPin className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter physical address"
                  autoComplete="off"
                  className="form-input-premium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 text-white font-bold rounded-xl btn-3d-emerald flex items-center justify-center gap-2 group text-sm relative overflow-hidden"
            >
              <span className={`flex items-center gap-2 transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                <span>Create Account</span>
                <UserPlus className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-500 hover:underline font-semibold">
            Log In here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
