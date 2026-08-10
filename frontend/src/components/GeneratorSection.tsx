import React from 'react';
import { motion } from 'motion/react';

interface GeneratorSectionProps {
  uploadedImageUrl: string;
  onBackToUpload: () => void;
}

export const GeneratorSection: React.FC<GeneratorSectionProps> = ({
  uploadedImageUrl,
  onBackToUpload,
}) => {
  return (
    <section
      className="w-full max-w-[1400px] mx-auto px-4 sm:px-[40px] pt-6 sm:pt-8 pb-16 relative z-10"
    >
      {/* 1. BACK NAVIGATION WITH HOVER ANIMATION */}
      <motion.button
        type="button"
        onClick={onBackToUpload}
        whileHover="hover"
        whileTap={{ scale: 0.96 }}
        className="group inline-flex items-center gap-2.5 font-mono font-semibold text-[14px] text-[#075B3A] hover:text-[#0B6839] hover:bg-[#075B3A]/10 px-3.5 py-2 -ml-3.5 rounded-full transition-colors duration-200 cursor-pointer mb-6 sm:mb-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#075B3A]"
      >
        <motion.span
          variants={{
            hover: { x: -5 },
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="text-[16px] inline-block"
        >
          ←
        </motion.span>
        <span>BACK TO UPLOAD</span>
      </motion.button>

      {/* 2. HEADING & SUBHEADING (ALL DEVICES - LEFT SIDE) */}
      <div className="mb-8 sm:mb-10 flex flex-col items-start text-left">
        <h1
          className="font-['Calistoga',serif] font-normal uppercase text-[48px] min-[400px]:text-[56px] sm:text-[72px] lg:text-[88px] leading-[0.92] tracking-[-0.015em] select-none"
          aria-label="Your Goa Frame Is Ready"
        >
          <span className="block text-[#0B6839]">YOUR GOA</span>
          <span className="block text-[#0B6839]">FRAME</span>
          <span className="block text-[#F05A68]">IS READY.</span>
        </h1>

        {/* DECORATIVE OCEAN WAVE DRAWING */}
        <div className="mt-3 mb-5">
          <svg
            width="170"
            height="55"
            viewBox="0 0 170 55"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block overflow-visible"
            aria-hidden="true"
          >
            {/* Main Ocean Wave Line Art matching reference image */}
            <path
              d="M 5 32 C 18 36, 32 32, 48 24 C 64 16, 78 7, 92 7 C 102 7, 108 11, 102 18 C 96 25, 87 28, 92 33 C 98 38, 115 35, 128 27 C 137 21, 142 19, 145 22 C 141 24, 139 27, 142 29 C 146 31, 152 29, 158 31 C 162 32, 166 31, 170 32"
              stroke="#6B9142"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Inner barrel / trough curve */}
            <path
              d="M 40 33 C 50 28, 62 26, 70 29 C 78 32, 73 37, 68 39 C 63 41, 62 36, 68 32"
              stroke="#6B9142"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Minor trailing ripple line at bottom right */}
            <path
              d="M 148 35 C 154 33, 160 36, 168 35"
              stroke="#6B9142"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <p className="font-mono text-[16px] sm:text-[18px] text-[#123B35] mt-1 leading-relaxed">
          “Your photo is ready. Let’s make it Goa.”
        </p>
      </div>

      {/* 3. TWO-COLUMN WORKSPACE LAYOUT */}
      <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-between">

        {/* LEFT COLUMN: UPLOADED PHOTO PREVIEW (approx 60%) */}
        <div className="w-full lg:w-[60%] flex flex-col items-start">
          <div
            className="w-full bg-[#F8F2E6] border border-[#D8CDB9] rounded-[18px] p-4 sm:p-6 sm:p-7 relative shadow-xs"
            style={{
              boxShadow: '0 12px 28px rgba(23, 63, 50, 0.06)',
            }}
          >
            {/* CARD HEADER */}
            <div className="flex items-center justify-between w-full mb-4 sm:mb-5 pb-3 border-b border-[#D8CDB9]/70">
              <h2 className="font-['Oswald'] font-semibold text-[18px] sm:text-[20px] text-[#173F32] uppercase tracking-[0.02em] flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#075B3A] inline-block shrink-0" />
                <span>UPLOADED PHOTO</span>
              </h2>
              <span className="font-mono text-[11px] sm:text-[12px] font-medium text-[#173F32]/70 uppercase tracking-wider">
                ORIGINAL PRESERVED
              </span>
            </div>

            {/* PREVIEW IMAGE CONTAINER */}
            <div className="w-full min-h-[320px] sm:min-h-[420px] lg:min-h-[480px] bg-[#EDE5D4]/50 rounded-[14px] border border-[#D8CDB9]/80 p-3 sm:p-5 flex items-center justify-center overflow-hidden">
              <img
                src={uploadedImageUrl}
                alt="Uploaded user photo"
                className="max-h-[480px] sm:max-h-[540px] w-full h-auto object-contain rounded-[10px] shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TEMPORARY CONFIGURATION PANEL (approx 40%) */}
        <div className="w-full lg:w-[38%] shrink-0 flex flex-col items-start gap-8">

          <div
            className="w-full bg-[#F8F2E6] border border-[#D8CDB9] rounded-[18px] p-5 sm:p-7 shadow-xs"
            style={{
              boxShadow: '0 12px 28px rgba(23, 63, 50, 0.06)',
            }}
          >
            <h2 className="font-['Oswald'] font-semibold text-[22px] sm:text-[26px] text-[#173F32] uppercase tracking-[0.02em] mb-1">
              BUILD YOUR ID
            </h2>
            <p className="font-mono text-[14px] sm:text-[15px] text-[#123B35] mb-6">
              “Choose your Goa vibe next.”
            </p>

            {/* PLACEHOLDER AREA */}
            <div className="w-full bg-[#FAF4E9] border-2 border-dashed border-[#0B6839]/35 rounded-[15px] p-6 sm:p-8 text-center flex flex-col items-center justify-center gap-3.5 min-h-[260px]">
              <div className="w-12 h-12 rounded-full bg-[#075B3A]/10 text-[#075B3A] flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <p className="font-mono text-[13px] sm:text-[14px] text-[#173F32]/80 leading-relaxed max-w-[280px]">
                Theme selection and Builder ID customization controls will be available here.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
