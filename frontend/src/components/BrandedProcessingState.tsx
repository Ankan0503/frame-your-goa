import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Scan, Layers, CheckCircle2 } from 'lucide-react';

export type ProcessingStep = 'READING SIGNAL' | 'FRAMING BUILDER' | 'FINALIZING ID';

interface BrandedProcessingStateProps {
  currentStep?: ProcessingStep;
  progressPercent?: number;
  message?: string;
  className?: string;
}

const STEPS: { key: ProcessingStep; label: string; sub: string }[] = [
  { key: 'READING SIGNAL', label: 'READING SIGNAL', sub: 'Decoding photo & face geometry' },
  { key: 'FRAMING BUILDER', label: 'FRAMING BUILDER', sub: 'Calculating smart crop focus' },
  { key: 'FINALIZING ID', label: 'FINALIZING ID', sub: 'Rendering high-res HH Goa pass' },
];

export const BrandedProcessingState: React.FC<BrandedProcessingStateProps> = ({
  currentStep = 'READING SIGNAL',
  progressPercent,
  message,
  className = '',
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  useEffect(() => {
    const idx = STEPS.findIndex((s) => s.key === currentStep);
    if (idx !== -1) {
      setActiveStepIndex(idx);
    }
  }, [currentStep]);

  // Auto-progress simulated steps if fixed step isn't passed continuously
  useEffect(() => {
    const timer1 = setTimeout(() => setActiveStepIndex((prev) => Math.max(prev, 1)), 600);
    const timer2 = setTimeout(() => setActiveStepIndex((prev) => Math.max(prev, 2)), 1400);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const currentInfo = STEPS[activeStepIndex] || STEPS[0];

  return (
    <div
      className={`w-full bg-[#173F32] text-[#F6F0E3] border-2 border-[#075B3A] rounded-[20px] p-6 shadow-xl relative overflow-hidden flex flex-col items-center text-center ${className}`}
    >
      {/* Background Decorative Accent */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#F2A900]/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#F05A68]/10 rounded-full blur-xl pointer-events-none" />

      {/* TOP BRAND BADGE */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F2A900] text-[#173F32] font-mono font-bold text-[11px] uppercase tracking-wider rounded-full mb-4 shadow-xs">
        <Sparkles className="w-3.5 h-3.5" />
        <span>HH GOA 2026 GRAPHIC ENGINE</span>
      </div>

      {/* STEP DISPLAY */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentInfo.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-1.5 mb-5"
        >
          <div className="font-['Calistoga',serif] text-[26px] sm:text-[32px] text-[#F2A900] uppercase tracking-wide leading-tight flex items-center gap-2">
            <span>{currentInfo.label}</span>
          </div>
          <p className="font-mono text-[12px] sm:text-[13px] text-[#F6F0E3]/80">
            {message || currentInfo.sub}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* STEP PROGRESS INDICATORS */}
      <div className="w-full max-w-[360px] grid grid-cols-3 gap-2 mb-4">
        {STEPS.map((step, idx) => {
          const isDone = idx < activeStepIndex;
          const isCurrent = idx === activeStepIndex;

          return (
            <div key={step.key} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-full h-2 rounded-full transition-all duration-300 ${
                  isDone
                    ? 'bg-[#00FF9D]'
                    : isCurrent
                    ? 'bg-[#F2A900] animate-pulse'
                    : 'bg-[#F6F0E3]/20'
                }`}
              />
              <span
                className={`font-mono text-[9px] uppercase tracking-tight ${
                  isCurrent ? 'text-[#F2A900] font-bold' : isDone ? 'text-[#00FF9D]' : 'text-[#F6F0E3]/40'
                }`}
              >
                {step.key.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* MINT SCANNER BAR */}
      <div className="w-full h-1 bg-[#F6F0E3]/10 rounded-full overflow-hidden relative">
        <motion.div
          className="h-full bg-gradient-to-r from-[#F2A900] via-[#00FF9D] to-[#F05A68] rounded-full"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        />
      </div>

      <div className="mt-3 font-mono text-[10px] text-[#F6F0E3]/60 uppercase tracking-widest">
        NEAR-INSTANT SUB-3s PIPELINE ACTIVE
      </div>
    </div>
  );
};
