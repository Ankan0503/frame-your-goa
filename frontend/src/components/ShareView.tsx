import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Info,
} from 'lucide-react';
import { getShare, type ShareResponse } from '../lib/share/createShare';
import { openXIntent, DEFAULT_X_CAPTION } from '../lib/share/createXIntent';

interface ShareViewProps {
  shareId: string;
  onHomeClick: () => void;
  onCreateYourOwnClick: () => void;
}

export const ShareView: React.FC<ShareViewProps> = ({
  shareId,
  onHomeClick,
  onCreateYourOwnClick,
}) => {
  const [shareData, setShareData] = useState<ShareResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [customCaption, setCustomCaption] = useState<string>(DEFAULT_X_CAPTION);
  const [showCaptionModal, setShowCaptionModal] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getShare(shareId).then((data) => {
      if (isMounted) {
        if (data) {
          setShareData(data);
        } else {
          // Fallback share data object if id is not found
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          setShareData({
            shareId,
            shareUrl: `${origin}/share/${shareId}`,
            imageUrl: `${origin}/api/share/image/${shareId}.png`,
            title: 'HH Goa 2026 Builder Pass',
            description: 'Official Hacker House Goa 2026 Pass. See you in Goa! #FrameInGoa',
            createdAt: new Date().toISOString(),
          });
        }
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [shareId]);

  const handleDownload = () => {
    if (!shareData) return;
    const link = document.createElement('a');
    link.href = shareData.imageUrl;
    link.download = `hhgoa-2026-pass-${shareId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    if (!shareData) return;
    navigator.clipboard.writeText(shareData.shareUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleShareToX = () => {
    if (!shareData) return;
    openXIntent({
      text: customCaption,
      url: shareData.shareUrl,
    });
    setShowCaptionModal(false);
  };

  return (
    <section className="w-full max-w-[1200px] mx-auto px-4 sm:px-[40px] pt-6 sm:pt-8 pb-16 relative z-10">
      {/* 1. TOP BACK BUTTON */}
      <motion.button
        type="button"
        onClick={onHomeClick}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.96 }}
        className="inline-flex items-center gap-2 font-mono font-semibold text-[14px] text-[#075B3A] hover:text-[#0B6839] px-3 py-1.5 -ml-3 rounded-full transition-colors cursor-pointer mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO HOME</span>
      </motion.button>

      {/* 2. HEADING */}
      <div className="mb-8 text-left">
        <div className="inline-block px-3 py-1 bg-[#F2A900] text-[#173F32] font-mono font-bold text-[11px] uppercase tracking-wider rounded-md mb-2">
          OFFICIAL HH GOA 2026 PASS
        </div>

        <h1 className="font-['Calistoga',serif] uppercase text-[38px] sm:text-[56px] text-[#173F32] leading-[1.0] tracking-tight">
          BUILDER PASS <span className="text-[#F05A68]">SHOWCASE.</span>
        </h1>
        <p className="font-mono text-[14px] sm:text-[16px] text-[#123B35] mt-2">
          Shared graphics rendered for Hacker House Goa (28—31 OCT 2026).
        </p>
      </div>

      {/* 3. DISPLAY CARD & CONTROLS */}
      <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-12">
        {/* GRAPHIC IMAGE DISPLAY */}
        <div className="w-full max-w-[600px] bg-[#F8F2E6] border-4 sm:border-[8px] border-[#173F32] rounded-[24px] p-4 sm:p-6 shadow-2xl overflow-hidden relative flex flex-col items-center">
          {isLoading ? (
            <div className="w-full aspect-[3/4] bg-[#EDE5D4] rounded-[16px] flex flex-col items-center justify-center animate-pulse gap-3 text-[#173F32]/50 font-mono text-[13px]">
              <Sparkles className="w-8 h-8 animate-spin text-[#075B3A]" />
              <span>Loading graphic...</span>
            </div>
          ) : (
            <div className="w-full relative group">
              <img
                src={shareData?.imageUrl}
                alt={shareData?.title || 'HH Goa Graphic'}
                className="w-full h-auto rounded-[16px] border-2 border-[#173F32]/20 object-contain shadow-md"
                onError={(e) => {
                  // Fallback if image blob route fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="mt-3 flex items-center justify-between text-[#173F32] font-mono text-[11px]">
                <span className="font-bold">ID: {shareId}</span>
                <span className="text-[#F05A68] font-bold">#FRAMEINGOA</span>
              </div>
            </div>
          )}
        </div>

        {/* ACTIONS & CAPTION PANEL */}
        <div className="w-full max-w-[480px] bg-[#F8F2E6] border-2 border-[#173F32] rounded-[20px] p-6 shadow-md flex flex-col gap-5">
          <div className="pb-3 border-b border-[#D8CDB9] flex items-center justify-between">
            <h2 className="font-['Oswald'] font-bold text-[20px] text-[#173F32] uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#075B3A]" />
              <span>SHARE &amp; DOWNLOAD</span>
            </h2>

            <span className="px-2.5 py-0.5 bg-[#075B3A]/10 text-[#075B3A] font-mono text-[10px] font-bold rounded-full">
              VERIFIED PASS
            </span>
          </div>

          <p className="font-mono text-[13px] text-[#123B35] leading-relaxed">
            This pass is formatted for social preview on X (Twitter), Discord, and LinkedIn.
          </p>

          {/* EDITABLE CAPTION PREVIEW */}
          <div className="bg-[#F6F0E3] border border-[#173F32]/30 rounded-[12px] p-3.5 space-y-2">
            <label className="block font-mono text-[11px] font-bold text-[#173F32] uppercase">
              X (TWITTER) CAPTION
            </label>
            <textarea
              value={customCaption}
              onChange={(e) => setCustomCaption(e.target.value)}
              rows={4}
              className="w-full p-2.5 bg-[#F8F2E6] border border-[#173F32]/20 rounded-[8px] font-mono text-[12px] text-[#173F32] focus:outline-none focus:border-[#075B3A] resize-none"
            />
          </div>

          {/* MAIN SHARE BUTTONS */}
          <div className="space-y-3 pt-1">
            {/* 1-CLICK SHARE TO X */}
            <button
              type="button"
              onClick={handleShareToX}
              className="w-full h-[52px] bg-[#173F32] text-[#F6F0E3] rounded-[12px] font-['Oswald'] font-bold text-[17px] uppercase tracking-wider flex items-center justify-center gap-2.5 hover:bg-[#075B3A] transition-all cursor-pointer shadow-md"
            >
              <Share2 className="w-5 h-5 text-[#F2A900]" />
              <span>1-CLICK SHARE TO X</span>
            </button>

            {/* DOWNLOAD PASS */}
            <button
              type="button"
              onClick={handleDownload}
              className="w-full h-[50px] bg-[#075B3A] text-[#F6F0E3] rounded-[12px] font-['Oswald'] font-bold text-[16px] uppercase tracking-wider flex items-center justify-center gap-2.5 hover:bg-[#0B6839] transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-[#F2A900]" />
              <span>DOWNLOAD HIGH-RES GRAPHIC</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              {/* COPY LINK */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="h-[46px] bg-[#F6F0E3] text-[#173F32] border-2 border-[#173F32] rounded-[12px] font-['Oswald'] font-bold text-[13px] uppercase flex items-center justify-center gap-2 hover:bg-[#173F32]/5 transition-colors cursor-pointer"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-4 h-4 text-[#075B3A]" />
                    <span>COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#075B3A]" />
                    <span>COPY LINK</span>
                  </>
                )}
              </button>

              {/* CREATE YOUR OWN */}
              <button
                type="button"
                onClick={onCreateYourOwnClick}
                className="h-[46px] bg-[#F05A68] text-[#F6F0E3] rounded-[12px] font-['Oswald'] font-bold text-[13px] uppercase flex items-center justify-center gap-2 hover:bg-[#d94856] transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>CREATE YOUR OWN</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
