import Spline from '@splinetool/react-spline';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <main className="relative w-full h-screen bg-[#141414] overflow-hidden">
      {/* Spline Background */}
      <div className="absolute inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/qVaK3ySslreosKQF/scene.splinecode" 
        />
      </div>

      {/* Get Started Button at the Bottom */}
      <div className="absolute bottom-12 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="pointer-events-auto"
        >
          <button
            onClick={onGetStarted}
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-mono text-sm uppercase tracking-[0.2em] overflow-hidden transition-all hover:pr-14 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            <span className="relative z-10">Get Started</span>
            <ArrowRight className="absolute right-6 w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0" />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-white/80 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </motion.div>
      </div>
    </main>
  );
}
