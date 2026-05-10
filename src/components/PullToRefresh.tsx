import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'motion/react';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  pullLabel?: string;
  refreshLabel?: string;
}

export default function PullToRefresh({ 
  onRefresh, 
  children, 
  pullLabel = 'Pull to refresh',
  refreshLabel = 'Refreshing...'
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const y = useMotionValue(0);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  const THRESHOLD = 100;
  
  const rotate = useTransform(y, [0, THRESHOLD], [0, 180]);
  const opacity = useTransform(y, [0, 30, THRESHOLD], [0, 0.4, 1]);
  const scale = useTransform(y, [0, THRESHOLD], [0.8, 1.1]);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePan = (_: any, info: PanInfo) => {
    if (!isAtTop || isRefreshing) return;
    
    // Only apply offset if pulling down
    if (info.offset.y > 0) {
      y.set(info.offset.y * 0.4); // Resistance factor
    }
  };

  const handlePanEnd = async () => {
    const currentY = y.get();
    if (currentY >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      await controls.start({ y: 80, transition: { type: 'spring', damping: 20, stiffness: 300 } });
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        await controls.start({ y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } });
        y.set(0);
      }
    } else {
      await controls.start({ y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } });
      y.set(0);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Indicator Background */}
      <div className="absolute top-0 left-0 right-0 flex justify-center pt-10 pointer-events-none z-0">
        <motion.div 
          style={{ opacity, scale }}
          className="flex flex-col items-center gap-3"
        >
          <div className={cn(
            "w-14 h-14 rounded-[22px] flex items-center justify-center border transition-all duration-500",
            isRefreshing 
              ? "bg-accent/20 border-accent/40 shadow-[0_0_40px_rgba(16,185,129,0.3)]" 
              : "bg-white/5 border-white/10"
          )}>
            <motion.div style={{ rotate }}>
              {isRefreshing ? (
                <RefreshCw className="w-7 h-7 text-accent animate-spin" />
              ) : (
                <ArrowDown className="w-7 h-7 text-white/30" />
              )}
            </motion.div>
          </div>
          
          <motion.span 
            className="text-[10px] font-black uppercase tracking-[0.4em] text-accent/50"
          >
            {isRefreshing ? refreshLabel : pullLabel}
          </motion.span>
        </motion.div>
      </div>

      {/* Content wrapper with pan handlers */}
      <motion.div
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        animate={controls}
        style={{ y }}
        className="relative z-10 will-change-transform touch-pan-y"
      >
        <div className="pointer-events-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
