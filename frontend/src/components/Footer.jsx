import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-900/10 dark:border-slate-800/40 bg-white/40 dark:bg-slate-950/20 py-8 text-center text-sm opacity-75 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200/80 flex items-center justify-center shadow-sm text-emerald-500">
            <Leaf className="w-4.5 h-4.5 text-emerald-500 fill-emerald-500/10" />
          </div>
          <span className="font-bold tracking-tight text-emerald-500">ShareBite</span>
          <span className="text-xs text-slate-500">Adnan Kaisar</span>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Connecting Donors, NGOs, and Volunteers to end food waste.
        </p>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link to="/" className="hover:text-emerald-500 transition-colors">Home</Link>
          <Link to="/listings" className="hover:text-emerald-500 transition-colors">Browse Food</Link>
          <Link to="/contact" className="hover:text-emerald-500 transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
