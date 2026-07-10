import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { GlassCard } from '../components/GlassCard';
import { MapSelector } from '../components/MapSelector';
import { Eye, Hand, CheckSquare, PlusCircle, AlertTriangle, ShieldCheck, HeartHandshake, User, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return d;
};

export const NGODashboard = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [availableFood, setAvailableFood] = useState([]);
  const [claimedFood, setClaimedFood] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ngoCoords, setNgoCoords] = useState({ lat: 40.73061, lng: -73.935242 }); // Default NYC

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setNgoCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        () => {
          console.log('Using default NYC coordinates.');
        }
      );
    }
  }, []);
  
  // Emergency Form State
  const [reqFormOpen, setReqFormOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reqData, setReqData] = useState({
    title: '',
    description: '',
    quantityNeeded: '',
    peopleCount: '',
    location: '',
    contactNumber: '',
    urgency: 'medium',
    coordinates: { lat: 40.73061, lng: -73.935242 }
  });

  const fetchData = async () => {
    try {
      const allListings = await api.donations.list();
      
      // Available = status is 'pending'
      setAvailableFood(allListings.filter(item => item.status === 'pending'));
      
      // Claimed by this NGO = ngoId is user.id
      setClaimedFood(allListings.filter(item => item.ngoId === user.id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableWithDistance = availableFood.map(item => {
    const lat2 = item.pickupCoordinates?.lat || 40.73061;
    const lng2 = item.pickupCoordinates?.lng || -73.935242;
    const distance = getDistance(ngoCoords.lat, ngoCoords.lng, lat2, lng2);
    return { ...item, distance };
  });

  const nearbySuggestions = [...availableWithDistance]
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  const handleClaim = async (id, title) => {
    if (!user.isVerifiedNgo) {
      addToast('Unverified Account', 'You must be verified by an admin to claim food.', 'warning');
      return;
    }

    try {
      await api.deliveries.claimDonation(id);
      addToast('Donation Claimed!', `You have claimed "${title}". A volunteer will pick it up soon.`, 'success');
      fetchData();
    } catch (err) {
      addToast('Claim Failed', err.message || 'Error claiming donation', 'emergency');
    }
  };

  const handleReqChange = (e) => {
    setReqData({ ...reqData, [e.target.name]: e.target.value });
  };

  const handleCoordsChange = (coords) => {
    setReqData({ ...reqData, coordinates: coords });
  };

  const handleReqSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await api.donations.createEmergency(reqData);
      addToast('Emergency Request Listed!', 'All nearby donors and volunteers have been notified.', 'success');
      setReqData({
        title: '',
        description: '',
        quantityNeeded: '',
        peopleCount: '',
        location: '',
        contactNumber: '',
        urgency: 'medium',
        coordinates: { lat: 40.73061, lng: -73.935242 }
      });
      setReqFormOpen(false);
    } catch (err) {
      addToast('Submission Failed', err.message || 'Error posting request', 'emergency');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      accepted: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
      assigned: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
      picked_up: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
      delivered: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      expired: 'text-gray-400 border-gray-500/20 bg-gray-500/5'
    };
    return `text-xs px-2.5 py-1 rounded-lg border font-bold ${colors[status] || 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5'}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Verification Warning Alert */}
      {!user.isVerifiedNgo && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/25 text-yellow-200 rounded-2xl flex gap-3 items-start leading-relaxed shadow-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-sm">Account Verification Pending</span>
            <p className="text-xs opacity-85">
              Your NGO registration is currently under review by our administration. Once verified, you will be able to claim surplus donations listed in your area. Emergency requests remain fully operational.
            </p>
          </div>
        </div>
      )}

      {/* NGO Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            Welcome, {user.name}
            {user.isVerifiedNgo && <ShieldCheck className="w-6 h-6 text-emerald-400 filter drop-shadow-[0_0_8px_#10b981]" />}
          </h1>
          <p className="text-sm text-gray-400">Claim surplus food listings and manage distribution tasks</p>
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
            onClick={() => setReqFormOpen(!reqFormOpen)}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/35 border border-red-500/30 text-red-300 font-bold py-2.5 px-5 rounded-xl transition-all text-sm shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{reqFormOpen ? 'Close Emergency Form' : 'Request Emergency Food'}</span>
          </button>
        </div>
      </div>

      {/* Emergency Request Form Drawer */}
      {reqFormOpen && (
        <GlassCard className="p-6 md:p-8" glowColor="purple">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-300">
            <HeartHandshake className="w-5 h-5" /> Request Emergency Food Aid
          </h2>

          <form onSubmit={handleReqSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Request Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={reqData.title}
                  onChange={handleReqChange}
                  placeholder=""
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</label>
                <textarea
                  name="description"
                  required
                  rows="3"
                  value={reqData.description}
                  onChange={handleReqChange}
                  placeholder=""
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Quantity Needed */}
                <div className="flex flex-col col-span-1 sm:col-span-2 gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity Needed</label>
                  <input
                    type="text"
                    name="quantityNeeded"
                    required
                    value={reqData.quantityNeeded}
                    onChange={handleReqChange}
                    placeholder=""
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                {/* Urgency */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Urgency</label>
                  <select
                    name="urgency"
                    value={reqData.urgency}
                    onChange={handleReqChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* People Count */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">People In Need</label>
                  <input
                    type="number"
                    name="peopleCount"
                    required
                    value={reqData.peopleCount}
                    onChange={handleReqChange}
                    placeholder=""
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                {/* Contact Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    required
                    value={reqData.contactNumber}
                    onChange={handleReqChange}
                    placeholder=""
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Delivery Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dropoff Address</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={reqData.location}
                  onChange={handleReqChange}
                  placeholder=""
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50"
                />
              </div>

              {/* Map Coordinates Selector */}
              <MapSelector value={reqData.coordinates} onChange={handleCoordsChange} height="220px" />

              <button
                type="submit"
                disabled={submitLoading}
                className="mt-4 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all text-sm flex items-center justify-center gap-2"
              >
                {submitLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>Publish Emergency Request</span>
                )}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Nearby Suggestions panel */}
      {!loading && availableFood.length > 0 && (
        <GlassCard className="p-6" glowColor="purple">
          <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping"></span>
            🎯 Nearby Donation Suggestions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nearbySuggestions.map(item => {
              const id = item._id || item.id;
              return (
                <div key={id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between gap-3 hover:border-purple-500/40 transition-all duration-300">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[9px] font-black uppercase text-purple-400 border border-purple-500/20 bg-purple-500/5 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" /> {item.distance.toFixed(1)} km away
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm mt-2 truncate">{item.title}</h3>
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex gap-2 items-center justify-between mt-2 pt-2.5 border-t border-slate-800/40">
                    <span className="text-[10px] text-gray-500 font-bold">Serves: {item.peopleServed}</span>
                    <button
                      onClick={() => handleClaim(id, item.title)}
                      className="py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[10px] transition-colors shadow shadow-purple-500/10 cursor-pointer"
                    >
                      Quick Claim
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Available food listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Browse Food Listings */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Hand className="w-5 h-5 text-emerald-400" /> Surplus Food Available Near You
          </h2>

          {loading ? (
            <div className="py-12 text-center text-emerald-400 font-bold text-xs animate-pulse">
              LOCATING LOCAL DONATIONS...
            </div>
          ) : availableFood.length === 0 ? (
            <div className="py-12 text-center text-xs opacity-50 bg-slate-900/25 rounded-2xl border border-slate-850 p-6 flex flex-col items-center gap-2">
              <p>No active food donations in your neighborhood right now.</p>
              <Link to="/listings" className="text-emerald-400 hover:underline font-bold mt-1">Browse past history</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableFood.map(item => {
                const id = item._id || item.id;
                return (
                  <GlassCard key={id} className="p-5 flex flex-col justify-between h-72" glowColor="emerald">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                          {item.category}
                        </span>
                        <span className="text-[10px] opacity-60">Expires soon</span>
                      </div>
                      <h3 className="font-bold text-white text-base truncate">{item.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-3 mt-1.5 leading-relaxed">{item.description}</p>
                      
                      <div className="flex flex-col gap-1 mt-4 text-xs opacity-80">
                        <span>Quantity: <strong>{item.quantity}</strong></span>
                        <span>Serves: <strong>{item.peopleServed} people</strong></span>
                        <span className="truncate">Donor: <strong>{item.donorName}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/50">
                      <Link
                        to={`/donation/${id}`}
                        className="flex-1 text-center py-2 border border-slate-800 hover:border-slate-700 bg-slate-950 text-xs font-bold text-gray-300 rounded-lg transition-colors"
                      >
                        Inspect Details
                      </Link>
                      <button
                        onClick={() => handleClaim(id, item.title)}
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 text-xs font-bold text-white rounded-lg transition-all shadow shadow-emerald-500/10"
                      >
                        Claim Donation
                      </button>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Active Claims Logs */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-400" /> My Claimed Donations
          </h2>

          {loading ? (
            <div className="py-12 text-center text-blue-400 font-bold text-xs animate-pulse">
              RETRIEVING CLAIMS...
            </div>
          ) : claimedFood.length === 0 ? (
            <div className="py-12 text-center text-xs opacity-50 bg-slate-900/25 rounded-2xl border border-slate-850 p-6">
              You haven't claimed any donations yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {claimedFood.map(item => {
                const id = item._id || item.id;
                return (
                  <GlassCard key={id} className="p-4 flex flex-col gap-3" glowColor="blue">
                    <div className="flex justify-between items-center gap-2">
                      <h3 className="font-bold text-white text-sm truncate flex-1">{item.title}</h3>
                      {getStatusColor(item.status) ? (
                        <span className={getStatusColor(item.status)}>{item.status}</span>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-1 text-xs opacity-75">
                      <span>Donor: <strong>{item.donorName}</strong></span>
                      <span>Volunteer: <strong>{item.volunteerName || 'Not assigned yet'}</strong></span>
                      <span>Expiry: <strong>{new Date(item.expiryTime).toLocaleTimeString()}</strong></span>
                    </div>

                    <div className="flex items-center gap-2 border-t border-slate-800/40 pt-2.5 mt-1">
                      <Link
                        to={`/donation/${id}`}
                        className="w-full text-center py-2 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/20 text-xs font-bold text-blue-300 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Track / Message
                      </Link>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
