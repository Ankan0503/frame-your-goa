import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Download, Share2, Copy, Calendar, ArrowUpRight, Image as ImageIcon, Palette, Users, Sparkles, Check, Instagram } from 'lucide-react';
import { BuilderIdCardPreview } from './BuilderIdCardPreview';
import { type BuilderFormData } from './BuilderForm';
import { ShareModal } from './ShareModal';
import {
  calculateSmartCrop,
  detectFaces,
  type DetectedFace,
  type SmartCropResult,
} from '../lib/image/smartCrop';

interface GeneratorSectionProps {
  uploadedImageUrl: string;
  onBackToUpload: () => void;
}

export const GeneratorSection: React.FC<GeneratorSectionProps> = ({
  uploadedImageUrl,
  onBackToUpload,
}) => {
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const [formData] = useState<BuilderFormData>({
    name: 'ANKAN GIRI',
    stack: 'AI / FULL STACK',
    role: 'BUILDER',
    builderClass: 'CREATIVE BUILDER',
  });

  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = uploadedImageUrl;

    img.onload = async () => {
      if (!isMounted) return;
      setImageDimensions({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      try {
        const detected = await detectFaces(img);
        if (isMounted) setFaces(detected);
      } catch {
        if (isMounted) setFaces([]);
      }
    };

    return () => { isMounted = false; };
  }, [uploadedImageUrl]);

  const cropResult: SmartCropResult = calculateSmartCrop({
    sourceWidth: imageDimensions?.width || 1000,
    sourceHeight: imageDimensions?.height || 1000,
    targetWidth: 600,
    targetHeight: 600,
    scale: 1.0,
    position: { x: 0, y: 0 },
    faces,
  });

  const handleDownloadHD = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `HHGoa-2026-Pass-${Date.now()}.png`;
      link.href = uploadedImageUrl;
      link.click();
      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 600);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 pt-2 pb-20 relative z-10">
      <img ref={imgRef} src={uploadedImageUrl} alt="" className="hidden" crossOrigin="anonymous" />

      {/* 3-COLUMN MAIN WORKSPACE GRID */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-[280px_1fr_340px] gap-8 items-start mb-16">
        
        {/* LEFT COLUMN: BACK BUTTON, TITLE, SUBTEXT & VINTAGE POSTMARK STAMP ARTWORK */}
        <div className="flex flex-col items-start text-left relative pt-2">
          
          {/* BACK TO UPLOAD BUTTON */}
          <button
            type="button"
            onClick={onBackToUpload}
            className="inline-flex items-center gap-2 font-mono text-[12px] font-bold text-[#075B3A] hover:text-[#0B6839] transition-colors cursor-pointer mb-6"
          >
            <span>← BACK TO UPLOAD</span>
          </button>

          {/* EDITORIAL DISPLAY HEADING */}
          <h1 className="font-['Calistoga',serif] font-normal uppercase text-[38px] sm:text-[46px] leading-[0.94] tracking-tight mb-3">
            <span className="block text-[#075B3A]">YOUR GOA</span>
            <span className="block text-[#075B3A]">FRAME</span>
            <span className="block text-[#F05A68]">IS READY!</span>
          </h1>

          {/* GREEN WAVE SQUIGGLE */}
          <div className="my-2">
            <svg width="120" height="24" viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 4 12 C 20 18, 40 6, 60 12 C 80 18, 100 6, 116 12" stroke="#075B3A" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <p className="font-mono text-[13px] text-[#173F32]/80 leading-relaxed max-w-[240px] mb-8">
            You're officially on the guestlist to Hacker House Goa 2026.
          </p>

          {/* DECORATIVE CIRCULAR POSTMARK STAMP & AZULEJO TILE ART */}
          <div className="relative mt-4 w-full">
            {/* Circular Postmark Stamp */}
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#173F32]/40 flex flex-col items-center justify-center rotate-[-12deg] p-2 text-center font-mono text-[9px] text-[#173F32]/70 font-bold mb-4">
              <span>MADE OF</span>
              <span className="font-['Calistoga'] text-[14px] text-[#075B3A]">GOA</span>
              <span>2026</span>
            </div>

            {/* Portuguese Azulejo Tile Grid Pattern */}
            <div className="w-32 h-32 border border-[#173F32]/20 p-1.5 grid grid-cols-2 gap-1.5 bg-[#FAF6EE] rounded-sm shadow-xs">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-full h-full border border-[#0055A5]/40 flex items-center justify-center p-1 bg-[#0055A5]/5">
                  <div className="w-full h-full border border-[#0055A5]/60 rotate-45 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#0055A5]/80" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: 3D FLOATING ID CARD PREVIEW */}
        <div className="flex flex-col items-center justify-center w-full px-2 sm:px-4">
          <BuilderIdCardPreview
            formData={formData}
            photoUrl={uploadedImageUrl}
            cropResult={cropResult}
          />
        </div>

        {/* RIGHT COLUMN: ACTION CONTROLS & WHAT'S NEXT */}
        <div className="flex flex-col gap-5 w-full">
          
          {/* TOP ACTION CARD: YOUR FRAME IS READY */}
          <div className="w-full bg-[#FAF6EE] border-2 border-[#173F32] rounded-[20px] p-5 shadow-xs flex flex-col gap-3.5">
            
            {/* BADGE HEADER */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F05A68] text-[#F6F0E3] flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-['Oswald'] font-bold text-[16px] text-[#173F32] uppercase">
                  YOUR FRAME IS READY
                </span>
                <span className="font-mono text-[11px] text-[#173F32]/70">
                  Download, share and show off your Goa spirit.
                </span>
              </div>
            </div>

            {/* DOWNLOAD HD IMAGE PRIMARY BUTTON */}
            <button
              type="button"
              onClick={handleDownloadHD}
              disabled={isDownloading}
              className="btn-tactile w-full h-[48px] bg-[#075B3A] text-[#F6F0E3] border-2 border-[#173F32] rounded-[10px] font-['Oswald'] font-bold text-[15px] uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer hover:bg-[#0B6839]"
            >
              <Download className="w-4 h-4 text-[#F2A900]" />
              <span>{downloadSuccess ? 'DOWNLOADED!' : 'DOWNLOAD HD IMAGE'}</span>
            </button>

            {/* SHARE TO X BUTTON */}
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="btn-tactile w-full h-[42px] bg-[#FAF6EE] text-[#173F32] border-2 border-[#173F32] rounded-[8px] font-mono text-[12px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer hover:bg-[#173F32]/5"
            >
              <Share2 className="w-3.5 h-3.5 text-[#075B3A]" />
              <span>SHARE TO X</span>
            </button>

            {/* SHARE TO INSTAGRAM BUTTON */}
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="btn-tactile w-full h-[42px] bg-[#FAF6EE] text-[#173F32] border-2 border-[#173F32] rounded-[8px] font-mono text-[12px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer hover:bg-[#173F32]/5"
            >
              <Instagram className="w-3.5 h-3.5 text-[#F05A68]" />
              <span>SHARE TO INSTAGRAM</span>
            </button>

            {/* COPY LINK BUTTON */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn-tactile w-full h-[42px] bg-[#FAF6EE] text-[#173F32] border-2 border-[#173F32] rounded-[8px] font-mono text-[12px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer hover:bg-[#173F32]/5"
            >
              <Copy className="w-3.5 h-3.5 text-[#075B3A]" />
              <span>{copySuccess ? 'LINK COPIED!' : 'COPY LINK'}</span>
            </button>

            {/* ADD TO CALENDAR CARD */}
            <div className="w-full bg-[#F2E8D5] border border-[#173F32]/20 rounded-[12px] p-3 mt-1 flex items-center justify-between font-mono text-[11px] text-[#173F32]">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#075B3A]" />
                <div className="flex flex-col">
                  <span className="font-bold text-[10px] text-[#075B3A] uppercase">ADD TO CALENDAR</span>
                  <span className="font-bold">28 — 31 OCT 2026</span>
                  <span className="text-[10px] text-[#173F32]/70">Goa</span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#075B3A]" />
            </div>

          </div>

          {/* BOTTOM CARD: WHAT'S NEXT */}
          <div className="w-full bg-[#FAF6EE] border-2 border-[#173F32] rounded-[20px] p-5 shadow-xs flex flex-col gap-3">
            <h3 className="font-['Oswald'] font-bold text-[15px] text-[#173F32] uppercase">
              WHAT'S NEXT?
            </h3>
            <p className="font-mono text-[11px] text-[#173F32]/70 -mt-1">
              More ways to create your Goa moment.
            </p>

            <div className="grid grid-cols-3 gap-2 mt-1">
              <button
                type="button"
                onClick={onBackToUpload}
                className="btn-tactile bg-[#F6F0E3] border border-[#173F32] rounded-[10px] p-2.5 flex flex-col items-center text-center cursor-pointer hover:bg-[#075B3A]/10"
              >
                <ImageIcon className="w-4 h-4 text-[#075B3A] mb-1" />
                <span className="font-mono text-[9px] font-bold uppercase leading-tight text-[#173F32]">
                  ANOTHER PHOTO
                </span>
              </button>

              <button
                type="button"
                onClick={onBackToUpload}
                className="btn-tactile bg-[#F6F0E3] border border-[#173F32] rounded-[10px] p-2.5 flex flex-col items-center text-center cursor-pointer hover:bg-[#075B3A]/10"
              >
                <Palette className="w-4 h-4 text-[#075B3A] mb-1" />
                <span className="font-mono text-[9px] font-bold uppercase leading-tight text-[#173F32]">
                  CHANGE STYLE
                </span>
              </button>

              <button
                type="button"
                onClick={onBackToUpload}
                className="btn-tactile bg-[#F6F0E3] border border-[#173F32] rounded-[10px] p-2.5 flex flex-col items-center text-center cursor-pointer hover:bg-[#075B3A]/10"
              >
                <Users className="w-4 h-4 text-[#075B3A] mb-1" />
                <span className="font-mono text-[9px] font-bold uppercase leading-tight text-[#173F32]">
                  GROUP FRAME
                </span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM FULL-WIDTH BANNER: PASSES YOU CAN GENERATE */}
      <div className="w-full bg-[#FAF6EE] border-2 border-[#173F32] rounded-[24px] p-6 sm:p-8 shadow-xs">
        
        {/* BANNER HEADER */}
        <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-[#173F32]/15">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-[#F05A68]" />
            <span className="w-2 h-2 rounded-full bg-[#F05A68]" />
            <span className="w-2 h-2 rounded-full bg-[#F05A68]" />
          </div>
          <h2 className="font-['Oswald'] font-bold text-[20px] sm:text-[24px] text-[#173F32] uppercase tracking-wide">
            PASSES YOU CAN GENERATE
          </h2>
        </div>

        {/* 6 PASS TYPES GRID */}
        <div className="grid grid-cols-2 min-[600px]:grid-cols-3 lg:grid-cols-6 gap-4 font-mono">
          
          {/* 1. BUILDER */}
          <div className="bg-[#F6F0E3] border border-[#173F32]/30 rounded-[12px] p-3.5 flex flex-col items-start gap-1">
            <span className="text-[22px] mb-1">🌴</span>
            <span className="font-bold text-[13px] text-[#075B3A] uppercase">BUILDER</span>
            <span className="text-[10px] text-[#173F32]/70 leading-snug">
              The classic builder ID for attendees.
            </span>
          </div>

          {/* 2. SPEAKER */}
          <div className="bg-[#F6F0E3] border border-[#173F32]/30 rounded-[12px] p-3.5 flex flex-col items-start gap-1">
            <span className="text-[22px] mb-1">🎙️</span>
            <span className="font-bold text-[13px] text-[#075B3A] uppercase">SPEAKER</span>
            <span className="text-[10px] text-[#173F32]/70 leading-snug">
              For speakers &amp; mentors.
            </span>
          </div>

          {/* 3. VOLUNTEER */}
          <div className="bg-[#F6F0E3] border border-[#173F32]/30 rounded-[12px] p-3.5 flex flex-col items-start gap-1">
            <span className="text-[22px] mb-1">🤝</span>
            <span className="font-bold text-[13px] text-[#075B3A] uppercase">VOLUNTEER</span>
            <span className="text-[10px] text-[#173F32]/70 leading-snug">
              For the backbone of the event.
            </span>
          </div>

          {/* 4. CREW */}
          <div className="bg-[#F6F0E3] border border-[#173F32]/30 rounded-[12px] p-3.5 flex flex-col items-start gap-1">
            <span className="text-[22px] mb-1">⚙️</span>
            <span className="font-bold text-[13px] text-[#075B3A] uppercase">CREW</span>
            <span className="text-[10px] text-[#173F32]/70 leading-snug">
              For the ones who make it happen.
            </span>
          </div>

          {/* 5. COMMUNITY */}
          <div className="bg-[#F6F0E3] border border-[#173F32]/30 rounded-[12px] p-3.5 flex flex-col items-start gap-1">
            <span className="text-[22px] mb-1">👥</span>
            <span className="font-bold text-[13px] text-[#075B3A] uppercase">COMMUNITY</span>
            <span className="text-[10px] text-[#173F32]/70 leading-snug">
              For our amazing community.
            </span>
          </div>

          {/* 6. VIP */}
          <div className="bg-[#F6F0E3] border border-[#173F32]/30 rounded-[12px] p-3.5 flex flex-col items-start gap-1">
            <span className="text-[22px] mb-1">👑</span>
            <span className="font-bold text-[13px] text-[#075B3A] uppercase">VIP</span>
            <span className="text-[10px] text-[#173F32]/70 leading-snug">
              Special access pass.
            </span>
          </div>

        </div>

      </div>

      {/* SHARE MODAL */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        imageDataUrl={uploadedImageUrl}
        title="Hacker House Goa 2026 Pass"
        description="I'm attending Hacker House Goa 2026! #FrameInGoa"
        type="builder"
      />
    </section>
  );
};
