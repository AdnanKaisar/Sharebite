import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { GlassCard } from '../components/GlassCard';
import { Users, ShieldAlert, Award, FileText, CheckCircle, XCircle, Trash2, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'users', 'inquiries'

  const fetchAdminData = async () => {
    try {
      const analytics = await api.admin.getAnalytics();
      setStats(analytics);

      const users = await api.admin.listUsers();
      setUsersList(users);

      const inquiryTickets = await api.inquiries.list();
      setInquiries(inquiryTickets);

      const donations = await api.donations.list();
      setAllDonations(donations);
    } catch (e) {
      console.error(e);
      addToast('Data Fetch Failed', 'Error loading administrative records.', 'emergency');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyNgo = async (userId, name) => {
    try {
      await api.admin.toggleNgoVerification(userId);
      addToast('NGO Verified!', `Verification updated for organization "${name}".`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast('Action Failed', err.message || 'Error toggling verification', 'emergency');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user ${name}?`)) return;
    try {
      await api.admin.deleteUser(id);
      addToast('User Deleted', `Account for "${name}" has been removed.`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast('Deletion Failed', err.message || 'Error removing user', 'emergency');
    }
  };

  const handleResolveInquiry = async (id) => {
    try {
      await api.inquiries.delete(id);
      addToast('Ticket Resolved', 'The inquiry has been closed and removed.', 'success');
      fetchAdminData();
    } catch (err) {
      addToast('Action Failed', err.message || 'Error resolving ticket', 'emergency');
    }
  };

  const handleDeleteDonation = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the food listing "${title}"?`)) return;
    try {
      await api.admin.deleteDonation(id);
      addToast('Listing Removed', `Donation "${title}" has been deleted.`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast('Action Failed', err.message || 'Error deleting listing', 'emergency');
    }
  };

  const handleApproveDonation = async (id, title) => {
    try {
      await api.deliveries.claimDonation(id);
      addToast('Listing Approved!', `Donation "${title}" approved and dispatched to a courier.`, 'success');
      fetchAdminData();
    } catch (err) {
      addToast('Action Failed', err.message || 'Error approving listing', 'emergency');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05060b] text-[#10B981]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-xs font-bold tracking-widest uppercase opacity-75">LOADING ADMINISTRATIVE CONSOLE...</p>
        </div>
      </div>
    );
  }

  const { summary = {}, categoryDistribution = [], monthlyStats = [] } = stats || {};

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Administrative Console</h1>
          <p className="text-sm text-gray-400">Monitor system activities, verify organizations, and review impact metrics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="flex items-center gap-2 border border-slate-800 hover:border-slate-700 bg-slate-950/20 hover:bg-slate-900/30 text-gray-300 hover:text-white font-bold py-2.5 px-5 rounded-xl transition-all text-sm shadow"
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>Manage Profile</span>
          </Link>

          {/* Tab Selection */}
          <div className="flex gap-2 bg-slate-950 p-1 rounded-xl border border-slate-900">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-emerald-500 text-white shadow shadow-emerald-500/10'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              System Impact
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-emerald-500 text-white shadow shadow-emerald-500/10'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              User Accounts ({usersList.length})
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'inquiries'
                  ? 'bg-emerald-500 text-white shadow shadow-emerald-500/10'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Inquiry Tickets ({inquiries.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <>
          {/* Stats Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Meals Distributed', val: summary.mealsDistributed || 0, icon: CheckCircle },
              { label: 'Food Saved (Est. kg)', val: summary.foodSavedKg ? summary.foodSavedKg.toFixed(0) : 0, icon: Award },
              { label: 'Verified NGO Partners', val: summary.activeNgos || 0, icon: Users },
              { label: 'Total Listings Logged', val: summary.totalDonations || 0, icon: FileText }
            ].map((stat, idx) => (
              <GlassCard key={idx} className="p-5 flex flex-col justify-between" glowColor="emerald">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{stat.label}</span>
                  <stat.icon className="w-5 h-5 text-emerald-400 opacity-60" />
                </div>
                <span className="text-3xl font-black mt-4 text-white">{stat.val}</span>
              </GlassCard>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* NGO Verification Desk */}
            <GlassCard className="lg:col-span-2 p-6 flex flex-col gap-4" glowColor="blue">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-blue-400" /> Pending NGO Verifications
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Organization</th>
                      <th className="py-2.5 px-3">Email Address</th>
                      <th className="py-2.5 px-3">Address</th>
                      <th className="py-2.5 px-3 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-xs">
                    {usersList.filter(u => u.role === 'ngo').map(ngo => {
                      const id = ngo._id || ngo.id;
                      return (
                        <tr key={id} className="hover:bg-slate-900/10">
                          <td className="py-3 px-3 font-semibold text-white">{ngo.name}</td>
                          <td className="py-3 px-3 opacity-80">{ngo.email}</td>
                          <td className="py-3 px-3 opacity-60 truncate max-w-xs">{ngo.address || 'Not Provided'}</td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleVerifyNgo(id, ngo.name)}
                              className={`px-3 py-1.5 font-bold rounded-lg transition-colors border ${
                                ngo.isVerifiedNgo
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                  : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                              }`}
                            >
                              {ngo.isVerifiedNgo ? 'Verified (Revoke)' : 'Verify NGO'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {usersList.filter(u => u.role === 'ngo').length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-6 opacity-50">No registered NGOs on the platform.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* Impact Distribution breakdown */}
            <GlassCard className="p-6 flex flex-col gap-4" glowColor="purple">
              <h2 className="text-lg font-bold text-white">Donation Categories</h2>
              <div className="flex flex-col gap-3 mt-2">
                {categoryDistribution.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span>{item.category}</span>
                      <span className="text-emerald-400">{item.count} listings</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                      <div
                        className="bg-emerald-400 h-full rounded-full"
                        style={{
                          width: `${summary.totalDonations ? (item.count / summary.totalDonations) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Global Food Donations & Tracking Feed */}
          <GlassCard className="p-6 flex flex-col gap-4 mt-6" glowColor="emerald">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" /> Active Platform Donations Audit
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Food Listing</th>
                    <th className="py-2.5 px-3">Donor</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-3 px-3">Claiming NGO</th>
                    <th className="py-3 px-3">Assigned Courier</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Moderate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-xs">
                  {allDonations.map(item => {
                    const id = item._id || item.id;
                    const statusColors = {
                      pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                      accepted: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                      assigned: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
                      picked_up: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                      delivered: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                      cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
                      expired: 'text-gray-400 bg-gray-500/10 border-gray-500/20'
                    };
                    return (
                      <tr key={id} className="hover:bg-slate-900/10">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white">{item.title}</div>
                          <div className="text-[10px] opacity-60">Qty: {item.quantity} (serves {item.peopleServed})</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold opacity-90">{item.donorName}</div>
                          <div className="text-[10px] opacity-50">{item.contactNumber}</div>
                        </td>
                        <td className="py-3 px-3 opacity-75">{item.category}</td>
                        <td className="py-3 px-3 font-semibold text-blue-400">{item.ngoName || <span className="opacity-40 italic">—</span>}</td>
                        <td className="py-3 px-3 font-semibold text-purple-400">{item.volunteerName || <span className="opacity-40 italic">—</span>}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded font-bold border text-[10px] uppercase tracking-wider ${statusColors[item.status] || 'text-gray-400 border-gray-500/25 bg-gray-500/5'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right flex justify-end gap-1.5">
                          {item.status === 'pending' && (
                            <button
                              onClick={() => handleApproveDonation(id, item.title)}
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded border border-emerald-500/10 transition-colors"
                              title="Approve & Dispatch Food"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteDonation(id, item.title)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded border border-red-500/10 transition-colors"
                            title="Remove Listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {allDonations.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-6 opacity-50">No food donation listings registered on the platform.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      ) : activeTab === 'users' ? (
        /* Users Tab panel */
        <GlassCard className="p-6" glowColor="blue">
          <h2 className="text-lg font-bold mb-4">Registered User Accounts</h2>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Verification</th>
                  <th className="py-2.5 px-3 text-right">Delete Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs">
                {usersList.map(item => {
                  const id = item._id || item.id;
                  return (
                    <tr key={id} className="hover:bg-slate-900/10">
                      <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                        <img src={item.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                        <span>{item.name}</span>
                      </td>
                      <td className="py-3 px-3 opacity-80">{item.email}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded font-semibold border ${
                          item.role === 'admin'
                            ? 'bg-purple-500/10 border-purple-500/25 text-purple-400'
                            : item.role === 'donor'
                            ? 'bg-yellow-500/10 border-yellow-500/25 text-yellow-400'
                            : item.role === 'ngo'
                            ? 'bg-blue-500/10 border-blue-500/25 text-blue-400'
                            : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                        }`}>
                          {item.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {item.role === 'ngo' ? (
                          item.isVerifiedNgo ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Verified
                            </span>
                          ) : (
                            <span className="text-red-400 font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Pending
                            </span>
                          )
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {item.role !== 'admin' ? (
                          <button
                            onClick={() => handleDeleteUser(id, item.name)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded border border-red-500/10 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-gray-600 text-xs italic">System Owner</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : (
        /* Inquiries Tab panel */
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Submitted Inquiry Tickets ({inquiries.length})
          </h2>

          {inquiries.length === 0 ? (
            <div className="py-12 text-center text-xs opacity-50 bg-slate-900/25 rounded-2xl border border-slate-850 p-6">
              No pending inquiry tickets received.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inquiries.map(ticket => {
                const id = ticket._id || ticket.id;
                return (
                  <GlassCard key={id} className="p-5 flex flex-col justify-between" glowColor="purple">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase text-purple-400 bg-purple-500/5 border border-purple-500/20 px-2 py-0.5 rounded">
                          Ticket Inquiry
                        </span>
                        <span className="text-[10px] opacity-60">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-white text-base truncate">{ticket.subject}</h3>
                      <p className="text-xs text-gray-400 mt-2 whitespace-pre-wrap leading-relaxed">{ticket.message}</p>
                      
                      <div className="flex flex-col gap-1 mt-4 pt-3 border-t border-slate-800/20 text-xs opacity-75">
                        <span>Sender: <strong>{ticket.name}</strong></span>
                        <span>Email: <strong>{ticket.email}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleResolveInquiry(id)}
                      className="mt-6 w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark as Resolved (Close Ticket)
                    </button>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
