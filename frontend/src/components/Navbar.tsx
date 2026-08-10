import React, { useState } from 'react';
import { ArrowUpRight, X, Github, Linkedin } from 'lucide-react';

interface NavbarProps {
  onAboutClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAboutClick }) => {
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const handleAboutClick = () => {
    if (onAboutClick) {
      onAboutClick();
    } else {
      setIsAboutModalOpen(true);
    }
  };

  return (
    <>
      <header className="w-full pt-8 px-4 sm:px-[40px] max-w-[1440px] mx-auto bg-transparent relative z-20">
        <nav
          aria-label="Main Navigation"
          className="w-full flex items-start justify-between bg-transparent"
        >
          {/* LEFT: Logo & Subtle Vertical Divider & Signal Tagline */}
          <div className="flex items-center">
            {/* LOGO */}
            <a
              href="/"
              className="inline-block transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#173F32] rounded-md"
              title="Hacker House Goa 2026 Home"
            >
              <img
                src="/assets/hacker-house-goa-logo.svg"
                alt="Hacker House Goa 2026"
                className="w-[110px] sm:w-[125px] md:w-[140px] h-auto max-h-[115px] object-contain block"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.includes('/assets/hacker-house-goa-logo.svg')) {
                    target.src = '/hacker-house-goa-logo.svg';
                  } else if (!target.src.endsWith('.png')) {
                    target.src = '/assets/hacker-house-goa-logo.png';
                  }
                }}
              />
            </a>

            {/* Subtle Vertical Divider */}
            <div
              aria-hidden="true"
              className="hidden sm:block h-9 w-[1px] bg-[#173F32]/20 mx-4 md:mx-6 shrink-0"
            />

            {/* Tagline: LESS NOISE. MORE SIGNAL. */}
            <div className="hidden sm:flex flex-col font-mono font-medium text-[12px] leading-[1.25] tracking-[0.04em] text-[#173F32] select-none">
              <span>LESS NOISE.</span>
              <span className="flex items-center gap-1.5">
                MORE SIGNAL.
                <span
                  aria-hidden="true"
                  className="inline-block w-[5px] h-[5px] rounded-full bg-[#173F32] shrink-0 align-middle"
                />
              </span>
            </div>
          </div>

          {/* RIGHT: Two Navigation Buttons */}
          <div className="flex items-center gap-3 sm:gap-6 md:gap-8 shrink-0">
            {/* ABOUT US BUTTON */}
            <button
              type="button"
              onClick={handleAboutClick}
              className="h-[48px] px-3.5 sm:px-6 bg-transparent border border-[#173F32] rounded-[8px] font-mono text-[12px] sm:text-[13px] font-semibold tracking-[0.03em] text-[#173F32] hover:bg-[#173F32]/5 active:bg-[#173F32]/10 transition-colors duration-200 cursor-pointer flex items-center justify-center whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#173F32]"
            >
              ABOUT US
            </button>

            {/* VISIT HHGOA.COM BUTTON */}
            <a
              href="https://hhgoa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-[48px] px-3.5 sm:px-6 bg-[#075B3A] text-[#F6F0E3] border-none rounded-[8px] font-mono text-[12px] sm:text-[13px] font-semibold tracking-[0.03em] hover:bg-[#064a2f] active:bg-[#053d26] transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#075B3A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F0E3]"
            >
              <span>VISIT HHGOA.COM</span>
              <ArrowUpRight className="w-4 h-4 stroke-[1.5] shrink-0" aria-hidden="true" />
            </a>
          </div>
        </nav>
      </header>

      {/* ABOUT US MODAL */}
      {isAboutModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#173F32]/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsAboutModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#F6F0E3] border-2 border-[#173F32] rounded-[12px] p-6 sm:p-8 shadow-2xl relative text-[#173F32] font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsAboutModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center border border-[#173F32]/20 text-[#173F32] hover:bg-[#173F32]/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F05A68]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F4C430]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#075B3A]" />
              <span className="text-[11px] font-semibold tracking-wider text-[#173F32]/60 uppercase ml-2">
                HACKER HOUSE GOA 2026
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#173F32] mb-3">
              ABOUT US
            </h2>

            <p className="text-[13px] leading-relaxed text-[#173F32]/90 mb-6">
              We are a team of 2 from Heritage Institute of Technology, Kolkata.
            </p>

            <div className="grid grid-cols-1 gap-4 mb-6">
              {/* Ankan Giri Card */}
              <div className="bg-[#173F32]/5 border border-[#173F32]/15 rounded-[8px] p-4">
                <h3 className="font-['Oswald'] font-semibold text-[16px] text-[#173F32] mb-3">
                  Ankan Giri
                </h3>
                <div className="flex items-center gap-3">
                  <a
                    href="https://github.com/Ankan0503"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-[#173F32]/20 flex items-center justify-center text-[#173F32] hover:bg-[#173F32]/10 hover:text-[#075B3A] transition-colors"
                    aria-label="Ankan Giri GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/ankan-giri-71a34935a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-[#173F32]/20 flex items-center justify-center text-[#173F32] hover:bg-[#173F32]/10 hover:text-[#075B3A] transition-colors"
                    aria-label="Ankan Giri LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Sayan Sinha Card */}
              <div className="bg-[#173F32]/5 border border-[#173F32]/15 rounded-[8px] p-4">
                <h3 className="font-['Oswald'] font-semibold text-[16px] text-[#173F32] mb-3">
                  Sayan Sinha
                </h3>
                <div className="flex items-center gap-3">
                  <a
                    href="https://github.com/Sayan260106"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-[#173F32]/20 flex items-center justify-center text-[#173F32] hover:bg-[#173F32]/10 hover:text-[#075B3A] transition-colors"
                    aria-label="Sayan Sinha GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/sayan-sinha-300a20363"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-[#173F32]/20 flex items-center justify-center text-[#173F32] hover:bg-[#173F32]/10 hover:text-[#075B3A] transition-colors"
                    aria-label="Sayan Sinha LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsAboutModalOpen(false)}
                className="h-[40px] px-5 border border-[#173F32] rounded-[8px] text-[12px] font-semibold text-[#173F32] hover:bg-[#173F32]/5 transition-colors cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
