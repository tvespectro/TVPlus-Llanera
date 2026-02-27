import React from 'react';
import { motion } from 'motion/react';
import { Tv } from 'lucide-react';

interface WelcomePageProps {
  onFinish: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onFinish }) => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[200] bg-[#000d1a] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative flex flex-col items-center gap-4">
        {/* App Name - Fade from Right to Left */}
        <motion.h1 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-bold tracking-tighter text-white font-serif italic"
        >
          Llanera TV+
        </motion.h1>

        {/* Logo - Fade from Left to Right, positioned below the name */}
        <motion.div 
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-2xl"
        >
          <div className="bg-brand p-2 rounded-lg shadow-lg">
            <Tv className="w-8 h-8 text-white" />
          </div>
          <span className="text-xl font-bold tracking-widest text-blue-100">PREMIUM STREAMING</span>
        </motion.div>
      </div>

      {/* Enter Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        onClick={onFinish}
        className="mt-16 px-10 py-4 bg-white text-[#000d1a] font-bold rounded-full hover:scale-105 transition-transform shadow-xl hover:bg-blue-50"
      >
        COMENZAR AHORA
      </motion.button>

      {/* Decorative lines */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-50" />
    </motion.div>
  );
};
