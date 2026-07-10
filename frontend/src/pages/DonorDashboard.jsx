import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { GlassCard } from '../components/GlassCard';
import { MapSelector } from '../components/MapSelector';
import { PlusCircle, History, Package, Clock, Eye, AlertCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DonorDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Cooked food',
    quantity: '',
    peopleServed: '',
    expiryTime: '',
    pickupAddress: '',
    contactNumber: '',
    imageUrl: '',
    pickupCoordinates: { lat: 40.758896, lng: -73.98513 } // Default Times Square NYC
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);

  const runAIPrediction = async () => {
    if (!formData.title.trim()) {
      addToast('Input Required', 'Please enter a food title first to get AI insights.', 'warning');
      return;
    }

    setAiLoading(true);
    setAiInsight(null);

    try {
      const catRes = await api.ai.categorize(formData.title, formData.description);
      const shelfRes = await api.ai.estimateShelfLife(formData.title, catRes.category, formData.description);

      const expiryDate = new Date(Date.now() + shelfRes.estimatedHours * 60 * 60 * 1000);
      const localExpiryStr = new Date(expiryDate.getTime() - expiryDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      setFormData(prev => ({
        ...prev,
        category: catRes.category,
        expiryTime: localExpiryStr
      }));

      setAiInsight({
        category: catRes.category,
        estimatedHours: shelfRes.estimatedHours,
        storageTips: shelfRes.storageTips,
        rationale: shelfRes.rationale,
        confidence: (catRes.confidence * 100).toFixed(0)
      });

      addToast('AI Insights Loaded!', 'Auto-categorized and calculated optimal shelf-life.', 'success');
    } catch (err) {
      console.error(err);
      addToast('AI Assistant Error', 'Failed to fetch recommendations.', 'warning');
    } finally {
      setAiLoading(false);
    }
  };

  const fetchDonorDonations = async () => {
    try {
      const data = await api.donations.list({ donorId: user.id });
      setDonations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorDonations();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCoordsChange = (coords) => {
    setFormData({ ...formData, pickupCoordinates: coords });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      // Validate expiry time is in future if provided
      if (formData.expiryTime && new Date(formData.expiryTime) <= new Date()) {
        addToast('Invalid Expiry Time', 'Expiry time must be in the future.', 'warning');
        setSubmitLoading(false);
        return;
      }

      await api.donations.create(formData);
      addToast('Listing Created!', 'Your donation is active! NGOs & Volunteers have been notified, and a courier will arrive shortly.', 'success');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'Cooked food',
        quantity: '',
        peopleServed: '',
        expiryTime: '',
        pickupAddress: '',
        contactNumber: '',
        imageUrl: '',
        pickupCoordinates: { lat: 40.758896, lng: -73.98513 }
      });
      setFormOpen(false);
      fetchDonorDonations();
    } catch (err) {
      addToast('Submission Failed', err.message || 'Error listing donation', 'emergency');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Stats calculation
  const totalDonations = donations.length;
  const activeDonations = donations.filter(d => ['pending', 'accepted', 'assigned', 'picked_up'].includes(d.status)).length;
  const foodSavedCount = donations.filter(d => d.status === 'delivered').length;
  const peopleHelped = donations.filter(d => d.status === 'delivered').reduce((sum, d) => sum + (d.peopleServed || 0), 0);

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
      accepted: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      assigned: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      picked_up: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      delivered: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      cancelled: 'bg-red-500/10 border-red-500/20 text-red-400',
      expired: 'bg-gray-500/10 border-gray-500/20 text-gray-400'
    };
    return `text-xs px-2.5 py-1 rounded-full border font-bold tracking-wide ${badges[status] || badges.pending}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome, {user.name}</h1>
          <p className="text-sm text-gray-400">Manage your listings and feed your local community</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="flex items-center gap-2 border border-slate-800 hover:border-slate-700 bg-slate-950/20 hover:bg-slate-900/30 text-gray-300 hover:text-white font-bold py-2.5 px-5 rounded-xl transition-all text-sm shadow"
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>Manage Profile</span>
          </Link>
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{formOpen ? 'Close Listing Form' : 'Donate Food'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Listings', val: totalDonations },
          { label: 'Active Tasks', val: activeDonations },
          { label: 'Meals Saved', val: foodSavedCount },
          { label: 'People Helped', val: peopleHelped }
        ].map((stat, idx) => (
          <GlassCard key={idx} className="p-5 flex flex-col justify-between" glowColor="emerald">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{stat.label}</span>
            <span className="text-3xl font-black mt-2 text-white">{stat.val}</span>
          </GlassCard>
        ))}
      </div>

      {/* Donation Form Drawer */}
      {formOpen && (
        <GlassCard className="p-6 md:p-8" glowColor="emerald">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" /> Fill Out Donation Details
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Food Item Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder=""
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description (Optional)</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder=""
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50"
                ></textarea>
              </div>

              {/* AI Assistant Insight Section */}
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col gap-3 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    ShareBite AI Assistant
                  </span>
                  <button
                    type="button"
                    onClick={runAIPrediction}
                    disabled={aiLoading}
                    className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition-all flex items-center gap-1 shadow shadow-emerald-500/15 cursor-pointer"
                  >
                    {aiLoading ? (
                      <>
                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <span>✨ Generate AI Predictions</span>
                      </>
                    )}
                  </button>
                </div>

                {aiInsight ? (
                  <div className="flex flex-col gap-2 text-xs leading-relaxed text-gray-300 bg-slate-950/45 p-3 rounded-lg border border-slate-800">
                    <div className="flex justify-between font-bold text-[10px] text-emerald-400">
                      <span>AUTO-CATEGORIZED: {aiInsight.category}</span>
                      <span>CONFIDENCE: {aiInsight.confidence}%</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-400">Estimated Shelf Life:</span>{' '}
                      <strong className="text-yellow-400">{aiInsight.estimatedHours} hours</strong>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-400">Storage & Transport Tips:</span>{' '}
                      <p className="text-gray-400 mt-0.5">{aiInsight.storageTips}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-400">Safety Justification:</span>{' '}
                      <p className="text-gray-500 mt-0.5 italic">"{aiInsight.rationale}"</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-500">
                    Provide a food title and description, then click "Generate AI Predictions" to automatically calculate optimal shelf-life expiry and categorize your item.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    <option>Cooked food</option>
                    <option>Packaged food</option>
                    <option>Fruits</option>
                    <option>Vegetables</option>
                    <option>Bakery items</option>
                    <option>Event leftovers</option>
                  </select>
                </div>

                {/* Expiry Time */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expiry Time (Optional)</label>
                  <input
                    type="datetime-local"
                    name="expiryTime"
                    value={formData.expiryTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {/* Quantity */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity</label>
                  <input
                    type="text"
                    name="quantity"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder=""
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                {/* People Served */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Serves (People)</label>
                  <input
                    type="number"
                    name="peopleServed"
                    required
                    value={formData.peopleServed}
                    onChange={handleChange}
                    placeholder=""
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contact Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    required
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder=""
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                {/* Optional Image Url */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Image URL (Optional)</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder=""
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Pickup Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pickup Address</label>
                <input
                  type="text"
                  name="pickupAddress"
                  required
                  value={formData.pickupAddress}
                  onChange={handleChange}
                  placeholder=""
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Map Coordinate Selector */}
              <MapSelector value={formData.pickupCoordinates} onChange={handleCoordsChange} height="220px" />

              <button
                type="submit"
                disabled={submitLoading}
                className="mt-4 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all text-sm flex items-center justify-center gap-2"
              >
                {submitLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>Publish Donation Listing</span>
                )}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* History Table */}
      <GlassCard className="p-6 overflow-hidden" glowColor="blue">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" /> Donation Listing History
        </h2>

        {loading ? (
          <div className="py-12 flex justify-center text-emerald-400 animate-pulse font-bold text-xs">
            RETRIEVING HISTORY...
          </div>
        ) : donations.length === 0 ? (
          <div className="py-12 text-center text-xs opacity-50 flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-gray-500" />
            <p>You haven't listed any donations yet. Click "Donate Food" to begin.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Food Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Expiry Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/35">
                  {donations.map((item) => {
                    const id = item._id || item.id;
                    return (
                      <tr key={id} className="hover:bg-slate-900/10 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div className="flex flex-col">
                            <span>{item.title}</span>
                            <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider mt-0.5">
                              {user.donorType === 'restaurant' ? '🍽️ Restaurant surplus' : '🏠 Household donation'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs">{item.category}</td>
                        <td className="py-3.5 px-4 text-xs font-bold text-blue-400">{item.quantity}</td>
                        <td className="py-3.5 px-4 text-xs opacity-75">
                          {new Date(item.expiryTime).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/donation/${id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> View / Chat
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {donations.map((item) => {
                const id = item._id || item.id;
                return (
                  <div key={id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex flex-col gap-3.5 shadow-sm">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.title}</h4>
                        <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider block mt-0.5">
                          {user.donorType === 'restaurant' ? '🍽️ Restaurant surplus' : '🏠 Household donation'}
                        </span>
                      </div>
                      <span className="shrink-0">{getStatusBadge(item.status)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-slate-900 py-2.5 opacity-80">
                      <div>
                        <span className="text-gray-500 block text-[9px] uppercase font-bold tracking-wider">Category</span>
                        <span className="text-gray-350">{item.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[9px] uppercase font-bold tracking-wider">Quantity</span>
                        <span className="text-blue-400 font-bold">{item.quantity}</span>
                      </div>
                      <div className="col-span-2 mt-1">
                        <span className="text-gray-500 block text-[9px] uppercase font-bold tracking-wider">Expiry Time</span>
                        <span className="text-gray-455 text-gray-400">{new Date(item.expiryTime).toLocaleString()}</span>
                      </div>
                    </div>

                    <Link
                      to={`/donation/${id}`}
                      className="w-full text-center py-2 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" /> View Details & Chat
                    </Link>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
};

export default DonorDashboard;
