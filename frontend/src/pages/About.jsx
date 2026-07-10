import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { Leaf, ShieldCheck, Award, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const About = () => {
  const { theme } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { 
        duration: 0.95, 
        ease: [0.16, 1, 0.3, 1] 
      }
    }
  };

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-16 relative overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'text-white' : 'text-slate-900'
    }`}>
      {/* 3D Parallax Background Blobs */}
      <div className="absolute top-1/4 left-1/10 w-80 h-80 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full bg-blue-500/10 blur-[130px] pointer-events-none" />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto flex flex-col items-center gap-4 z-10"
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2 shadow shadow-emerald-500/5 border border-emerald-500/10">
          <Leaf className="w-7 h-7 fill-emerald-500/5 animate-pulse" />
        </div>
        <h1 className={`text-4xl sm:text-6xl font-black tracking-tight leading-tight ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}>
          We Are On A Mission To <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent filter drop-shadow-[0_0_15px_rgba(52,211,153,0.15)]">
            Eliminate Local Waste
          </span>
        </h1>
        <p className={`text-base sm:text-lg leading-relaxed max-w-2xl mt-2 ${
          theme === 'dark' ? 'text-gray-400' : 'text-slate-550'
        }`}>
          ShareBite is a decentralized surplus food donation network, connecting commercial kitchens, hotels, and households directly to registered charity shelters and distribution NGOs.
        </p>
      </motion.div>

      {/* Vision & Core pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-6 z-10">
        <motion.div
          initial={{ opacity: 0, x: -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-6"
        >
          <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">
            <Sparkles className="w-3.5 h-3.5" /> Our Vision
          </div>
          <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            Streamlining Food Reclamation <br />Through Smart Geolocation
          </h2>
          <p className={`text-sm sm:text-base leading-relaxed ${
            theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
          }`}>
            By integrating smart mapping routing and automated notification alerts, we bridge the gap between surplus waste providers and local food collection centers.
          </p>

          <div className="flex flex-col gap-5 mt-2">
            {[
              {
                icon: <ShieldCheck className="w-5.5 h-5.5" />,
                title: "Safety & Compliance Auditing",
                text: "Donors must self-certify food safety quality metrics upon creating donation posts."
              },
              {
                icon: <Award className="w-5.5 h-5.5" />,
                title: "Realtime Matching Dispatch",
                text: "Geospatial routes notify matching regional drivers and NGOs within seconds."
              }
            ].map((pillar, idx) => (
              <div key={idx} className="flex gap-4.5 items-start">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mt-0.5 text-emerald-400 shadow shadow-emerald-500/5">
                  {pillar.icon}
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{pillar.title}</h4>
                  <p className={`text-xs leading-relaxed mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>{pillar.text}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 3D Image Card with hover lifts */}
        <motion.div
          initial={{ opacity: 0, x: 35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-80 sm:h-[420px] rounded-[28px] overflow-hidden border border-slate-800 bg-slate-950/20 shadow-2xl card-hover-3d cursor-pointer"
        >
          <img
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=70"
            alt="Food donation distribution helper volunteers"
            className="w-full h-full object-cover select-none opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/10 to-transparent flex items-end p-8">
            <p className="text-white text-sm font-semibold max-w-sm drop-shadow-md leading-relaxed">
              "Connecting surplus bounty with families in need. Every delivery is a seed of hope."
            </p>
          </div>
        </motion.div>
      </div>

      {/* Call to Action Reveal */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={containerVariants}
        className="mt-6 text-center z-10"
      >
        <motion.div variants={itemVariants}>
          <GlassCard className="p-10 border-slate-800 bg-gradient-to-r from-emerald-500/10 to-blue-500/5 shadow-2xl flex flex-col items-center gap-5" glowColor="emerald">
            <h3 className={`text-2xl sm:text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Ready to make a difference?</h3>
            <p className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
              Create your account today as a Food Donor, Volunteer Transporter, or distribution NGO.
            </p>
            <div className="flex gap-4 mt-2">
              <Link to="/register" className="bg-emerald-500 hover:bg-emerald-600 btn-3d-emerald text-white text-xs sm:text-sm font-bold py-3 px-8 rounded-xl flex items-center gap-1.5 shadow shadow-emerald-500/10 cursor-pointer">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default About;
