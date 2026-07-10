import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { Mail, Phone, Send, CheckCircle, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Contact = () => {
  const { theme } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.inquiries.submit(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      alert(err.message || 'Error transmitting ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-8 relative overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'text-white' : 'text-slate-900'
    }`}>
      {/* 3D Ambient Blur Blobs */}
      <div className="absolute top-1/3 left-[-5%] w-72 h-72 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[-5%] w-80 h-80 rounded-full bg-purple-500/10 blur-[130px] pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
        className="z-10"
      >
        <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}>Contact ShareBite Support</h1>
        <p className={`text-sm mt-1.5 ${
          theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
        }`}>Reach out to our platform support, report verification issues, or partner with us</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 z-10">
        {/* Info Col */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.95, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6"
        >
          <GlassCard className="p-6 flex flex-col gap-4 border-slate-800 bg-slate-950/20 shadow-2xl" glowColor="blue">
            <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-1`}>Admin Desk</h2>
            
            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
              For NGO verification support, sponsorship opportunities, or direct platform administration queries, connect directly:
            </p>

            <div className={`flex flex-col gap-4 text-xs mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
              <div className="flex gap-2 items-center">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+91 7780946112</span>
              </div>
              <div className="flex gap-2 items-center">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>adnankaisar112@gmail.com</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 flex flex-col gap-2.5 border-slate-800 bg-slate-950/20 shadow-2xl" glowColor="purple">
            <h3 className={`font-extrabold text-sm flex items-center gap-1.5 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              <HelpCircle className="w-4 h-4 text-purple-400" /> FAQ Highlights
            </h3>
            <div className={`flex flex-col gap-3.5 text-xs mt-1 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
              <div>
                <strong className={`block mb-0.5 ${theme === 'dark' ? 'text-gray-250' : 'text-slate-700'}`}>How fast is delivery?</strong>
                <p>Most donations are claimed and delivered within 45 minutes of creation.</p>
              </div>
              <div>
                <strong className={`block mb-0.5 ${theme === 'dark' ? 'text-gray-250' : 'text-slate-700'}`}>Is it tax-deductible?</strong>
                <p>Yes, all verified NGOs issue compliance certificates for corporate tax deductions.</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Form Col */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.95, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6 md:p-8 border-slate-800 bg-slate-950/20 shadow-2xl" glowColor="emerald">
            {success ? (
              <div className="py-12 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-bounce">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Inquiry Received Successfully!</h3>
                <p className={`text-sm max-w-md leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                  Thank you for writing. A ShareBite platform representative has logged your ticket and will respond to your email address within 2 hours.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-4 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white rounded-lg transition-all cursor-pointer"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'} mb-2`}>Send an Inquiry Ticket</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter name"
                      className="form-input-premium-noicon"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      className="form-input-premium-noicon"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="NGO verification, sponsorship, system issue..."
                    className="form-input-premium-noicon"
                  />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Message Body</label>
                  <textarea
                    name="message"
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Input detailed ticket information here..."
                    className="form-input-premium-noicon h-32 py-2"
                  ></textarea>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 text-white font-bold rounded-xl btn-3d-emerald flex items-center justify-center gap-2 group text-sm cursor-pointer shadow shadow-emerald-500/10"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Submit Ticket</span>
                      <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
