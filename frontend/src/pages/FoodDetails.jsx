import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { GlassCard } from '../components/GlassCard';
import { MapRoute } from '../components/MapRoute';
import { Clock, Phone, MapPin, Send, MessageSquare, Star, ArrowLeft, AlertCircle, CheckCircle, QrCode } from 'lucide-react';

export const FoodDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Rating State
  const [score, setScore] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState('');

  const fetchDetails = async () => {
    try {
      const data = await api.donations.getDetails(id);
      setDonation(data);
      setRatingSubmitted(!!data.rating);
    } catch (e) {
      console.error(e);
      addToast('Fetch Failed', 'Error loading donation details.', 'emergency');
      navigate('/listings');
    } finally {
      setLoading(false);
    }
  };

  const fetchChat = async () => {
    try {
      const chatData = await api.chat.getMessages(id);
      setMessages(chatData);
    } catch (e) {
      console.error(e);
    }
  };

  const [liveCourierCoords, setLiveCourierCoords] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchDetails();
    fetchChat();

    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.emit('join_room', id);

    socket.on('receive_chat_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('location_updated', (coords) => {
      setLiveCourierCoords(coords);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  // Live Location stream for volunteers
  useEffect(() => {
    if (!donation || user.role !== 'volunteer' || donation.volunteerId !== user.id) return;
    if (!['assigned', 'picked_up'].includes(donation.status)) return;

    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (socketRef.current) {
            socketRef.current.emit('update_location', {
              donationId: id,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
          }
        },
        (err) => console.log('Location watch failed:', err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [donation, user, id]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Expiry Countdown Timer loop
  useEffect(() => {
    if (!donation) return;

    const timer = setInterval(() => {
      const diff = new Date(donation.expiryTime) - new Date();
      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${mins}m ${secs}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [donation]);

  const handleClaimDonation = async () => {
    if (!user.isVerifiedNgo) {
      addToast('Verification Required', 'Your NGO account must be verified to claim food.', 'warning');
      return;
    }
    try {
      await api.deliveries.claimDonation(id);
      addToast('Donation Claimed!', 'Verification code and delivery route updated.', 'success');
      fetchDetails();
    } catch (err) {
      addToast('Claim Failed', err.message, 'emergency');
    }
  };

  const handleClaimDelivery = async () => {
    try {
      await api.deliveries.claimDelivery(id);
      addToast('Delivery Accepted!', 'You have taken up the run.', 'success');
      fetchDetails();
    } catch (err) {
      addToast('Claim Failed', err.message, 'emergency');
    }
  };

  const handleManualStatus = async (nextStatus) => {
    try {
      await api.deliveries.updateStatus(id, nextStatus);
      addToast('Status Updated', `Delivery progress marked as ${nextStatus.replace('_', ' ')}.`, 'success');
      fetchDetails();
    } catch (err) {
      addToast('Update Failed', err.message, 'emergency');
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setChatLoading(true);
    try {
      const msg = await api.chat.sendMessage({ donationId: id, message: newMessage });
      if (socketRef.current) {
        socketRef.current.emit('send_chat_message', msg);
      }
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    } catch (err) {
      addToast('Send Failed', 'Error posting chat message.', 'emergency');
    } finally {
      setChatLoading(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.donations.rate(id, { score, feedback });
      addToast('Thank You!', 'Feedback submitted successfully.', 'success');
      setRatingSubmitted(true);
      fetchDetails();
    } catch (err) {
      addToast('Submission Failed', err.message, 'emergency');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05060b] text-[#10B981]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-xs font-bold uppercase tracking-wider opacity-75">LOADING LISTING CONSOLE...</p>
        </div>
      </div>
    );
  }

  const isExpired = timeLeft === 'EXPIRED' || new Date(donation.expiryTime) <= new Date();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Back button */}
      <div>
        <Link to="/listings" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-emerald-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Map */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Main Card */}
          <GlassCard className="p-6 md:p-8" glowColor="emerald">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-800/40">
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                  {donation.category}
                </span>
                <h1 className="text-2xl font-black text-white mt-2 leading-tight">{donation.title}</h1>
                <p className="text-xs text-gray-400 mt-2">Listed by <strong>{donation.donorName}</strong></p>
              </div>

              {/* Countdown Timer */}
              <div className="flex flex-col items-start md:items-end gap-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Time Remaining</span>
                <div className={`flex items-center gap-1.5 font-bold text-lg ${isExpired ? 'text-red-400' : 'text-yellow-400'}`}>
                  <Clock className="w-5 h-5 animate-pulse" />
                  <span>{timeLeft || 'Calculating...'}</span>
                </div>
              </div>
            </div>

            {/* Description / Info */}
            <div className="py-6 flex flex-col gap-4 text-sm leading-relaxed">
              <div>
                <span className="font-bold text-gray-300">Item Description</span>
                <p className="text-gray-400 mt-1">{donation.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/20 text-xs">
                <div>
                  <span className="font-semibold text-gray-500">QUANTITY</span>
                  <p className="text-white font-bold mt-0.5">{donation.quantity}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-500">SERVES (PEOPLE)</span>
                  <p className="text-white font-bold mt-0.5">{donation.peopleServed} people</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/20 text-xs">
                <div className="flex gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-300">Pickup Address</span>
                    <p className="text-gray-400 mt-0.5">{donation.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Phone className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-300">Contact Number</span>
                    <p className="text-gray-400 mt-0.5">{donation.contactNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons drawer */}
            <div className="pt-6 border-t border-slate-800/40 flex flex-wrap gap-3">
              {/* NGO claims listing */}
              {user.role === 'ngo' && donation.status === 'pending' && !isExpired && (
                <button
                  onClick={handleClaimDonation}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all text-xs"
                >
                  Claim Surpluses (Accept Donation)
                </button>
              )}

              {/* Volunteer accepts delivery task */}
              {user.role === 'volunteer' && donation.status === 'accepted' && (
                <button
                  onClick={handleClaimDelivery}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all text-xs"
                >
                  Accept Delivery Run
                </button>
              )}

              {/* Volunteer controls */}
              {user.role === 'volunteer' && donation.volunteerId === user.id && (
                <>
                  {donation.status === 'assigned' && (
                    <button
                      onClick={() => handleManualStatus('picked_up')}
                      className="px-6 py-3 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      Confirm Pickup Completed
                    </button>
                  )}
                  {donation.status === 'picked_up' && (
                    <button
                      onClick={() => handleManualStatus('delivered')}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all text-xs flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> Confirm Delivered to NGO
                    </button>
                  )}
                </>
              )}

              {/* Verification indicators */}
              {donation.status !== 'pending' && (
                <div className="w-full mt-4 p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs flex flex-col gap-2 opacity-80">
                  <div className="flex justify-between">
                    <span>NGO Assigned:</span>
                    <strong className="text-white">{donation.ngoName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Volunteer Assigned:</span>
                    <strong className="text-white">{donation.volunteerName || 'Unassigned'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>QR Verification Code:</span>
                    <strong className="text-emerald-400 font-mono tracking-widest bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded">
                      {donation.qrCode}
                    </strong>
                  </div>
                  {/* Graphical QR Code rendering */}
                  <div className="flex flex-col items-center gap-2 mt-4 pt-4 border-t border-slate-800/40">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Scan Handover QR Code</span>
                    <div className="p-2.5 bg-white rounded-xl shadow-lg border border-slate-200">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${donation.qrCode}`} 
                        alt="Handover Verification QR Code" 
                        className="w-32 h-32"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Map display */}
          <MapRoute donorCoords={donation.pickupCoordinates} status={donation.status} liveCourierCoords={liveCourierCoords} />

          {/* NGO Rating Drawer */}
          {user.role === 'ngo' && donation.ngoId === user.id && donation.status === 'delivered' && (
            <GlassCard className="p-6" glowColor="emerald">
              <h3 className="font-extrabold text-white text-base mb-4 flex items-center gap-1.5">
                <Star className="w-5 h-5 text-yellow-400" /> Rate Donor Quality
              </h3>
              
              {ratingSubmitted ? (
                <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 rounded-xl text-xs">
                  <CheckCircle className="w-4 h-4" /> Feedback has been successfully submitted!
                </div>
              ) : (
                <form onSubmit={handleRatingSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Rating Score</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setScore(val)}
                          className={`p-2 w-9 h-9 rounded-full font-bold border transition-colors ${
                            score === val
                              ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                              : 'border-slate-800 hover:bg-slate-900 text-gray-500'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Review Feedback</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Comment on package freshness, hygiene, and donor cooperativeness..."
                      rows="2.5"
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-yellow-500/50 rounded-xl text-xs placeholder-gray-500 text-white"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="self-end px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition-colors"
                  >
                    Submit Feedback
                  </button>
                </form>
              )}
            </GlassCard>
          )}
        </div>

        {/* Right Column: Chat Section */}
        <div className="flex flex-col gap-4">
          <GlassCard className="p-4 flex flex-col justify-between h-[520px]" glowColor="blue">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/40 mb-3">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span className="font-extrabold text-white text-sm">Delivery Chat Channels</span>
            </div>

            {/* Chat Box Area */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 min-h-[320px] max-h-[380px]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-1.5 text-center text-xs opacity-40 py-12">
                  <AlertCircle className="w-6 h-6 text-gray-500" />
                  <p>Send a message to coordinate pickup or delivery times.</p>
                </div>
              ) : (
                messages.map((item, idx) => {
                  const isMe = item.senderId === user.id;
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[85%] rounded-2xl py-2 px-3.5 text-xs leading-relaxed ${
                        isMe
                          ? 'self-end bg-emerald-500/10 border border-emerald-500/20 text-emerald-200'
                          : 'self-start bg-slate-950 border border-slate-850 text-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-1 opacity-60 font-semibold mb-0.5">
                        <span>{item.senderName}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p>{item.message}</p>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef}></div>
            </div>

            {/* Message input bar */}
            <form onSubmit={handleSendChat} className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/40">
              <input
                type="text"
                required
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type coordination message..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-850 focus:border-blue-500/50 rounded-lg text-xs placeholder-gray-500 text-white"
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="p-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-700 text-white rounded-lg transition-colors shadow shadow-blue-500/10"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default FoodDetails;
