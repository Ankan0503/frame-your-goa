import React from 'react';
import { UploadFrame } from './UploadFrame';

interface HeroSectionProps {
  onCreateClick?: () => void;
  onCreateTeamClick?: () => void;
  onFileSelect?: (file: File) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onCreateClick, onCreateTeamClick, onFileSelect }) => {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-[40px] pt-8 sm:pt-10 lg:pt-6 pb-16 lg:pb-8 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-10 xl:gap-12 bg-[#F6F0E3] relative z-10">
      {/* Content wrapper taking up left ~48% on desktop */}
      <div className="w-full lg:w-[48%] max-w-[560px] flex flex-col items-start text-left">
        {/* 1. MAIN HEADLINE */}
        <h1
          className="font-['Calistoga',serif] font-normal uppercase text-[clamp(3.25rem,10vw,5.5rem)] leading-[0.92] tracking-[-0.015em] select-none"
          aria-label="Frame Your Goa"
        >
          <span className="block text-[#0B6839]">FRAME</span>
          <span className="block text-[#0B6839]">YOUR</span>
          <span className="block text-[#F05A68]">GOA.</span>
        </h1>

        {/* 2. DECORATIVE OCEAN WAVE DRAWING */}
        <div className="mt-1 mb-4">
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

        {/* 3. DESCRIPTION & CREATE BUTTONS */}
        <div className="w-full flex flex-col items-start gap-3 mb-6 sm:mb-8">
          <p className="font-mono font-normal text-[16px] sm:text-[18px] text-[#173F32] leading-[1.55] tracking-[0.01em]">
            Turn any photo into your HH Goa 2026 Builder ID or ready-to-use Profile Picture Frame.
          </p>

          <div className="w-full flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onCreateClick}
              className="h-[50px] px-8 bg-[#075B3A] text-[#F6F0E3] rounded-full font-['Oswald'] font-bold text-[15px] sm:text-[16px] uppercase tracking-[0.04em] flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(7,91,58,0.2)] hover:shadow-[0_12px_24px_rgba(7,91,58,0.35)] hover:bg-[#0B6839] hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 focus:outline-none"
            >
              <span>CREATE BUILDER ID</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <button
              type="button"
              onClick={onCreateTeamClick}
              className="h-[50px] px-8 bg-[#F2A900] text-[#173F32] rounded-full font-['Oswald'] font-bold text-[15px] sm:text-[16px] uppercase tracking-[0.04em] flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(242,169,0,0.2)] hover:shadow-[0_12px_24px_rgba(242,169,0,0.35)] hover:bg-[#ffb400] hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 focus:outline-none"
            >
              <span>CREATE TEAM FRAME</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>

        {/* 4. THREE BENEFITS */}
        <div className="w-full grid grid-cols-1 min-[380px]:grid-cols-3 gap-5 min-[380px]:gap-3 sm:gap-6 mb-4 sm:mb-6">
          {/* INSTANT */}
          <div className="flex flex-row min-[380px]:flex-col items-center min-[380px]:items-start gap-3 min-[380px]:gap-0">
            <div className="w-[40px] h-[40px] rounded-full border-[1.5px] border-[#F05A68] flex items-center justify-center mb-2.5 text-[#F05A68]">
              {/* Lightning Bolt Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-['Oswald'] font-semibold uppercase text-[14px] sm:text-[15px] tracking-[0.02em] text-[#173F32] leading-tight mb-1">INSTANT</h3>
              <p className="font-mono text-[12px] sm:text-[13px] text-[#173F32] leading-[1.55]">Ready in<span className="hidden min-[380px]:inline"><br /></span> seconds</p>
            </div>
          </div>

          {/* DOWNLOAD */}
          <div className="flex flex-row min-[380px]:flex-col items-center min-[380px]:items-start gap-3 min-[380px]:gap-0">
            <div className="w-[40px] h-[40px] rounded-full border-[1.5px] border-[#F2A900] flex items-center justify-center mb-2.5 text-[#F2A900]">
              {/* Download Tray Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div>
              <h3 className="font-['Oswald'] font-semibold uppercase text-[14px] sm:text-[15px] tracking-[0.02em] text-[#173F32] leading-tight mb-1">DOWNLOAD</h3>
              <p className="font-mono text-[12px] sm:text-[13px] text-[#173F32] leading-[1.55]">High quality<span className="hidden min-[380px]:inline"><br /></span> image</p>
            </div>
          </div>

          {/* SHARE TO X */}
          <div className="flex flex-row min-[380px]:flex-col items-center min-[380px]:items-start gap-3 min-[380px]:gap-0">
            <div className="w-[40px] h-[40px] rounded-full border-[1.5px] border-[#6B9142] flex items-center justify-center mb-2.5 text-[#6B9142]">
              {/* Upward / Share Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </div>
            <div>
              <h3 className="font-['Oswald'] font-semibold uppercase text-[14px] sm:text-[15px] tracking-[0.02em] text-[#173F32] leading-tight mb-1">SHARE TO X</h3>
              <p className="font-mono text-[12px] sm:text-[13px] text-[#173F32] leading-[1.55]">1-click<span className="hidden min-[380px]:inline"><br /></span> share</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Upload Card Zone */}
      <div className="w-full lg:w-auto flex justify-center lg:justify-end shrink-0 mt-4 sm:mt-8 lg:mt-0 lg:translate-y-6 lg:-translate-x-12">
        <UploadFrame onFileSelect={onFileSelect} />
      </div>
    </section>
  );
};
