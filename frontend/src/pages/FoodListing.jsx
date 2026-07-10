import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { Search, Eye, Filter, Calendar, Users, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const FoodListing = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await api.donations.list();
        setListings(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const categories = ['All', 'Cooked food', 'Packaged food', 'Fruits', 'Vegetables', 'Bakery items', 'Event leftovers'];

  // Filter listings
  const filteredListings = listings.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusClass = (status) => {
    const classes = {
      pending: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
      accepted: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      assigned: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      picked_up: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      delivered: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      expired: 'bg-gray-500/10 border-gray-500/20 text-gray-400'
    };
    return `text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${classes[status] || classes.pending}`;
  };

  // Stagger reveal animations configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.85,
        ease: [0.16, 1, 0.3, 1] // easeOutExpo
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Surplus Food Listings</h1>
        <p className="text-sm text-gray-400">Search and filter active donations listed by restaurants, events, and home kitchens</p>
      </motion.div>

      {/* Filter and Search controls */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items: biryani, donuts, vegetables..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-emerald-500/50 rounded-xl text-sm placeholder-gray-500 text-white"
          />
        </div>

        {/* Category Pills list */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                categoryFilter === cat
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow shadow-emerald-500/10'
                  : 'border-slate-800 bg-slate-950/50 hover:bg-slate-900 text-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Food Listings Grid */}
      {loading ? (
        <div className="py-24 text-center text-emerald-400 font-bold text-xs animate-pulse">
          RETRIEVING PLATFORM LISTINGS...
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="py-24 text-center text-xs opacity-50 bg-slate-900/10 rounded-2xl border border-slate-850 p-12">
          No food donations match your search. Try adjusting your filters.
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredListings.map(item => {
            const id = item._id || item.id;
            return (
              <motion.div key={id} variants={itemVariants}>
                <GlassCard className="p-0 overflow-hidden flex flex-col justify-between h-[410px]" glowColor="emerald">
                  {/* Visual Image cover */}
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    <div className="absolute top-3 right-3">
                      <span className={getStatusClass(item.status)}>{item.status}</span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-black uppercase text-white bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-extrabold text-gray-900 dark:text-white text-base truncate flex-1" title={item.title}>
                          {item.title}
                        </h3>
                        {item.donorType && (
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider ${
                            item.donorType === 'restaurant'
                              ? 'bg-amber-500/15 border border-amber-500/20 text-amber-500'
                              : 'bg-blue-500/15 border border-blue-500/20 text-blue-500'
                          }`}>
                            {item.donorType === 'restaurant' ? '🍽️ Rest.' : '🏠 House'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/40 text-xs">
                        <div className="flex items-center gap-1.5 opacity-75">
                          <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Qty: <strong>{item.quantity}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-75">
                          <Users className="w-3.5 h-3.5 text-blue-400" />
                          <span>Serves: <strong>{item.peopleServed}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-6 pt-3 border-t border-slate-800/40">
                      <div className="flex items-center gap-1 opacity-60 text-[10px]">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{new Date(item.expiryTime).toLocaleDateString()}</span>
                      </div>

                      <Link
                        to={`/donation/${id}`}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect Donation
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default FoodListing;
