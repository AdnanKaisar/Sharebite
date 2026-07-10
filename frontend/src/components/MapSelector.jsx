import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Compass } from 'lucide-react';

export const MapSelector = ({ value, onChange, height = '250px' }) => {
  const containerRef = useRef(null);
  const [pinPos, setPinPos] = useState({ x: 150, y: 125 });

  // Convert coordinate properties to pixel positions on startup
  useEffect(() => {
    if (value && value.lat && value.lng) {
      // Scale coordinates back to 0-300 grid box
      const x = Math.round((value.lng - (-74.05)) * (300 / 0.1));
      const y = Math.round((40.80 - value.lat) * (250 / 0.1));
      if (x >= 0 && x <= 300 && y >= 0 && y <= 250) {
        setPinPos({ x, y });
      }
    }
  }, [value]);

  const handleMapClick = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(300, Math.round((e.clientX - rect.left) * (300 / rect.width))));
    const y = Math.max(0, Math.min(250, Math.round((e.clientY - rect.top) * (250 / rect.height))));

    setPinPos({ x, y });

    // Map click pixel to NY bounding coordinates
    const lat = Number((40.80 - (y * (0.1 / 250))).toFixed(6));
    const lng = Number(((-74.05) + (x * (0.1 / 300))).toFixed(6));

    if (onChange) {
      onChange({ lat, lng });
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center text-xs opacity-75">
        <span className="flex items-center gap-1 font-semibold text-emerald-400">
          <Compass className="w-3.5 h-3.5 animate-spin-slow" /> Interactive Map Simulation
        </span>
        <span>
          LAT: <strong className="text-white">{value?.lat || '40.750000'}</strong>, LNG:{' '}
          <strong className="text-white">{value?.lng || '-74.000000'}</strong>
        </span>
      </div>

      <div
        ref={containerRef}
        onClick={handleMapClick}
        style={{ height }}
        className="relative w-full rounded-xl overflow-hidden border border-emerald-500/25 bg-slate-950 cursor-crosshair group shadow-inner"
      >
        {/* Holographic grid lines */}
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none opacity-20">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="border-t border-l border-emerald-500/30 w-full h-full"></div>
          ))}
        </div>

        {/* Neighborhood visual blocks */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 250">
          {/* Roads */}
          <path d="M 50,0 L 50,250 M 150,0 L 150,250 M 250,0 L 250,250 M 0,60 L 300,60 M 0,140 L 300,140 M 0,210 L 300,210" stroke="#1e293b" strokeWidth="12" fill="none" opacity="0.6" />
          <path d="M 50,0 L 50,250 M 150,0 L 150,250 M 250,0 L 250,250 M 0,60 L 300,60 M 0,140 L 300,140 M 0,210 L 300,210" stroke="#10b981" strokeWidth="1" strokeDasharray="4,4" fill="none" opacity="0.4" />
          
          {/* Central Park / Green spaces */}
          <rect x="75" y="80" width="50" height="40" rx="4" fill="#047857" opacity="0.25" />
          <rect x="175" y="10" width="50" height="40" rx="4" fill="#047857" opacity="0.25" />
          
          {/* Water Body */}
          <path d="M 0,230 Q 80,220 120,250 L 0,250 Z" fill="#0284c7" opacity="0.2" />

          {/* Core Buildings / Nodes */}
          <circle cx="80" cy="30" r="4" fill="#3b82f6" opacity="0.4" />
          <circle cx="210" cy="90" r="4" fill="#3b82f6" opacity="0.4" />
          <circle cx="90" cy="180" r="4" fill="#3b82f6" opacity="0.4" />
          <circle cx="200" cy="180" r="4" fill="#3b82f6" opacity="0.4" />
        </svg>

        {/* Selected Map Pin */}
        <div
          className="absolute -translate-x-1/2 -translate-y-full transition-all duration-300 ease-out pointer-events-none"
          style={{ left: `${(pinPos.x / 300) * 100}%`, top: `${(pinPos.y / 250) * 100}%` }}
        >
          {/* Glowing pulse rings */}
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-8 w-8 bg-emerald-500/20"></span>
          </span>
          <MapPin className="w-8 h-8 text-emerald-500 filter drop-shadow-[0_0_8px_#10b981] relative z-10" />
        </div>

        {/* Helpful Tip Overlay */}
        <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 py-1 px-2 rounded border border-emerald-500/20 text-[10px] text-emerald-400 select-none">
          Click anywhere on the radar map to select coordinates
        </div>
      </div>
    </div>
  );
};

export default MapSelector;
