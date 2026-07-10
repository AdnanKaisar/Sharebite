import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  
  // Use spring physics to smooth the scroll progress for a buttery feel
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 origin-left z-[100] shadow-[0_0_10px_rgba(16,185,129,0.5)]"
      style={{ scaleX }}
    />
  );
};

export default ScrollProgress;
