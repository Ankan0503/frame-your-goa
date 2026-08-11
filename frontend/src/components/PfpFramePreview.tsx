import React from 'react';
import { type PfpStyle, type AspectRatio } from '../lib/pfp/pfpCanvasExport';
import { type SmartCropResult } from '../lib/image/smartCrop';
import { MapPin, Sparkles, Award } from 'lucide-react';

interface PfpFramePreviewProps {
  photoUrl: string;
  style: PfpStyle;
  aspectRatio: AspectRatio;
  cropResult?: SmartCropResult;
}

export const PfpFramePreview: React.FC<PfpFramePreviewProps> = ({
  photoUrl,
  style,
  aspectRatio,
  cropResult,
}) => {
  // Aspect ratio class selection
  const aspectClass =
    aspectRatio === '4:5'
      ? 'aspect-[4/5]'
      : aspectRatio === '16:9'
      ? 'aspect-[16/9]'
      : 'aspect-square';

  return (
    <div className="w-full max-w-[540px] mx-auto flex items-center justify-center p-2 sm:p-4">
      <div
        className={`w-full ${aspectClass} relative overflow-hidden rounded-[20px] shadow-2xl transition-all duration-300 select-none flex items-center justify-center bg-[#F6F0E3]`}
        style={{
          boxShadow: '0 20px 50px rgba(23, 63, 50, 0.15)',
        }}
      >
        {/* DOMINANT CROPPED USER PHOTO */}
        <img
          src={photoUrl}
          alt="Profile Preview"
          className="w-full h-full object-cover transition-all duration-300 ease-out"
          style={cropResult?.transform.cssStyle || { objectFit: 'cover' }}
        />

        {/* ---------------------------------------------------- */}
        {/* STYLE 01 — SIGNAL */}
        {/* ---------------------------------------------------- */}
        {style === 'signal' && (
          <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between border-[8px] sm:border-[12px] border-[#075B3A]">
            
            {/* Corner Bracket Elements */}
            <div className="absolute top-2 left-2 w-6 sm:w-10 h-6 sm:h-10 border-t-[5px] border-l-[5px] border-[#F2A900]" />
            <div className="absolute top-2 right-2 w-6 sm:w-10 h-6 sm:h-10 border-t-[5px] border-r-[5px] border-[#F2A900]" />
            <div className="absolute bottom-2 left-2 w-6 sm:w-10 h-6 sm:h-10 border-b-[5px] border-l-[5px] border-[#F2A900]" />
            <div className="absolute bottom-2 right-2 w-6 sm:w-10 h-6 sm:h-10 border-b-[5px] border-r-[5px] border-[#F2A900]" />

            {/* Top Header Badge */}
            <div className="self-start bg-[#075B3A] text-[#F2A900] px-3.5 py-1.5 rounded-md font-mono font-bold text-[12px] sm:text-[14px] tracking-wider uppercase shadow-sm">
              HH GOA 2026
            </div>

            {/* Bottom Details */}
            <div className="w-full flex items-end justify-between gap-2">
              <div className="bg-[#F6F0E3]/95 backdrop-blur-xs text-[#075B3A] px-3 py-1 rounded-md font-mono font-bold text-[10px] sm:text-[12px] shadow-xs">
                GOA, INDIA • 28—31 OCT
              </div>

              <div className="bg-[#173F32] text-[#F6F0E3] px-3.5 py-1.5 rounded-md font-['Calistoga',serif] text-[12px] sm:text-[15px] font-bold shadow-md">
                #FRAMEINGOA
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STYLE 02 — BUILDER */}
        {/* ---------------------------------------------------- */}
        {style === 'builder' && (
          <div className="absolute inset-0 pointer-events-none border-[14px] sm:border-[20px] border-[#173F32] flex flex-col justify-between p-2 sm:p-3">
            
            {/* Top Header */}
            <div className="w-full flex items-center justify-between font-mono text-[11px] sm:text-[13px] text-[#F6F0E3] font-bold">
              <span>HH GOA 2026 // BUILDER PFP</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#F05A68] animate-pulse shrink-0" />
            </div>

            {/* Bottom Metadata */}
            <div className="w-full flex items-center justify-between text-[#F6F0E3]">
              <span className="font-['Oswald'] font-semibold text-[13px] sm:text-[16px] text-[#F2A900] uppercase tracking-wide">
                GOA, INDIA • 28—31 OCT 2026
              </span>
              <span className="font-['Calistoga',serif] text-[13px] sm:text-[16px]">
                #FRAMEINGOA
              </span>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STYLE 03 — GOA */}
        {/* ---------------------------------------------------- */}
        {style === 'goa' && (
          <div className="absolute inset-0 pointer-events-none p-3 sm:p-5 flex flex-col justify-between border-[6px] sm:border-[10px] border-[#F05A68] ring-4 ring-[#F2A900]">
            
            {/* Top Sunset Badge */}
            <div className="self-center bg-[#F05A68] text-[#F6F0E3] px-4 py-1.5 rounded-full font-['Calistoga',serif] text-[14px] sm:text-[18px] shadow-md">
              HH GOA 2026
            </div>

            {/* Bottom Pill Badge */}
            <div className="w-full bg-[#075B3A] text-[#F6F0E3] px-4 py-2 rounded-full flex items-center justify-between shadow-lg">
              <span className="font-mono font-bold text-[11px] sm:text-[13px] text-[#F2A900]">
                GOA, INDIA • 28—31 OCT
              </span>
              <span className="font-['Calistoga',serif] text-[13px] sm:text-[16px] text-[#F6F0E3]">
                #FRAMEINGOA
              </span>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STYLE 04 — NIGHT SHIFT */}
        {/* ---------------------------------------------------- */}
        {style === 'nightshift' && (
          <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between border-2 sm:border-4 border-[#00FF9D] bg-gradient-to-t from-[#071610]/80 via-transparent to-[#071610]/70">
            
            {/* Top Technical Metadata */}
            <div className="w-full flex items-center justify-between font-mono text-[10px] sm:text-[12px] text-[#00FF9D] font-semibold">
              <span>+ 15.4989° N, 73.8278° E</span>
              <span>HH GOA 2026 // NIGHT SHIFT</span>
            </div>

            {/* Bottom Technical Metadata */}
            <div className="w-full flex items-center justify-between font-mono text-[10px] sm:text-[12px] text-[#00FF9D] font-semibold">
              <span>SYS.LOC // GOA, INDIA</span>
              <span className="font-['Calistoga',serif] text-[13px] sm:text-[16px]">
                #FRAMEINGOA
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
