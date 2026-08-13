import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, SlidersHorizontal, Share2, Check, Sparkles, Image as ImageIcon, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { BuilderForm, type BuilderFormData } from './BuilderForm';
import { BuilderIdCardPreview } from './BuilderIdCardPreview';
import { generateBuilderClass } from '../lib/builder/generateBuilderClass';
import { renderIdCardToCanvas, downloadIdCardImage } from '../lib/builder/canvasExport';
import { padCanvasToLandscape } from '../lib/image/canvasUtils';
import { ShareModal } from './ShareModal';
import { BrandedProcessingState } from './BrandedProcessingState';
import {
  calculateSmartCrop,
  detectFaces,
  type DetectedFace,
  type SmartCropResult,
} from '../lib/image/smartCrop';

interface CreateIdSectionProps {
  onBack: () => void;
  initialPhotoUrl?: string;
  onFileSelect?: (file: File) => void;
}

// Default sample avatar photo for instant preview if no custom photo uploaded yet
const DEFAULT_SAMPLE_PHOTO = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000';

export const CreateIdSection: React.FC<CreateIdSectionProps> = ({
  onBack,
  initialPhotoUrl,
  onFileSelect,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string>(initialPhotoUrl || DEFAULT_SAMPLE_PHOTO);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const [isDetecting, setIsDetecting] = useState<boolean>(true);

  // Form State
  const [formData, setFormData] = useState<BuilderFormData>({
    name: 'Sayan Sinha',
    stack: 'CSE / AI / Full Stack',
    role: 'Builder',
    builderClass: 'INTELLIGENT INTERFACE BUILDER',
  });

  // Advanced Adjust Controls
  const [showAdjustPanel, setShowAdjustPanel] = useState<boolean>(false);
  const [userScale, setUserScale] = useState<number>(1.0);
  const [userOffsetX, setUserOffsetX] = useState<number>(0);
  const [userOffsetY, setUserOffsetY] = useState<number>(0);

  // Download State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [shareDataUrls, setShareDataUrls] = useState<{
    original: string;
    landscape: string;
    width: number;
    height: number;
    landscapeWidth: number;
    landscapeHeight: number;
  } | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const handleOpenShareModal = async () => {
    try {
      const canvas = await renderIdCardToCanvas({
        name: formData.name,
        stack: formData.stack,
        role: formData.role,
        builderClass: formData.builderClass,
        photoUrl,
        cropResult,
      });
      const paddedCanvas = padCanvasToLandscape(canvas);
      setShareDataUrls({
        original: canvas.toDataURL('image/png'),
        landscape: paddedCanvas.toDataURL('image/jpeg', 0.85),
        width: canvas.width,
        height: canvas.height,
        landscapeWidth: paddedCanvas.width,
        landscapeHeight: paddedCanvas.height,
      });
      setIsShareModalOpen(true);
    } catch {
      // Fallback
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update builder class on initial mount or photo change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      builderClass: generateBuilderClass({ stack: prev.stack, role: prev.role }),
    }));
  }, []);

  // Detect faces and compute dimensions whenever photoUrl changes
  useEffect(() => {
    let isMounted = true;
    setIsDetecting(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photoUrl;

    img.onload = async () => {
      if (!isMounted) return;
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      setImageDimensions({ width: w, height: h });

      try {
        const detected = await detectFaces(img);
        if (isMounted) setFaces(detected);
      } catch {
        if (isMounted) setFaces([]);
      } finally {
        if (isMounted) setIsDetecting(false);
      }
    };

    return () => {
      isMounted = false;
    };
  }, [photoUrl]);

  // Compute smart crop
  const cropResult: SmartCropResult = calculateSmartCrop({
    sourceWidth: imageDimensions?.width || 1000,
    sourceHeight: imageDimensions?.height || 1000,
    targetWidth: 600,
    targetHeight: 450,
    scale: userScale,
    position: { x: userOffsetX, y: userOffsetY },
    faces,
  });

  // Photo upload trigger
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onFileSelect) onFileSelect(file);
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
    }
  };

  const resetAdjustments = () => {
    setUserScale(1.0);
    setUserOffsetX(0);
    setUserOffsetY(0);
  };

  // Canvas export handler
  const handleExportCanvas = async () => {
    setIsExporting(true);
    try {
      await downloadIdCardImage({
        name: formData.name,
        stack: formData.stack,
        role: formData.role,
        builderClass: formData.builderClass,
        photoUrl,
        cropResult,
      });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch {
      // Fallback
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-[40px] pt-2 sm:pt-3 pb-28 lg:pb-16 relative z-10">
      
      {/* 1. BACK NAVIGATION */}
      <motion.button
        type="button"
        onClick={onBack}
        whileHover="hover"
        whileTap={{ scale: 0.96 }}
        className="group inline-flex items-center gap-2.5 font-mono font-semibold text-[14px] text-[#075B3A] hover:text-[#0B6839] hover:bg-[#075B3A]/10 px-3.5 py-2 -ml-3.5 rounded-full transition-colors duration-200 cursor-pointer mb-6 sm:mb-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#075B3A]"
      >
        <motion.span
          variants={{ hover: { x: -5 } }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="text-[16px] inline-block"
        >
          ←
        </motion.span>
        <span>BACK TO HOME</span>
      </motion.button>

      {/* 2. HEADING & TITLE */}
      <div className="mb-8 sm:mb-10 flex flex-col items-start text-left">
        <h1
          className="font-['Calistoga',serif] font-normal uppercase text-[42px] min-[400px]:text-[52px] sm:text-[68px] lg:text-[82px] leading-[0.92] tracking-[-0.015em] select-none"
          aria-label="Create Your Goa Builder ID"
        >
          <span className="block text-[#0B6839]">CREATE YOUR</span>
          <span className="block text-[#0B6839]">GOA BUILDER</span>
          <span className="block text-[#F05A68]">ID CREDENTIAL.</span>
        </h1>

        <p className="font-mono text-[15px] sm:text-[17px] text-[#123B35] mt-3 leading-relaxed max-w-2xl">
          Enter your details below. Your custom HH Goa 2026 Builder Class and official event credential will be generated automatically.
        </p>
      </div>

      {/* 3. WORKSPACE GRID (FORM ON LEFT, PREVIEW ON RIGHT) */}
      <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-between">
        
        {/* LEFT COLUMN: FORM & PHOTO UPLOAD (55%) */}
        <div className="w-full lg:w-[52%] flex flex-col gap-6">
          
          {/* PHOTO UPLOAD / SELECTION BAR */}
          <div className="w-full bg-[#F8F2E6] border-2 border-[#173F32] rounded-[20px] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#D8CDB9]">
              <h3 className="font-['Oswald'] font-bold text-[18px] sm:text-[20px] text-[#173F32] uppercase tracking-[0.02em] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#075B3A]" />
                <span>BUILDER PHOTO</span>
              </h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-[38px] px-4 bg-[#075B3A] text-[#F6F0E3] rounded-[8px] font-mono text-[12px] font-bold uppercase hover:bg-[#0B6839] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>CHANGE PHOTO</span>
              </button>
            </div>

            <p className="font-mono text-[12px] text-[#173F32]/80 leading-relaxed">
              Upload your photo or use our default builder profile picture. Automatic face detection centers your face in the credential.
            </p>
          </div>

          {/* EDITORIAL BUILDER FORM */}
          <BuilderForm formData={formData} onChange={setFormData} />

          {/* ADVANCED PHOTO ADJUSTMENTS TOGGLE */}
          <div className="w-full">
            <button
              type="button"
              onClick={() => setShowAdjustPanel(!showAdjustPanel)}
              className="w-full h-[46px] px-5 bg-[#F8F2E6] border-2 border-[#173F32] rounded-[12px] font-mono text-[13px] font-bold text-[#173F32] hover:bg-[#173F32]/5 transition-colors cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#075B3A]" />
                <span>FINE-TUNE CROP &amp; POSITION</span>
              </div>
              {showAdjustPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {showAdjustPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden mt-3"
                >
                  <div className="w-full bg-[#F8F2E6] border-2 border-[#075B3A] rounded-[16px] p-5 shadow-sm space-y-4 font-mono text-[12px] text-[#173F32]">
                    <div className="flex justify-between items-center pb-2 border-b border-[#D8CDB9]">
                      <span className="font-bold uppercase text-[#075B3A]">PHOTO CROP CONTROLS</span>
                      <button
                        type="button"
                        onClick={resetAdjustments}
                        className="text-[11px] font-bold text-[#F05A68] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        RESET
                      </button>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>ZOOM / SCALE</span>
                        <span className="font-bold">{userScale.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="2.5"
                        step="0.05"
                        value={userScale}
                        onChange={(e) => setUserScale(parseFloat(e.target.value))}
                        className="w-full accent-[#075B3A] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>HORIZONTAL OFFSET</span>
                        <span className="font-bold">{userOffsetX > 0 ? `+${userOffsetX.toFixed(2)}` : userOffsetX.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="-0.3"
                        max="0.3"
                        step="0.02"
                        value={userOffsetX}
                        onChange={(e) => setUserOffsetX(parseFloat(e.target.value))}
                        className="w-full accent-[#075B3A] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>VERTICAL OFFSET</span>
                        <span className="font-bold">{userOffsetY > 0 ? `+${userOffsetY.toFixed(2)}` : userOffsetY.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="-0.3"
                        max="0.3"
                        step="0.02"
                        value={userOffsetY}
                        onChange={(e) => setUserOffsetY(parseFloat(e.target.value))}
                        className="w-full accent-[#075B3A] cursor-pointer"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE ID CARD PREVIEW & EXPORT ACTIONS (45%) */}
        <div className="w-full lg:w-[45%] shrink-0 flex flex-col gap-6 sticky top-8">
          
          <div className="w-full bg-[#F8F2E6] border-2 border-[#173F32] rounded-[20px] p-6 shadow-sm">
            
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#D8CDB9]">
              <h3 className="font-['Oswald'] font-bold text-[20px] text-[#173F32] uppercase tracking-[0.02em] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#075B3A]" />
                <span>LIVE ID CREDENTIAL PREVIEW</span>
              </h3>

              <div className="px-2.5 py-0.5 bg-[#075B3A]/10 border border-[#075B3A]/20 rounded-full text-[10px] font-mono text-[#075B3A] font-bold">
                {isDetecting ? 'AUTOFRAMING...' : 'REALTIME SYNC'}
              </div>
            </div>

            {/* BRANDED PROCESSING ENGINE BANNER */}
            <AnimatePresence>
              {(isDetecting || isExporting) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <BrandedProcessingState
                    currentStep={
                      isExporting
                        ? 'FINALIZING ID'
                        : faces.length > 0
                        ? 'FRAMING BUILDER'
                        : 'READING SIGNAL'
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* LIVE PREVIEW COMPONENT */}
            <div className="w-full mb-6">
              <BuilderIdCardPreview
                formData={formData}
                photoUrl={photoUrl}
                cropResult={cropResult}
              />
            </div>

            {/* EXPORT / DOWNLOAD ACTION BUTTONS */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleExportCanvas}
                disabled={isExporting}
                className="btn-tactile w-full h-[52px] bg-[#075B3A] text-[#F6F0E3] border-2 border-[#173F32] rounded-[10px] font-['Oswald'] font-bold text-[17px] uppercase tracking-[0.03em] flex items-center justify-center gap-2.5 cursor-pointer hover:bg-[#0B6839] disabled:opacity-50 focus:outline-none"
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-5 h-5 text-[#F2A900]" />
                    <span>DOWNLOADED!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 text-[#F2A900]" />
                    <span>DOWNLOAD IMAGE</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenShareModal}
                className="btn-tactile w-full h-[46px] bg-[#173F32] text-[#F6F0E3] border-2 border-[#173F32] rounded-[10px] font-['Oswald'] font-bold text-[15px] uppercase tracking-[0.025em] flex items-center justify-center gap-2 hover:bg-[#075B3A] cursor-pointer focus:outline-none"
              >
                <Share2 className="w-4 h-4 text-[#F2A900]" />
                <span>SHARE TO X</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* STICKY BOTTOM ACTION BAR FOR MOBILE ONE-HANDED OPERATION */}
      <div className="mobile-action-bar lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F6F0E3]/95 backdrop-blur-md border-t-2 border-[#173F32] p-3 shadow-2xl flex items-center gap-2">
        <button
          type="button"
          onClick={handleExportCanvas}
          disabled={isExporting}
          className="btn-tactile flex-1 h-[46px] bg-[#075B3A] text-[#F6F0E3] border-2 border-[#173F32] rounded-[8px] font-['Oswald'] font-bold text-[15px] uppercase tracking-[0.02em] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-[#F2A900]" />
          <span>DOWNLOAD IMAGE</span>
        </button>

        <button
          type="button"
          onClick={handleOpenShareModal}
          className="btn-tactile h-[46px] px-4 bg-[#173F32] text-[#F6F0E3] border-2 border-[#173F32] rounded-[8px] font-['Oswald'] font-bold text-[14px] uppercase tracking-[0.02em] flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-[#F2A900]" />
          <span>SHARE TO X</span>
        </button>
      </div>

      {/* SHARE MODAL */}
      {shareDataUrls && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          imageDataUrl={shareDataUrls.original}
          landscapeDataUrl={shareDataUrls.landscape}
          width={shareDataUrls.width}
          height={shareDataUrls.height}
          landscapeWidth={shareDataUrls.landscapeWidth}
          landscapeHeight={shareDataUrls.landscapeHeight}
          title={`${formData.name} — HH Goa 2026 ${formData.builderClass} Pass`}
          description={`Official Hacker House Goa 2026 Pass for ${formData.name}. See you in Goa! #FrameInGoa`}
          type="builder"
        />
      )}

    </section>
  );
};
