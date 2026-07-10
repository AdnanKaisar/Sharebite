import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export const ParallaxBackground = () => {
  const { theme } = useAuth();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track cursor position to shift blobs relative to mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Map cursor displacement to a subtle translation of up to 25px
      const x = (e.clientX / window.innerWidth - 0.5) * 35;
      const y = (e.clientY / window.innerHeight - 0.5) * 35;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Track vertical page scroll
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001
  });

  // Calculate different scroll translations for background blobs to create depth
  const bgY1 = useTransform(smoothScrollY, [0, 2000], [0, 320]);
  const bgY2 = useTransform(smoothScrollY, [0, 2000], [0, 160]);
  const bgY3 = useTransform(smoothScrollY, [0, 2000], [0, 240]);

  // Adjust opacity dynamically depending on dark/light mode for readability
  const blobOpacity = theme === 'dark' ? 0.12 : 0.04;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Blob 1 (Emerald Glow - Top Left) */}
      <motion.div
        animate={{ x: mousePos.x * 0.8, y: mousePos.y * 0.8 }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[130px]"
        style={{
          y: bgY1,
          backgroundColor: '#10B981',
          opacity: blobOpacity,
        }}
      />

      {/* Blob 2 (Emerald Glow - Bottom Right) */}
      <motion.div
        animate={{ x: mousePos.x * -1.2, y: mousePos.y * -1.2 }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px]"
        style={{
          y: bgY2,
          backgroundColor: '#047857', // Rich dark emerald
          opacity: blobOpacity * 0.7,
        }}
      />

      {/* Blob 3 (Teal Glow - Center Left) */}
      <motion.div
        animate={{ x: mousePos.x * 0.5, y: mousePos.y * 0.5 }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        className="absolute top-[35%] left-[15%] w-[450px] h-[450px] rounded-full blur-[140px]"
        style={{
          y: bgY3,
          backgroundColor: '#0d9488', // Deep teal/mint glow
          opacity: blobOpacity * 0.6,
        }}
      />
    </div>
  );
};

export default ParallaxBackground;
