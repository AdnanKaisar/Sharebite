import React, { useState, useEffect } from 'react';
import { Truck, Home, Building2, MapPin } from 'lucide-react';

export const MapRoute = ({ donorCoords, ngoCoords, status, liveCourierCoords }) => {
  const [percent, setPercent] = useState(0);

  // Default coordinates if not provided (Manhattan points)
  const donor = donorCoords || { lat: 40.73061, lng: -73.935242 };
  const ngo = ngoCoords || { lat: 40.758896, lng: -73.98513 };

  // Calculate mock distance
  const dx = (ngo.lng - donor.lng) * 85; // approx km per degree longitude
  const dy = (ngo.lat - donor.lat) * 111; // approx km per degree latitude
  const distance = Math.sqrt(dx * dx + dy * dy).toFixed(1);
  const durationMin = Math.round(distance * 6); // 6 mins per km

  useEffect(() => {
    let animId;
    if (status === 'assigned') {
      // Volunteer heading to donor: oscillate between 0 and 20%
      setPercent(15);
    } else if (status === 'picked_up') {
      // Food picked up and moving: animate volunteer along path
      const start = Date.now();
      const run = () => {
        const elapsed = Date.now() - start;
        const p = Math.min(90, 20 + (elapsed / 100)); // Animate up to 90%
        setPercent(p);
        if (p < 90) {
          animId = requestAnimationFrame(run);
        }
      };
      animId = requestAnimationFrame(run);
    } else if (status === 'delivered') {
      setPercent(100);
    } else {
      setPercent(0);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [status]);

  // SVG dimensions
  const width = 300;
  const height = 180;

  // Pin coordinate layouts
  const p1 = { x: 50, y: 130 }; // Donor
  const p2 = { x: 250, y: 50 }; // NGO
  
  // Midpoint path curve (bezier)
  const pathData = `M ${p1.x} ${p1.y} Q 150 150, ${p2.x} ${p2.y}`;

  // Find a point along a quadratic bezier curve for the truck position
  const getBezierPoint = (t, p0, p1, p2) => {
    const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
    return { x, y };
  };

  const tVal = percent / 100;
  const truckPos = getBezierPoint(tVal, p1, { x: 150, y: 150 }, p2);

  // Convert live GPS coordinates to SVG pixel coordinates
  let courierPos = null;
  if (liveCourierCoords && liveCourierCoords.lat && liveCourierCoords.lng) {
    const x = Math.max(15, Math.min(285, Math.round((liveCourierCoords.lng - (-74.05)) * (300 / 0.1))));
    const y = Math.max(15, Math.min(165, Math.round((40.80 - liveCourierCoords.lat) * (180 / 0.1))));
    courierPos = { x, y };
  }

  const getStatusText = () => {
    switch (status) {
      case 'accepted': return 'Claimed. Waiting for Volunteer.';
      case 'assigned': return 'Volunteer accepted. Heading to Donor.';
      case 'picked_up': return 'Food collected! En route to NGO.';
      case 'delivered': return 'Successfully Delivered!';
      default: return 'Listing active';
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full bg-slate-900/50 p-4 rounded-xl border border-blue-500/20">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-400 font-semibold uppercase tracking-wider">Live Delivery Route</span>
        <span className="text-blue-400 font-bold">{distance} km ({durationMin} mins)</span>
      </div>

      <div className="relative w-full rounded-lg overflow-hidden bg-slate-950/80 border border-slate-800" style={{ height: `${height}px` }}>
        {/* Simple grid lines background */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none opacity-10">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="border-t border-l border-blue-400 w-full h-full"></div>
          ))}
        </div>

        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${width} ${height}`}>
          {/* Path Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#1e293b"
            strokeWidth="4"
          />
          <path
            id="route-path"
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeDasharray="6,4"
            className={status === 'picked_up' || status === 'assigned' ? 'animate-[dash_1s_linear_infinite]' : ''}
            style={{
              strokeDashoffset: status === 'picked_up' ? 20 : 0
            }}
          />

          {/* Donor Pin */}
          <g transform={`translate(${p1.x - 12}, ${p1.y - 24})`}>
            <circle cx="12" cy="12" r="16" fill="rgba(16, 185, 129, 0.1)" />
            <circle cx="12" cy="12" r="12" fill="rgba(16, 185, 129, 0.2)" />
            <Home className="w-6 h-6 text-emerald-400 filter drop-shadow-[0_0_4px_#10b981]" />
          </g>

          {/* NGO Pin */}
          <g transform={`translate(${p2.x - 12}, ${p2.y - 24})`}>
            <circle cx="12" cy="12" r="16" fill="rgba(139, 92, 246, 0.1)" />
            <circle cx="12" cy="12" r="12" fill="rgba(139, 92, 246, 0.2)" />
            <Building2 className="w-6 h-6 text-purple-400 filter drop-shadow-[0_0_4px_#8b5cf6]" />
          </g>

          {/* Moving Volunteer / Truck */}
          {courierPos ? (
            <g transform={`translate(${courierPos.x - 10}, ${courierPos.y - 10})`}>
              <circle cx="10" cy="10" r="14" fill="rgba(16, 185, 129, 0.3)" className="animate-ping" />
              <circle cx="10" cy="10" r="10" fill="#10b981" />
              <Truck className="w-3.5 h-3.5 text-white absolute top-1.5 left-1.5" />
            </g>
          ) : (
            percent > 0 && percent < 100 && (
              <g transform={`translate(${truckPos.x - 10}, ${truckPos.y - 10})`}>
                <circle cx="10" cy="10" r="12" fill="rgba(59, 130, 246, 0.3)" className="animate-ping" />
                <circle cx="10" cy="10" r="10" fill="#3b82f6" />
                <Truck className="w-3.5 h-3.5 text-white absolute top-1 left-1.5" />
              </g>
            )
          )}

          {/* Success Marker if complete */}
          {percent === 100 && (
            <g transform={`translate(${p2.x - 6}, ${p2.y + 10})`}>
              <circle cx="6" cy="6" r="8" fill="#10b981" />
              <path d="M3 6 l2 2 l4 -4" stroke="white" strokeWidth="1.5" fill="none" />
            </g>
          )}
        </svg>

        {/* Floating details */}
        <div className="absolute top-2 left-2 bg-slate-900/90 py-0.5 px-2 rounded border border-slate-700 text-[10px] text-gray-300">
          Start: {donor.lat.toFixed(4)}, {donor.lng.toFixed(4)}
        </div>
        <div className="absolute bottom-2 right-2 bg-slate-900/90 py-0.5 px-2 rounded border border-slate-700 text-[10px] text-gray-300">
          Dest: {ngo.lat.toFixed(4)}, {ngo.lng.toFixed(4)}
        </div>
      </div>

      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-400">Status: <strong className="text-white">{getStatusText()}</strong></span>
        {status === 'picked_up' && (
          <span className="text-emerald-400 animate-pulse font-bold">{percent.toFixed(0)}% Completed</span>
        )}
      </div>
    </div>
  );
};

export default MapRoute;
