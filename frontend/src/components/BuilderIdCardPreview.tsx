import React from 'react';
import { type BuilderFormData } from './BuilderForm';
import { type SmartCropResult } from '../lib/image/smartCrop';
import { type PfpStyle, type AspectRatio } from '../lib/pfp/pfpCanvasExport';
import { Palmtree } from 'lucide-react';

interface BuilderIdCardPreviewProps {
  formData: BuilderFormData;
  photoUrl: string;
  cropResult?: SmartCropResult;
  pfpStyle?: PfpStyle;
  pfpRatio?: AspectRatio;
}

export const BuilderIdCardPreview: React.FC<BuilderIdCardPreviewProps> = ({
  formData,
  photoUrl,
  cropResult,
  pfpStyle = 'signal',
}) => {
  const builderIdCode = 'HHG26-7F4A3B';

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* 3D FLOATING ID PASS CARD */}
      <div
        id="builder-id-preview-card"
        className="bg-[#FAF6EE] rounded-[24px] p-4 sm:p-5 relative overflow-hidden transition-all duration-300 border border-[#E0D8C8] flex flex-col justify-between"
        style={{
          width: '100%',
          maxWidth: '720px',
          aspectRatio: '1.42 / 1',
          boxShadow: '0 20px 45px rgba(23, 63, 50, 0.16), 0 8px 20px rgba(0, 0, 0, 0.07)',
        }}
      >
        {/* TEXTURED PAPER OVERLAY */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#173F32_1px,transparent_1px)] [background-size:12px_12px]" />

        {/* TOP RIGHT BACKGROUND ARTWORK: RED SUN, CHURCH & PAINT STROKES */}
        <div className="absolute top-0 right-0 w-[55%] h-[55%] pointer-events-none overflow-hidden rounded-tr-[24px] z-0">
          {/* Yellow Paint Stroke Background */}
          <div className="absolute top-3 right-1 w-44 h-16 bg-[#F2A900]/25 rounded-full blur-md transform rotate-[-12deg]" />
          
          {/* Red Setting Sun */}
          <div className="absolute top-1 right-20 w-16 h-16 rounded-full bg-[#E53935]" />

          {/* White Goa Cathedral */}
          <img
            src="/assets/goa-cathedral-top-bell-transparent.avif"
            alt="Goa Cathedral"
            className="absolute top-0 right-2 w-28 sm:w-34 h-auto object-contain drop-shadow-md opacity-90"
          />
        </div>

        {/* TOP LEFT HEADER: LOGO & YEAR */}
        <div className="relative z-10 flex items-start gap-4 mb-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-['Calistoga',serif] font-bold text-[22px] sm:text-[26px] text-[#173F32] leading-none tracking-tight">
                HACKER
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-['Calistoga',serif] font-bold text-[14px] sm:text-[16px] text-[#F05A68] leading-none tracking-wider">
                गोवा
              </span>
              <span className="font-['Calistoga',serif] font-bold text-[22px] sm:text-[26px] text-[#173F32] leading-none tracking-tight">
                HOUSE
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start ml-2">
            <span className="font-mono text-[12px] font-bold text-[#173F32] tracking-widest">
              GOA
            </span>
            <span className="font-mono text-[18px] font-extrabold text-[#F05A68] leading-none">
              2026
            </span>
          </div>
        </div>

        {/* MAIN CARD BODY: 2 COLUMNS (PHOTO ON LEFT, DETAILS ON RIGHT) */}
        <div className="relative z-10 flex items-start gap-4 sm:gap-6 flex-1">
          
          {/* LEFT: USER PHOTO IN DASHED BORDER */}
          <div className="w-[135px] sm:w-[160px] shrink-0 flex flex-col items-center">
            <div className={`w-full aspect-[4/5] bg-[#EDE5D4] rounded-[18px] p-1 border-2 overflow-hidden relative shadow-inner ${
              pfpStyle === 'signal' ? 'border-[#075B3A]' : pfpStyle === 'builder' ? 'border-[#173F32]' : pfpStyle === 'goa' ? 'border-[#F05A68]' : 'border-[#22C55E]'
            }`}>
              <img
                src={photoUrl}
                alt="Builder Avatar"
                className="w-full h-full object-cover rounded-[14px]"
                style={cropResult?.transform.cssStyle || { objectFit: 'cover' }}
              />

              {/* PFP FRAME BADGE OVERLAY */}
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded font-mono text-[8px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 z-10 text-white bg-[#075B3A]">
                {pfpStyle === 'signal' && <span className="text-[#F2A900]">HHG26</span>}
                {pfpStyle === 'builder' && <span className="text-[#F6F0E3]">BUILDER</span>}
                {pfpStyle === 'goa' && <span className="text-[#F2A900]">GOA '26</span>}
                {pfpStyle === 'nightshift' && <span className="text-[#4ADE80]">NIGHTS</span>}
              </div>
            </div>

            {/* QR CODE & NAME UNDER PHOTO */}
            <div className="w-full mt-2 flex items-center gap-2">
              {/* QR Code */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white p-1 rounded-md border border-[#173F32]/20 shrink-0 shadow-xs">
                <svg viewBox="0 0 24 24" className="w-full h-full text-[#173F32]" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm9-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h2v2h-2v-2zm-4 0h2v2h-2v-2zm2 4h2v2h-2v-2zm2-2h2v2h-2v-2zm0 4h2v2h-2v-2zm-4 0h2v2h-2v-2z" />
                </svg>
              </div>

              {/* Name & Subtitle */}
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-[8px] sm:text-[9px] font-bold text-[#075B3A] uppercase tracking-wider leading-none">
                  BUILDER
                </span>
                <span className="font-['Oswald'] font-bold text-[13px] sm:text-[15px] text-[#173F32] uppercase truncate leading-tight mt-0.5">
                  {formData.name || 'ANKAN GIRI'}
                </span>
                <span className="font-mono text-[8px] sm:text-[9px] font-bold text-[#F05A68] tracking-tight uppercase truncate leading-none mt-0.5">
                  READY TO BUILD
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: BUILDER ID & PASS TYPE DETAILS */}
          <div className="flex-1 flex flex-col pt-0 sm:pt-1 relative z-10 min-w-0">
            
            {/* BUILDER ID CODE */}
            <div className="mb-1.5">
              <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#075B3A] uppercase tracking-wider block">
                BUILDER ID
              </span>
              <span className="font-mono font-extrabold text-[22px] sm:text-[28px] text-[#F05A68] tracking-tight leading-none">
                {builderIdCode}
              </span>
            </div>

            {/* DASHED SEPARATOR */}
            <div className="w-full border-b border-dashed border-[#173F32]/30 my-1.5" />

            {/* PASS TYPE */}
            <div className="mb-2">
              <span className="font-mono text-[9px] sm:text-[10px] font-bold text-[#173F32]/70 uppercase tracking-wider block mb-0.5">
                PASS TYPE
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#075B3A] text-[#F6F0E3] rounded-[6px] font-mono text-[11px] sm:text-[12px] font-bold uppercase shadow-xs">
                <span>{formData.role || 'BUILDER'}</span>
                <Palmtree className="w-3.5 h-3.5 text-[#F2A900]" />
              </div>
            </div>

            {/* TECH STACK BADGE */}
            {formData.stack && (
              <div className="mb-2">
                <span className="font-mono text-[9px] sm:text-[10px] font-bold text-[#173F32]/70 uppercase tracking-wider block mb-0.5">
                  TECH STACK
                </span>
                <span className="font-['Oswald'] font-bold text-[12px] sm:text-[13px] text-[#173F32] uppercase tracking-wide bg-[#EDE5D4] px-2.5 py-0.5 rounded-[4px] border border-[#173F32]/20 inline-block truncate max-w-full">
                  {formData.stack}
                </span>
              </div>
            )}

            {/* SCOOTER ARTWORK OVERLAY */}
            <div className="absolute bottom-[-10px] right-[-10px] pointer-events-none z-0">
              <img
                src="/assets/goa-scooter.avif"
                alt="Goa Scooter"
                className="w-24 sm:w-32 h-auto object-contain drop-shadow-md"
              />
            </div>

            {/* HIBISCUS FLOWER OVERLAY */}
            <div className="absolute bottom-[-18px] right-[-18px] pointer-events-none z-0">
              <img
                src="/assets/hibiscus-flower-leaves.avif"
                alt="Hibiscus Flower"
                className="w-14 sm:w-18 h-auto object-contain drop-shadow-lg"
              />
            </div>
          </div>

        </div>
      </div>

      {/* SLIDER DOTS BELOW CARD */}
      <div className="flex items-center justify-center gap-2 mt-1">
        <span className="w-2.5 h-2.5 rounded-full bg-[#075B3A]" />
        <span className="w-2 h-2 rounded-full bg-[#173F32]/20" />
        <span className="w-2 h-2 rounded-full bg-[#173F32]/20" />
        <span className="w-2 h-2 rounded-full bg-[#173F32]/20" />
        <span className="w-2 h-2 rounded-full bg-[#173F32]/20" />
      </div>
    </div>
  );
};

