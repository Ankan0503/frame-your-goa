import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowUp, Camera, Image as ImageIcon } from 'lucide-react';
import { imageUploadMessages, type ImageUploadError } from '../types/image';

interface CreateUploadPanelProps {
  isProcessing: boolean;
  error: ImageUploadError | null;
  onFileSelect: (file: File) => void;
  onBack: () => void;
}

export function CreateUploadPanel({ isProcessing, error, onFileSelect, onBack }: CreateUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const chooseFile = () => inputRef.current?.click();

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <section className="w-full max-w-[1100px] mx-auto px-4 sm:px-10 pt-7 sm:pt-10 pb-16 relative z-10">
      <button
        onClick={onBack}
        type="button"
        className="inline-flex items-center gap-2 px-3 py-2 -ml-3 rounded-full font-mono text-xs sm:text-sm font-semibold text-[#075B3A] hover:bg-[#075B3A]/10 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> BACK HOME
      </button>

      <div className="mt-7 sm:mt-10 grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-14 items-center">
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-[#075B3A] font-bold">HH GOA 2026</p>
          <h1 className="mt-3 font-['Calistoga',serif] uppercase text-[clamp(2.8rem,10vw,5.5rem)] leading-[0.94] text-[#0B6839]">
            Builder ID<br /><span className="text-[#F05A68]">Generator.</span>
          </h1>
          <div className="mt-5 w-28 h-[2px] bg-[#6B9142] rounded-full" />
          <p className="mt-6 max-w-sm font-mono text-sm sm:text-base leading-relaxed text-[#173F32]/85">
            Bring one good photo. We’ll keep the original intact and prepare it for your Goa Builder ID.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 sm:-inset-5 border border-[#6B9142]/30 rounded-[26px] -rotate-2 pointer-events-none" />
          <div
            role="button"
            tabIndex={0}
            onClick={chooseFile}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') chooseFile(); }}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => { event.preventDefault(); setIsDragging(false); handleFiles(event.dataTransfer.files); }}
            className={`relative min-h-[390px] sm:min-h-[470px] rounded-[22px] border-2 p-5 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
              isDragging ? 'border-[#F05A68] bg-[#FFF1EF]' : 'border-dashed border-[#173F32]/70 bg-[#F8F2E6] hover:border-[#0B6839] hover:bg-[#FAF4E9]'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif"
              className="sr-only"
              onChange={(event) => handleFiles(event.target.files)}
            />

            {isProcessing ? (
              <div className="flex flex-col items-center animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full border-[3px] border-[#075B3A]/20 border-t-[#075B3A] animate-spin" />
                <p className="mt-7 font-['Oswald'] text-2xl uppercase text-[#173F32]">Framing your Goa</p>
                <p className="mt-2 font-mono text-xs text-[#173F32]/70">Reading your photo…</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-[#075B3A] text-[#F6F0E3] flex items-center justify-center shadow-lg">
                  <ArrowUp className="w-7 h-7" />
                </div>
                <p className="mt-7 font-['Oswald'] text-[clamp(1.55rem,5vw,2.2rem)] leading-none uppercase text-[#173F32]">
                  Drop your photo here
                </p>
                <p className="mt-4 font-['Caveat'] text-xl text-[#6B9142]">or</p>
                <button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); chooseFile(); }}
                  className="mt-4 min-h-12 px-6 rounded-md bg-[#075B3A] text-[#F6F0E3] font-['Oswald'] text-base uppercase tracking-wide flex items-center gap-2 hover:bg-[#0B6839] transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" /> Choose photo
                </button>
                <div className="mt-8 pt-5 border-t border-[#173F32]/15 w-full max-w-sm flex justify-between gap-4 font-mono text-[10px] sm:text-xs tracking-wide text-[#173F32]/65">
                  <span>JPG / PNG / HEIC</span>
                  <span>MAX 15MB</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[#173F32]/55 font-mono text-[10px]">
                  <Camera className="w-3.5 h-3.5" /> Camera or photo library
                </div>
              </>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-5 px-4 py-3 rounded-md bg-[#F05A68]/10 border border-[#F05A68]/30 font-mono text-xs sm:text-sm text-[#173F32]">
              {imageUploadMessages[error]}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
