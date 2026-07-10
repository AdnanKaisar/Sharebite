import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const GlassCard = ({ children, className = '', glowColor = 'emerald', delay = 0, noTilt = false }) => {
  const { theme } = useAuth();
  const cardRef = useRef(null);
  const [transformStyle, setTransformStyle] = useState('');

  const borderColors = {
    emerald: 'neon-border-emerald',
    blue: 'neon-border-blue',
    purple: 'neon-border-purple',
    red: 'neon-border-red'
  };

  const borderClass = borderColors[glowColor] || borderColors.emerald;
  const bgClass = theme === 'dark' ? 'glass-panel' : 'glass-panel-light';

  const handleMouseMove = (e) => {
    if (noTilt) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * 8; 
    const rotateY = ((x - centerX) / centerX) * 8;

    const shadowX = -rotateY * 2.5;
    const shadowY = rotateX * 2.5;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    
    const glowColors = {
      emerald: 'rgba(16, 185, 129, 0.14)',
      blue: 'rgba(59, 130, 246, 0.14)',
      purple: 'rgba(139, 92, 246, 0.14)',
      red: 'rgba(239, 68, 68, 0.14)'
    };
    const glowColorVal = glowColors[glowColor] || glowColors.emerald;
    
    card.style.boxShadow = `${shadowX}px ${shadowY}px 32px ${glowColorVal}, 0 20px 45px rgba(0, 0, 0, 0.3)`;
  };

  const handleMouseLeave = () => {
    if (noTilt) return;
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    const card = cardRef.current;
    if (card) {
      card.style.boxShadow = '';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={noTilt ? undefined : handleMouseMove}
      onMouseLeave={noTilt ? undefined : handleMouseLeave}
      className={`rounded-2xl p-6 shadow-xl ${bgClass} ${borderClass} ${className}`}
      style={{
        transform: noTilt ? undefined : transformStyle,
        transition: noTilt ? undefined : 'transform 0.18s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.18s ease',
        transformStyle: noTilt ? undefined : 'preserve-3d',
        animationDelay: `${delay}ms`
      }}
    >
      <div style={noTilt ? { height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'inherit' } : { transform: 'translateZ(20px)', transformStyle: 'preserve-3d', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'inherit' }}>
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
