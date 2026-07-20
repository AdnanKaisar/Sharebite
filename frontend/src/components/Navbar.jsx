import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Menu, X, Sun, Moon, Bell, LogOut, User, Settings, Shield, Leaf, Heart } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path) => location.pathname === path;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    return `/${user.role}-dashboard`;
  };

  return (
    <nav className={`fixed top-4 left-1/2 transform -translate-x-1/2 w-[94%] max-w-7xl z-50 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
      theme === 'dark'
        ? 'bg-slate-950/75 border-slate-900/40 text-gray-100 shadow-lg shadow-black/45'
        : 'bg-white/75 border-slate-200/40 text-gray-800 shadow-lg shadow-slate-200/45'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200/80 flex items-center justify-center shadow-sm text-emerald-500 group-hover:scale-105 transition-all duration-300">
                <Leaf className="w-5.5 h-5.5 text-emerald-500 fill-emerald-500/10" />
              </div>
              <div className="flex flex-col text-left leading-none justify-center">
                <div className="text-base font-black tracking-tight flex items-center gap-0.5 leading-none">
                  <span className="text-slate-900">Share</span>
                  <span className="text-emerald-500">Bite</span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 tracking-wider mt-1 uppercase leading-none">
                  Food Donation Network
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link 
              to="/" 
              className={`transition-all text-sm font-bold relative pb-1 pt-1.5 ${
                isActive('/') ? 'text-emerald-500 border-b-2 border-emerald-500' : theme === 'dark' ? 'text-gray-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-500'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`transition-all text-sm font-bold relative pb-1 pt-1.5 ${
                isActive('/about') ? 'text-emerald-500 border-b-2 border-emerald-500' : theme === 'dark' ? 'text-gray-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-500'
              }`}
            >
              About Us
            </Link>
            <Link 
              to="/register" 
              className={`transition-all text-sm font-bold relative pb-1 pt-1.5 ${
                isActive('/register') ? 'text-emerald-500 border-b-2 border-emerald-500' : theme === 'dark' ? 'text-gray-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-500'
              }`}
            >
              Donate
            </Link>
            <Link 
              to="/listings" 
              className={`transition-all text-sm font-bold relative pb-1 pt-1.5 ${
                isActive('/listings') ? 'text-emerald-500 border-b-2 border-emerald-500' : theme === 'dark' ? 'text-gray-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-500'
              }`}
            >
              Request
            </Link>
            <Link 
              to="/contact" 
              className={`transition-all text-sm font-bold relative pb-1 pt-1.5 ${
                isActive('/contact') ? 'text-emerald-500 border-b-2 border-emerald-500' : theme === 'dark' ? 'text-gray-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-500'
              }`}
            >
              Contact Us
            </Link>
            {!user && (
              <Link 
                to="/login" 
                className={`transition-all text-sm font-bold relative pb-1 pt-1.5 ${
                  isActive('/login') ? 'text-emerald-500 border-b-2 border-emerald-500' : theme === 'dark' ? 'text-gray-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-500'
                }`}
              >
                Sign In
              </Link>
            )}
            {user && (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className={`transition-all text-sm font-bold relative pb-1 pt-1.5 ${
                    location.pathname.includes('dashboard') ? 'text-emerald-500 border-b-2 border-emerald-500' : theme === 'dark' ? 'text-gray-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-500'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className={`transition-all text-sm font-bold relative pb-1 pt-1.5 ${
                    isActive('/profile') ? 'text-emerald-500 border-b-2 border-emerald-500' : theme === 'dark' ? 'text-gray-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-500'
                  }`}
                >
                  Profile
                </Link>
              </>
            )}
          </div>

          {/* Action Icons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-slate-900 text-amber-400' 
                  : 'hover:bg-slate-100 text-indigo-600'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark' ? 'hover:bg-slate-900 text-gray-300' : 'hover:bg-slate-100 text-gray-600'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown Panel */}
                  {showNotifications && (
                    <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border backdrop-blur-xl p-3 z-50 ${
                      theme === 'dark' ? 'bg-slate-950/95 border-slate-800' : 'bg-white/95 border-slate-200'
                    }`}>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800/20 mb-2">
                        <span className="font-bold text-sm">Notifications</span>
                        <span className="text-xs opacity-60">{unreadCount} unread</span>
                      </div>
                      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-center py-4 opacity-50">No notifications yet.</p>
                        ) : (
                          notifications.slice(0, 5).map(item => {
                            const id = item._id || item.id;
                            return (
                              <div
                                key={id}
                                onClick={() => markAsRead(id)}
                                className={`p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                                  item.read 
                                    ? 'opacity-65 hover:bg-slate-850'
                                    : 'bg-emerald-500/5 hover:bg-emerald-500/10 border-l-2 border-emerald-500'
                                }`}
                              >
                                <div className="font-semibold">{item.title}</div>
                                <p className="opacity-80 mt-0.5">{item.message}</p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Avatar */}
                <Link to="/profile" className="flex items-center gap-2 group">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-emerald-500/30 group-hover:border-emerald-400 transition-colors object-cover"
                  />
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-sm font-semibold transition-all border border-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center">
                <Link
                  to="/login"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold py-2.5 px-6 rounded-full shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 text-white" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-800/25"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className={`md:hidden absolute top-16 left-0 right-0 mt-2 rounded-2xl border p-6 flex flex-col gap-3.5 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-slate-950/95 border-slate-900/40 text-gray-200 shadow-black/50' 
            : 'bg-white/95 border-slate-200/40 text-gray-800 shadow-slate-200/50'
        }`}>
          <Link to="/" onClick={() => setIsOpen(false)} className={`py-2 text-sm font-bold transition-colors ${isActive('/') ? 'text-emerald-500' : theme === 'dark' ? 'text-gray-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-500'}`}>Home</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className={`py-2 text-sm font-bold transition-colors ${isActive('/about') ? 'text-emerald-500' : theme === 'dark' ? 'text-gray-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-500'}`}>About Us</Link>
          <Link to="/register" onClick={() => setIsOpen(false)} className={`py-2 text-sm font-bold transition-colors ${isActive('/register') ? 'text-emerald-500' : theme === 'dark' ? 'text-gray-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-500'}`}>Donate</Link>
          <Link to="/listings" onClick={() => setIsOpen(false)} className={`py-2 text-sm font-bold transition-colors ${isActive('/listings') ? 'text-emerald-500' : theme === 'dark' ? 'text-gray-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-500'}`}>Request</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className={`py-2 text-sm font-bold transition-colors ${isActive('/contact') ? 'text-emerald-500' : theme === 'dark' ? 'text-gray-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-500'}`}>Contact Us</Link>
          {!user && (
            <Link to="/login" onClick={() => setIsOpen(false)} className={`py-2 text-sm font-bold transition-colors ${isActive('/login') ? 'text-emerald-500' : theme === 'dark' ? 'text-gray-300 hover:text-emerald-400' : 'text-slate-700 hover:text-emerald-500'}`}>Sign In</Link>
          )}
          {user && (
            <>
              <Link to={getDashboardLink()} onClick={() => setIsOpen(false)} className="py-2 text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors">Dashboard</Link>
              <Link to="/profile" onClick={() => setIsOpen(false)} className="py-2 text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors">Profile Settings</Link>
            </>
          )}
          
          <div className="flex items-center justify-between py-1 border-b border-slate-800/10 dark:border-slate-850/40">
            <span className="text-sm font-bold">Theme</span>
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                theme === 'dark' 
                  ? 'hover:bg-slate-900 text-amber-400' 
                  : 'hover:bg-slate-100 text-indigo-650'
              }`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-semibold">Dark Mode</span>
                </>
              )}
            </button>
          </div>
          
          <div className="border-t border-slate-800/10 dark:border-slate-850/40 my-1"></div>
          
          {user ? (
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => { setIsOpen(false); handleLogout(); }}
                className="w-full text-left py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border border-red-500/10"
              >
                <LogOut className="w-4 h-4" /> Logout Account
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-1">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center font-bold py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm shadow shadow-emerald-500/10 transition-all flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 text-white" /> Sign In
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
