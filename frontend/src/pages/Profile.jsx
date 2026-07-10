import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { GlassCard } from '../components/GlassCard';
import { Save, User as UserIcon, Phone, MapPin } from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useNotifications();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    contactNumber: user?.contactNumber || '',
    address: user?.address || '',
    avatar: user?.avatar || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        contactNumber: user.contactNumber || '',
        address: user.address || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      addToast('Profile Updated', 'Your profile details have been saved.', 'success');
    } catch (err) {
      addToast('Update Failed', err.message || 'Error updating profile', 'emergency');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Partner Profile Settings</h1>
        <p className="text-sm text-gray-400">Configure your listing details, contact information, and dashboard display</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Sidebar card */}
        <GlassCard className="p-6 text-center flex flex-col items-center justify-between" glowColor="blue">
          <div className="flex flex-col items-center gap-3">
            <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-500/50 shadow-lg">
              <img
                src={formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60'}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-extrabold text-white text-base mt-2">{user?.name}</h3>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded border border-blue-500/20 text-blue-400 bg-blue-500/5">
              {user?.role} Partner
            </span>
          </div>

          <div className="w-full pt-6 mt-6 border-t border-slate-800/40 text-left text-xs text-gray-400 flex flex-col gap-2">
            <div className="flex justify-between">
              <span>Account Status:</span>
              <strong className="text-emerald-400">Active</strong>
            </div>
            {user?.role === 'ngo' && (
              <div className="flex justify-between">
                <span>Verification Check:</span>
                <strong className={user?.isVerifiedNgo ? 'text-emerald-400' : 'text-yellow-400'}>
                  {user?.isVerifiedNgo ? 'Verified NGO' : 'Pending Verification'}
                </strong>
              </div>
            )}
            <div className="flex justify-between">
              <span>Member Since:</span>
              <strong>June 2026</strong>
            </div>
          </div>
        </GlassCard>

        {/* Profile Inputs Form */}
        <GlassCard className="md:col-span-2 p-6 md:p-8" glowColor="emerald">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-emerald-400" /> Account Information
            </h2>

            {/* Email Address (disabled) */}
            <div className="flex flex-col gap-1.5 opacity-60">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address (Primary)</label>
              <input
                type="email"
                disabled
                value={user?.email}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-gray-400 text-sm cursor-not-allowed"
              />
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Display Name / Organization</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder=""
                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Contact number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder=""
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Physical Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <MapPin className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder=""
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>


            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration Changes</span>
                </>
              )}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default Profile;
