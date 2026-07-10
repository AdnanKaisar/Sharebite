import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, ShieldCheck, HeartHandshake, Truck, Users, Activity, Leaf, CheckCircle, Package, Building, FileText, PlusCircle, Handshake, MessageSquare, CheckSquare, MapPin } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';

export const Landing = () => {
  const { theme } = useAuth();
  const { scrollY } = useScroll();

  // Track global mouse position to drive interactive 3D camera angles
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Offset coordinates centered around screen center (range: -20 to 20)
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth scroll progress using spring physics for a premium, heavy cinematic feel
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 70,
    damping: 22,
    restDelta: 0.001
  });

  // Parallax transform mapping:
  // 1. Slow-moving background elements (moving down relative to scroll to stay in viewport longer)
  const bgBlobY1 = useTransform(smoothScrollY, [0, 1000], [0, 160]);
  const bgBlobY2 = useTransform(smoothScrollY, [0, 1000], [0, 90]);

  // 2. Realistic 3D Background Plate (Scrolls slowly and fades out)
  const bgPlateY = useTransform(smoothScrollY, [0, 800], [0, 130]);
  const basePlateOpacity = theme === 'dark' ? 0.38 : 0.22;
  const bgPlateOpacity = useTransform(smoothScrollY, [0, 500], [basePlateOpacity, 0]);

  // 3. Main hero text and CTA moves up slightly and fades out
  const heroY = useTransform(smoothScrollY, [0, 600], [0, -70]);
  const heroOpacity = useTransform(smoothScrollY, [0, 500], [1, 0]);

  // 4. Fast-moving foreground elements (moving up faster than scroll to create fake 3D depth)
  const fgWidgetY1 = useTransform(smoothScrollY, [0, 1000], [0, -280]);
  const fgWidgetY2 = useTransform(smoothScrollY, [0, 1000], [0, -200]);
  const fgWidgetY3 = useTransform(smoothScrollY, [0, 1000], [0, -140]);
  const fgWidgetOpacity = useTransform(smoothScrollY, [0, 450], [1, 0]);

  // Fine-tuned animation variants for scroll-based reveals (0.8s - 1.1s timings)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.18,
        delayChildren: 0.05
      }
    }
  };

  const revealVariants = {
    hidden: { y: 55, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.95, 
        ease: [0.16, 1, 0.3, 1] // Custom easeOutExpo curve for elegant deceleration
      } 
    }
  };

  const scaleRevealVariants = {
    hidden: { scale: 0.92, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { 
        duration: 1.1, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    }
  };

  return (
    <div className={`relative min-h-screen pt-16 overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-transparent text-white' : 'bg-transparent text-slate-900'
    }`}>
      {/* 3D Parallax Background Blobs */}
      <motion.div 
        style={{ y: bgBlobY1 }}
        className={`absolute top-1/4 left-1/10 w-96 h-96 rounded-full blur-[100px] pointer-events-none ${
          theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-500/5'
        }`}
      />
      <motion.div 
        style={{ y: bgBlobY2 }}
        className={`absolute top-1/3 right-1/10 w-80 h-80 rounded-full blur-[100px] pointer-events-none ${
          theme === 'dark' ? 'bg-teal-500/10' : 'bg-teal-500/5'
        }`}
      />
      
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36 flex flex-col items-center text-center">
        {/* Realistic 3D Background Photo Card (Tilts with cursor, scrolls with parallax) */}
        <motion.div
          style={{ y: bgPlateY, opacity: bgPlateOpacity }}
          className="absolute top-16 sm:top-8 left-1/2 transform -translate-x-1/2 w-[98%] max-w-6xl h-[520px] sm:h-[680px] pointer-events-none z-0 px-2"
        >
          <div 
            className={`w-full h-full rounded-[32px] overflow-hidden border transition-all duration-300 relative ${
              theme === 'dark' 
                ? 'border-slate-800/40 shadow-[0_30px_70px_rgba(0,0,0,0.7)] bg-slate-950/20' 
                : 'border-slate-200/60 shadow-[0_30px_70px_rgba(0,0,0,0.08)] bg-slate-100/20'
            }`}
            style={{
              // Complex 3D matrix offset triggered by cursor position
              transform: `perspective(1000px) rotateX(${10 + mousePos.y * 0.1}deg) rotateY(${-6 + mousePos.x * 0.1}deg) scale(0.97)`,
              transformStyle: 'preserve-3d',
              transition: 'transform 0.15s ease-out'
            }}
          >
            {/* Realistic community kitchen/food donation image cover */}
            <img 
              src="https://images.unsplash.com/photo-1593113630400-ea4288922497?w=1600&auto=format&fit=crop&q=80" 
              alt="NGO Food Donation Handover" 
              className={`w-full h-full object-cover select-none transition-opacity duration-300 ${
                theme === 'dark' ? 'opacity-35' : 'opacity-20'
              }`}
            />
            
            {/* Blends card smoothly into the background grid */}
            <div className={`absolute inset-0 bg-gradient-to-b ${
              theme === 'dark'
                ? 'from-transparent via-black/35 to-black'
                : 'from-transparent via-white/35 to-white'
            }`} />
            
            {/* Extra inner 3D layer (floats in front of image inside card) */}
            <div 
              className="absolute inset-0 flex flex-col justify-end items-center sm:items-start p-6 sm:p-10 text-center sm:text-left"
              style={{ transform: 'translateZ(25px)' }}
            >
              <span className="text-[9px] uppercase font-black text-emerald-400 tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full w-fit mb-3">
                NGO Handover Network
              </span>
              <h3 className={`text-lg sm:text-xl font-extrabold max-w-sm leading-snug ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Bridging food resources with local shelters
              </h3>
            </div>
          </div>
        </motion.div>

        {/* Floating 3D Foreground Elements - Hidden on small/mid viewports to maintain clean responsiveness */}
        
        {/* Widget 1: Left Matching Alert (Fast Parallax) */}
        <motion.div
          style={{ y: fgWidgetY1, opacity: fgWidgetOpacity }}
          className="hidden lg:block absolute left-[-4%] xl:left-[2%] 2xl:left-[6%] top-72 w-60 pointer-events-none z-20"
        >
          <GlassCard className="p-3 border-emerald-500/20 shadow-[0_8px_32px_rgba(16,185,129,0.12)] rotate-[-4deg]" glowColor="emerald">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[9px] uppercase font-black text-emerald-400 tracking-wider">Live Match Completed</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold">Vite Cafe ➔ Metro Shelter</p>
              <p className="text-[10px] text-gray-400 mt-0.5">12kg hot meals dispatched safely</p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Widget 2: Right Stats Widget (Medium Parallax) */}
        <motion.div
          style={{ y: fgWidgetY2, opacity: fgWidgetOpacity }}
          className="hidden lg:block absolute right-[-4%] xl:right-[2%] 2xl:right-[6%] top-64 w-56 pointer-events-none z-20"
        >
          <GlassCard className="p-3.5 border-blue-500/20 shadow-[0_8px_32px_rgba(59,130,246,0.12)] rotate-[3deg]" glowColor="blue">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Leaf className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-extrabold text-emerald-400">14,820 kg</h4>
                <p className="text-[9px] text-gray-400">Total surplus food routed</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Widget 3: Bottom Right Volunteer Card (Slow Parallax) */}
        <motion.div
          style={{ y: fgWidgetY3, opacity: fgWidgetOpacity }}
          className="hidden xl:block absolute right-[2%] 2xl:right-[8%] top-[460px] w-52 pointer-events-none z-20"
        >
          <GlassCard className="p-3 border-purple-500/20 shadow-[0_8px_32px_rgba(139,92,246,0.12)] rotate-[-2deg]" glowColor="purple">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <div className="text-left">
                <p className="text-[10px] font-bold">42 Volunteers Active</p>
                <p className="text-[9px] text-gray-400">Near Anantnag, J&K</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Main Hero Elements (Parallax Controlled) */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className={`flex flex-col items-center z-10 relative ${
            theme === 'dark' ? 'filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.85)]' : ''
          }`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[11px] font-extrabold uppercase tracking-widest mb-8 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Reducing Food Waste, Empowering Communities
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl font-black tracking-tighter max-w-4xl leading-[1.05]"
          >
            Bridging the Gap Between{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(52,211,153,0.15)]">
              Excess Food
            </span>{' '}
            and Families In Need
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-base sm:text-xl text-gray-400 max-w-3xl leading-relaxed"
          >
            ShareBite connects restaurants, individuals, NGOs, and volunteers to seamlessly donate, distribute, and collect surplus food. Let's make hunger history together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto z-30"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-10 rounded-xl btn-3d-emerald text-base group"
            >
              Join as Partner
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              to="/listings"
              className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-800 hover:border-slate-700 bg-slate-950/20 hover:bg-slate-900/30 text-gray-300 hover:text-white font-semibold py-4 px-10 rounded-xl backdrop-blur-sm btn-3d-slate text-base"
            >
              Browse Active Donations
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Action Cards Section (Yes We Can!) */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Yes We Can!</h2>
          <div className="w-16 h-1 bg-emerald-500 rounded-full mt-3"></div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl"
        >
          {/* Card 1: Donate Food */}
          <motion.div variants={revealVariants}>
            <GlassCard className="p-8 flex flex-col items-center text-center min-h-[350px] justify-between border-slate-200/60 shadow-lg hover:border-emerald-500/30 transition-all duration-300" glowColor="emerald">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6 shadow-sm">
                  <Package className="w-6 h-6" /> 
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Donate Food</h3>
                <p className="text-sm text-gray-500 leading-relaxed px-2">
                  You can donate food and we are here to distribute the food to the ones who have the need for that.
                </p>
              </div>
              <Link 
                to="/register" 
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl btn-3d-emerald text-sm transition-all duration-300"
              >
                Donate
              </Link>
            </GlassCard>
          </motion.div>

          {/* Card 2: Join as NGO */}
          <motion.div variants={revealVariants}>
            <GlassCard className="p-8 flex flex-col items-center text-center min-h-[350px] justify-between border-slate-200/60 shadow-lg hover:border-emerald-500/30 transition-all duration-300" glowColor="emerald">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6 shadow-sm">
                  <Building className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Join as NGO</h3>
                <p className="text-sm text-gray-500 leading-relaxed px-2">
                  Verified NGOs can request available donations, collect food, and distribute it to people in need.
                </p>
              </div>
              <Link 
                to="/register" 
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl btn-3d-emerald text-sm transition-all duration-300"
              >
                Register NGO
              </Link>
            </GlassCard>
          </motion.div>

          {/* Card 3: Request Food */}
          <motion.div variants={revealVariants}>
            <GlassCard className="p-8 flex flex-col items-center text-center min-h-[350px] justify-between border-slate-200/60 shadow-lg hover:border-emerald-500/30 transition-all duration-300" glowColor="emerald">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Request Food</h3>
                <p className="text-sm text-gray-500 leading-relaxed px-2">
                  You can request food, if you can feed some hungry helpless people and you are genuinely a distributor.
                </p>
              </div>
              <Link 
                to="/listings" 
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl btn-3d-emerald text-sm transition-all duration-300"
              >
                Request
              </Link>
            </GlassCard>
          </motion.div>
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">How ShareBite Works</h2>
          <p className="text-gray-400 mt-3 max-w-md mx-auto text-sm sm:text-base">
            A simple, integrated lifecycle connecting excess food directly to local distribution agencies.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full"
        >
          {[
            {
              step: '01',
              title: 'Donor Lists Food',
              desc: 'Restaurants, hotels, or households list leftover meals, specifying quantity and expiry.',
              icon: <PlusCircle className="w-5.5 h-5.5 text-emerald-500" />,
              glow: 'emerald'
            },
            {
              step: '02',
              title: 'NGO Claims Request',
              desc: 'Local verified NGOs receive location alerts and claim the food listings.',
              icon: <Handshake className="w-5.5 h-5.5 text-blue-500" />,
              glow: 'blue'
            },
            {
              step: '03',
              title: 'Volunteer Dispatched',
              desc: 'Nearby delivery volunteers accept pickup requests, route the task, and pick up.',
              icon: <Truck className="w-5.5 h-5.5 text-purple-500" />,
              glow: 'purple'
            },
            {
              step: '04',
              title: 'Safe Handover',
              desc: 'QR codes are scanned to confirm safe pickup and delivery handover to the NGO.',
              icon: <CheckSquare className="w-5.5 h-5.5 text-emerald-500" />,
              glow: 'emerald'
            }
          ].map((item, idx) => (
            <motion.div key={idx} variants={revealVariants}>
              <GlassCard className="p-6 min-h-[260px] flex flex-col justify-between border-slate-200/60 bg-white/40 shadow-lg hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group" glowColor={item.glow}>
                {/* Step badge */}
                <div className="absolute top-4 right-4 text-xs font-black uppercase tracking-wider text-slate-350 select-none group-hover:text-emerald-500 transition-colors">
                  Step {item.step}
                </div>
                
                <div className="flex flex-col gap-4 mt-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-2">{item.desc}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Key Features Grid */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Platform Capabilities</h2>
          <p className="text-gray-400 mt-3 max-w-md mx-auto text-sm">
            Engineered for speed, coordination transparency, and ecological impact.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
        >
          {[
            {
              title: "Geo-Matching",
              desc: "Locates and matches food donations instantly with NGOs within a 5-mile radius.",
              icon: <MapPin className="w-5 h-5 text-emerald-500" />,
              color: "emerald",
              bg: "bg-emerald-50 border-emerald-100"
            },
            {
              title: "QR Handover",
              desc: "Validates chain of custody at pickup and handover points via dynamic secure QR codes.",
              icon: <ShieldCheck className="w-5 h-5 text-blue-500" />,
              color: "blue",
              bg: "bg-blue-50 border-blue-100"
            },
            {
              title: "Dynamic Routing",
              desc: "Reroutes volunteers in real time based on active traffic conditions, road obstructions, and distance.",
              icon: <Truck className="w-5 h-5 text-purple-500" />,
              color: "purple",
              bg: "bg-purple-50 border-purple-100"
            },
            {
              title: "Integrated Chat",
              desc: "Enables instant direct messaging channels between donors, volunteers, and NGO representatives.",
              icon: <MessageSquare className="w-5 h-5 text-teal-500" />,
              color: "emerald",
              bg: "bg-teal-50 border-teal-100"
            }
          ].map((feat, idx) => (
            <motion.div key={idx} variants={revealVariants}>
              <GlassCard className="p-6 flex flex-col justify-between min-h-[250px] border-slate-200/60 bg-white/40 shadow-lg hover:-translate-y-1.5 hover:border-emerald-500/40 hover:shadow-emerald-500/5 transition-all duration-300 group" glowColor={feat.color}>
                <div>
                  <div className={`w-10 h-10 rounded-xl ${feat.bg} border flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                    {feat.icon}
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-base mt-4">{feat.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{feat.desc}</p>
                </div>
                <div className="w-full flex items-center justify-between mt-4">
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Protocol Active</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* NGO Partners Section */}
      <section className={`relative border-t py-24 ${
        theme === 'dark' 
          ? 'border-slate-800/40 bg-slate-950/20' 
          : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-extrabold tracking-tight">Trusted by Dynamic NGOs</h2>
            <p className="text-sm text-gray-400 mt-3">Empowering local community centers, food banks, and shelters.</p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-120px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl text-center"
          >
            {[
              'Hope Shelter Net',
              'Green Harvest Foundation',
              'Metro Food Rescue',
              'Feed The Kids Initiative'
            ].map((ngo, idx) => (
              <motion.div key={idx} variants={revealVariants}>
                <GlassCard className="py-6 flex items-center justify-center gap-3 hover:border-blue-500/40 hover:shadow-blue-500/5 transition-all duration-300" glowColor="blue">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-extrabold tracking-wide text-sm">{ngo}</span>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scaleRevealVariants}
        >
          <GlassCard className="relative overflow-hidden p-12 text-center flex flex-col items-center bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/25">
            <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to make an impact?</h2>
            <p className="text-gray-400 mt-4 max-w-lg text-sm sm:text-base leading-relaxed">
              Create an account today as a Donor, NGO, or Volunteer and join our network dedicated to routing surplus food.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link
                to="/register"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-sm"
              >
                Sign Up Now
              </Link>
              <Link
                to="/contact"
                className="border border-slate-700/50 hover:border-slate-600 text-gray-300 py-3 px-8 rounded-xl transition-all text-sm bg-slate-900/20"
              >
                Get in Touch
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
