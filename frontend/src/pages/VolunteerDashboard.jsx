import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { GlassCard } from '../components/GlassCard';
import { MapRoute } from '../components/MapRoute';
import { Eye, Truck, CheckCircle, Navigation, MapPin, QrCode, ClipboardList, AlertCircle, User } from 'lucide-react';
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

export const VolunteerDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [availableTasks, setAvailableTasks] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [volCoords, setVolCoords] = useState({ lat: 40.758896, lng: -73.98513 }); // default Manhattan
  
  // Verification console state
  const [qrCodeInput, setQrCodeInput] = useState({});
  const [qrLoading, setQrLoading] = useState({});

  // QR Scanning Simulation State
  const [activeScanId, setActiveScanId] = useState(null);
  const [activeScanTitle, setActiveScanTitle] = useState('');
  const [activeScanTargetCode, setActiveScanTargetCode] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setVolCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        () => console.log('Using default NYC coordinates.')
      );
    }
  }, []);

  const fetchData = async () => {
    try {
      const allListings = await api.donations.list();
      
      // Available = status is 'accepted' (NGO claimed but no volunteer assigned yet)
      setAvailableTasks(allListings.filter(item => item.status === 'accepted'));
      
      // Active = volunteerId is user.id and status is assigned or picked_up
      setActiveTasks(allListings.filter(item => 
        item.volunteerId === user.id && 
        ['assigned', 'picked_up'].includes(item.status)
      ));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClaim = async (id, title) => {
    try {
      await api.deliveries.claimDelivery(id);
      addToast('Delivery Assigned!', `You are now delivering "${title}". Please pick it up from the donor.`, 'success');
      fetchData();
    } catch (err) {
      addToast('Claim Failed', err.message || 'Error claiming task', 'emergency');
    }
  };

  const handleManualStatus = async (id, nextStatus, title) => {
    try {
      await api.deliveries.updateStatus(id, nextStatus);
      addToast(
        nextStatus === 'picked_up' ? 'Food Picked Up!' : 'Food Delivered!',
        `Delivery status updated for "${title}".`,
        'success'
      );
      fetchData();
    } catch (err) {
      addToast('Status Update Failed', err.message || 'Error updating status', 'emergency');
    }
  };

  const handleQrVerify = async (e, id, title) => {
    e.preventDefault();
    const code = qrCodeInput[id]?.toUpperCase().trim();
    if (!code) {
      addToast('Input Required', 'Please enter the verification code.', 'warning');
      return;
    }

    setQrLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.deliveries.verifyQr(id, code);
      addToast('Verification Succeeded!', `QR code verified! Status updated for "${title}".`, 'success');
      setQrCodeInput(prev => ({ ...prev, [id]: '' }));
      fetchData();
    } catch (err) {
      addToast('Verification Failed', err.message || 'Invalid verification code', 'emergency');
    } finally {
      setQrLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleQrInputChange = (id, val) => {
    setQrCodeInput(prev => ({ ...prev, [id]: val }));
  };

  const startScanning = (id, title, qrCode) => {
    setActiveScanId(id);
    setActiveScanTitle(title);
    setActiveScanTargetCode(qrCode);
    
    // Simulate camera lock & scanning animation delay
    setTimeout(async () => {
      try {
        await api.deliveries.verifyQr(id, qrCode);
        addToast('Verification Succeeded!', `QR Code scanned and verified for "${title}"!`, 'success');
        fetchData();
      } catch (err) {
        addToast('Scan Failed', err.message || 'Verification failed', 'emergency');
      } finally {
        setActiveScanId(null);
      }
    }, 2500);
  };

  // Suggestions sorting
  const tasksWithDistance = availableTasks.map(item => {
    const lat2 = item.pickupCoordinates?.lat || 40.758896;
    const lng2 = item.pickupCoordinates?.lng || -73.98513;
    const distance = getDistance(volCoords.lat, volCoords.lng, lat2, lng2);
    return { ...item, distance };
  });

  const nearbyPickups = [...tasksWithDistance]
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome, {user.name}</h1>
          <p className="text-sm text-gray-400">Claim pending deliveries, route maps, and verify handovers</p>
        </div>
        
        <Link
          to="/profile"
          className="flex items-center gap-2 border border-slate-800 hover:border-slate-700 bg-slate-950/20 hover:bg-slate-900/30 text-gray-300 hover:text-white font-bold py-2.5 px-5 rounded-xl transition-all text-sm shadow"
        >
          <User className="w-4 h-4 text-emerald-400" />
          <span>Manage Profile</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Delivery Runs', val: activeCount },
          { label: 'Completed Deliveries', val: completedCount },
          { label: 'Hours Contributed', val: '12 hrs' },
          { label: 'Est. CO2 Reduced (kg)', val: CO2Saved }
        ].map((stat, idx) => (
          <GlassCard key={idx} className="p-5 flex flex-col justify-between" glowColor="blue">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{stat.label}</span>
            <span className="text-3xl font-black mt-2 text-white">{stat.val}</span>
          </GlassCard>
        ))}
      </div>

      {/* Nearby Pickups Suggestions panel */}
      {!loading && availableTasks.length > 0 && (
        <GlassCard className="p-6" glowColor="emerald">
          <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            🎯 Nearby Pickup Suggestions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nearbyPickups.map(item => {
              const id = item._id || item.id;
              return (
                <div key={id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between gap-3 hover:border-emerald-500/40 transition-all duration-300">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[9px] font-black uppercase text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" /> {item.distance.toFixed(1)} km away
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm mt-2 truncate">{item.title}</h3>
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{item.pickupAddress}</p>
                  </div>
                  <div className="flex gap-2 items-center justify-between mt-2 pt-2.5 border-t border-slate-800/40">
                    <span className="text-[10px] text-gray-500">Serves: {item.peopleServed}</span>
                    <button
                      onClick={() => handleClaim(id, item.title)}
                      className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-[10px] transition-colors shadow shadow-emerald-500/10 cursor-pointer"
                    >
                      Accept Run
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Active Tasks & Route Visualizer */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-400" /> Active Deliveries ({activeCount})
          </h2>

          {loading ? (
            <div className="py-8 text-center text-blue-400 font-bold text-xs animate-pulse">
              LOADING ACTIVE RUNS...
            </div>
          ) : activeTasks.length === 0 ? (
            <div className="py-12 text-center text-xs opacity-50 bg-slate-900/25 rounded-2xl border border-slate-850 p-6 flex flex-col items-center gap-2">
              <ClipboardList className="w-8 h-8 text-gray-500" />
              <p>No active delivery tasks assigned to you right now. Grab one from the right side!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {activeTasks.map(item => {
                const id = item._id || item.id;
                return (
                  <GlassCard key={id} className="p-6 flex flex-col gap-6" glowColor="blue">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-800/40">
                      <div>
                        <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/5 border border-blue-500/20 px-2.5 py-0.5 rounded">
                          {item.category}
                        </span>
                        <h3 className="font-extrabold text-white text-lg mt-1">{item.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">Quantity: <strong>{item.quantity}</strong> | Serves: <strong>{item.peopleServed}</strong></p>
                      </div>
                      
                      <div className="flex flex-col items-start sm:items-end gap-1">
                        <span className="text-xs px-2.5 py-0.5 rounded-full border border-blue-500/20 text-blue-400 bg-blue-500/10 font-bold tracking-wide uppercase">
                          {item.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] opacity-60">Created: {new Date(item.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Addresses */}
                      <div className="flex flex-col gap-3 justify-center">
                        <div className="flex gap-2">
                          <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <span className="font-bold text-gray-300">Donor Pickup Address</span>
                            <p className="text-gray-400 mt-0.5 leading-relaxed">{item.pickupAddress}</p>
                            <p className="text-gray-500 mt-0.5">Donor Name: {item.donorName} | Tel: {item.contactNumber}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <span className="font-bold text-gray-300">NGO Dropoff Destination</span>
                            <p className="text-gray-400 mt-0.5 leading-relaxed">NGO Partner Center Location</p>
                            <p className="text-gray-500 mt-0.5">NGO Name: {item.ngoName}</p>
                          </div>
                        </div>
                      </div>

                      {/* Map routing render */}
                      <MapRoute donorCoords={item.pickupCoordinates} status={item.status} />
                    </div>

                    {/* Completion Controls */}
                    <div className="flex flex-col md:flex-row items-center gap-4 justify-between pt-4 border-t border-slate-800/40 mt-1">
                      {/* QR verification input form */}
                      <form onSubmit={(e) => handleQrVerify(e, id, item.title)} className="flex items-center gap-2 w-full md:max-w-sm">
                        <div className="relative w-full">
                          <QrCode className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                          <input
                            type="text"
                            required
                            value={qrCodeInput[id] || ''}
                            onChange={(e) => handleQrInputChange(id, e.target.value)}
                            placeholder="Enter Donor QR (e.g. FB-ABCDEF)"
                            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-blue-500/50 rounded-lg text-xs placeholder-gray-500 text-white font-semibold uppercase"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={qrLoading[id]}
                          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 shadow shadow-blue-500/10 cursor-pointer"
                        >
                          {qrLoading[id] ? '...' : 'Verify'}
                        </button>
                        <button
                          type="button"
                          onClick={() => startScanning(id, item.title, item.qrCode)}
                          className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-750 text-gray-300 font-bold rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          📷 Scan
                        </button>
                      </form>

                      {/* Manual fallbacks buttons for demo purposes */}
                      <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                        {item.status === 'assigned' && (
                          <button
                            onClick={() => handleManualStatus(id, 'picked_up', item.title)}
                            className="w-full sm:w-auto px-4 py-2 border border-slate-800 hover:border-slate-700 text-gray-300 font-bold rounded-lg text-xs bg-slate-950 transition-colors"
                          >
                            Mark Picked Up (Demo)
                          </button>
                        )}
                        {item.status === 'picked_up' && (
                          <button
                            onClick={() => handleManualStatus(id, 'delivered', item.title)}
                            className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow shadow-emerald-500/15"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Confirm Delivery (Demo)
                          </button>
                        )}
                        <Link
                          to={`/donation/${id}`}
                          className="w-full sm:w-auto text-center px-4 py-2 border border-slate-800 hover:bg-slate-900/10 text-gray-400 hover:text-gray-300 font-bold rounded-lg text-xs transition-colors"
                        >
                          Chat Panel
                        </Link>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Open tasks listings */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" /> Open Delivery Jobs
          </h2>

          {loading ? (
            <div className="py-8 text-center text-emerald-400 font-bold text-xs animate-pulse">
              LOCATING JOBS...
            </div>
          ) : availableTasks.length === 0 ? (
            <div className="py-12 text-center text-xs opacity-50 bg-slate-900/25 rounded-2xl border border-slate-850 p-6 flex flex-col items-center gap-1.5">
              <AlertCircle className="w-5 h-5 text-gray-500" />
              <span>No unclaimed deliveries available in your queue. Check back shortly.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {availableTasks.map(item => {
                const id = item._id || item.id;
                return (
                  <GlassCard key={id} className="p-4 flex flex-col gap-3" glowColor="emerald">
                    <div>
                      <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      <h3 className="font-extrabold text-white text-sm mt-1 truncate">{item.title}</h3>
                      <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">{item.description}</p>
                    </div>

                    <div className="flex flex-col gap-1 text-[11px] opacity-75">
                      <span>Pickup: <strong className="text-gray-300">{item.pickupAddress}</strong></span>
                      <span>NGO Target: <strong className="text-gray-300">{item.ngoName}</strong></span>
                    </div>

                    <button
                      onClick={() => handleClaim(id, item.title)}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow shadow-emerald-500/10"
                    >
                      <Truck className="w-3.5 h-3.5" /> Accept Run
                    </button>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Visual QR Scanner Simulation Modal Overlay */}
      {activeScanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
          <div className="relative w-80 p-6 rounded-2xl border border-slate-800 bg-slate-950 flex flex-col items-center gap-6 shadow-2xl text-center">
            <h3 className="font-extrabold text-white text-base">Holographic Handover Scanner</h3>
            <p className="text-[11px] text-gray-400">Scanning recipient credentials for: <br/><strong className="text-blue-400">{activeScanTitle}</strong></p>

            {/* Scanning Viewport Box */}
            <div className="relative w-44 h-44 rounded-xl border-2 border-dashed border-blue-500 bg-slate-900/60 overflow-hidden flex items-center justify-center shadow-inner">
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-400"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-400"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-400"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-400"></div>

              {/* Laser line overlay */}
              <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_#10b981] animate-[scanLaser_2s_ease-in-out_infinite]"></div>

              <QrCode className="w-16 h-16 text-blue-500/20 animate-pulse" />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-emerald-400 font-bold tracking-widest animate-pulse">LOCKING SIGNALS...</span>
              <span className="text-[9px] text-gray-500 font-mono">CODE DIGEST: {activeScanTargetCode}</span>
            </div>

            <button
              onClick={() => setActiveScanId(null)}
              className="py-1.5 px-4 border border-slate-850 hover:bg-slate-900 text-xs font-bold text-gray-400 rounded-lg transition-colors cursor-pointer"
            >
              Abort Scanner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboard;
