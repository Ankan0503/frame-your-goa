import React from 'react';
import { UploadFrame } from './UploadFrame';

interface HeroSectionProps {
  onCreateClick?: () => void;
  onFileSelect?: (file: File) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onCreateClick, onFileSelect }) => {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-[40px] pt-12 sm:pt-16 lg:pt-8 pb-16 lg:pb-4 min-h-[650px] md:min-h-[700px] lg:min-h-0 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-10 lg:gap-12 bg-[#F6F0E3] relative z-10">
      {/* Content wrapper taking up left ~48% on desktop */}
      <div className="w-full lg:w-[48%] max-w-[520px] flex flex-col items-start text-left">

        {/* 1. MAIN HEADLINE */}
        <h1
          className="font-['Calistoga',serif] font-normal uppercase text-[60px] min-[400px]:text-[72px] sm:text-[88px] lg:text-[104px] leading-[0.92] tracking-[-0.015em] select-none"
          aria-label="Frame Your Goa"
        >
          <span className="block text-[#0B6839]">FRAME</span>
          <span className="block text-[#0B6839]">YOUR</span>
          <span className="block text-[#F05A68]">GOA.</span>
        </h1>

        {/* 2. DECORATIVE OCEAN WAVE DRAWING */}
        <div className="mt-2 mb-6">
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

        {/* 3. DESCRIPTION & CREATE BUTTON */}
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          <p className="font-mono font-normal text-[17px] sm:text-[19px] text-[#173F32] leading-[1.55] tracking-[0.01em]">
            Turn any photo into your<br />
            HH Goa 2026 Builder ID.
          </p>

          <div className="flex flex-col items-start shrink-0">
            <button
              type="button"
              onClick={onCreateClick}
              className="w-full sm:w-[210px] h-[52px] bg-[#075B3A] text-[#F6F0E3] rounded-[7px] font-['Oswald'] font-semibold text-[16px] uppercase tracking-[0.025em] flex items-center justify-center gap-2 cursor-pointer hover:bg-[#0B6839] hover:-translate-y-[2px] transition-all duration-180 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#075B3A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F0E3] shadow-xs"
            >
              <span>CREATE MY FRAME</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <div className="mt-1.5 flex flex-col items-start select-none">
              <p className="font-['Caveat'] font-medium italic text-[15px] text-[#173F32] leading-[1.3]">
                No signup. No cropping. Just upload &amp; go.
              </p>
            </div>
          </div>
        </div>

        {/* 4. THREE BENEFITS */}
        <div className="w-full grid grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-10">
          {/* INSTANT */}
          <div className="flex flex-col items-start">
            <div className="w-[40px] h-[40px] rounded-full border-[1.5px] border-[#F05A68] flex items-center justify-center mb-2.5 text-[#F05A68]">
              {/* Lightning Bolt Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3 className="font-['Oswald'] font-semibold uppercase text-[14px] sm:text-[15px] tracking-[0.02em] text-[#173F32] leading-tight mb-1">
              INSTANT
            </h3>
            <p className="font-mono text-[12px] sm:text-[13px] text-[#173F32] leading-[1.55]">
              Ready in<br />seconds
            </p>
          </div>

          {/* DOWNLOAD */}
          <div className="flex flex-col items-start">
            <div className="w-[40px] h-[40px] rounded-full border-[1.5px] border-[#F2A900] flex items-center justify-center mb-2.5 text-[#F2A900]">
              {/* Download Tray Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <h3 className="font-['Oswald'] font-semibold uppercase text-[14px] sm:text-[15px] tracking-[0.02em] text-[#173F32] leading-tight mb-1">
              DOWNLOAD
            </h3>
            <p className="font-mono text-[12px] sm:text-[13px] text-[#173F32] leading-[1.55]">
              High quality<br />image
            </p>
          </div>

          {/* SHARE TO X */}
          <div className="flex flex-col items-start">
            <div className="w-[40px] h-[40px] rounded-full border-[1.5px] border-[#6B9142] flex items-center justify-center mb-2.5 text-[#6B9142]">
              {/* Upward / Share Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </div>
            <h3 className="font-['Oswald'] font-semibold uppercase text-[14px] sm:text-[15px] tracking-[0.02em] text-[#173F32] leading-tight mb-1">
              SHARE TO X
            </h3>
            <p className="font-mono text-[12px] sm:text-[13px] text-[#173F32] leading-[1.55]">
              1-click<br />share
            </p>
          </div>
        </div>

      </div>

      {/* Right Upload Card Zone */}
      <div className="w-full lg:w-auto flex justify-center lg:justify-end shrink-0 mt-10 sm:mt-14 lg:mt-16">
        <UploadFrame onFileSelect={onFileSelect} />
      </div>
    </section>
  );
};

