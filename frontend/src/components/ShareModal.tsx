import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  X,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { createShare, type ShareResponse } from '../lib/share/createShare';
import { openXIntent, DEFAULT_X_CAPTION } from '../lib/share/createXIntent';
import { BrandedProcessingState } from './BrandedProcessingState';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string;
  landscapeDataUrl?: string;
  title?: string;
  description?: string;
  type?: 'builder' | 'pfp' | 'team';
  width?: number;
  height?: number;
  landscapeWidth?: number;
  landscapeHeight?: number;
}



export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  imageDataUrl,
  landscapeDataUrl,
  title = 'HH Goa 2026 Builder Pass',
  description = 'Official Hacker House Goa 2026 Pass. See you in Goa! #FrameInGoa',
  type = 'builder',
  width,
  height,
  landscapeWidth,
  landscapeHeight,
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [shareData, setShareData] = useState<ShareResponse | null>(null);
  const [caption, setCaption] = useState<string>(DEFAULT_X_CAPTION);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-share-open');
      setCopySuccess(false);
    } else {
      document.body.classList.remove('modal-share-open');
    }
    return () => document.body.classList.remove('modal-share-open');
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && imageDataUrl) {
      let isMounted = true;
      setIsUploading(true);

      createShare({
        imageDataUrl,
        landscapeDataUrl,
        title,
        description,
        type: type as 'builder' | 'pfp' | 'team',
        width,
        height,
        landscapeWidth,
        landscapeHeight,
      })
        .then((res) => {
          if (isMounted) {
            setShareData(res);
            setIsUploading(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsUploading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, imageDataUrl, landscapeDataUrl, title, description, type, width, height, landscapeWidth, landscapeHeight]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!shareData) return;
    navigator.clipboard.writeText(shareData.shareUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[540px] bg-[#F8F2E6] border-4 border-[#173F32] rounded-[24px] p-6 shadow-2xl relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
      >
          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[#173F32]/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-[#173F32]" />
          </button>

          {/* HEADER */}
          <div className="flex items-center gap-3 pb-3 border-b border-[#D8CDB9]">
            <div className="w-10 h-10 rounded-full bg-[#173F32] flex items-center justify-center text-[#F2A900] shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Oswald'] font-bold text-[22px] text-[#173F32] uppercase tracking-wide leading-tight">
                SHARE TO X (TWITTER)
              </h3>
              <p className="font-mono text-[11px] text-[#075B3A] font-bold">
                HH GOA 2026 SOCIAL PREVIEW ENGINE
              </p>
            </div>
          </div>

          {/* BRANDED PROCESSING LOADING STATE */}
          {isUploading ? (
            <div className="py-4">
              <BrandedProcessingState
                currentStep="FINALIZING ID"
                message="Generating public share link & Open Graph meta tag preview"
              />
            </div>
          ) : (
            <>
              {/* IMAGE THUMBNAIL & SHARE LINK PREVIEW */}
              <div className="flex items-center gap-4 bg-[#F6F0E3] p-3 rounded-[14px] border border-[#173F32]/20">
                <img
                  src={imageDataUrl}
                  alt="Generated Pass"
                  className="w-20 h-24 object-cover rounded-lg border border-[#173F32]/30 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-['Oswald'] font-bold text-[14px] text-[#173F32] uppercase truncate">
                    {title}
                  </div>
                  <div className="font-mono text-[10px] text-[#075B3A] font-bold truncate mt-0.5">
                    {shareData?.shareUrl}
                  </div>
                  <div className="font-mono text-[10px] text-[#173F32]/60 mt-1">
                    ✓ Open Graph meta attached for X feed preview
                  </div>
                </div>
              </div>

              {/* EDITABLE CAPTION */}
              <div>
                <label className="block font-mono text-[12px] font-bold text-[#173F32] uppercase mb-1.5">
                  EDIT X CAPTION
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-[#F6F0E3] border-2 border-[#173F32] rounded-[10px] font-mono text-[13px] text-[#173F32] focus:outline-none focus:border-[#075B3A] resize-none"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (shareData) {
                      openXIntent({ text: caption, url: shareData.shareUrl });
                    }
                  }}
                  className="btn-tactile w-full h-[50px] bg-[#173F32] text-[#F6F0E3] border-2 border-[#173F32] rounded-[10px] font-['Oswald'] font-bold text-[17px] uppercase tracking-wider flex items-center justify-center gap-2.5 hover:bg-[#075B3A] cursor-pointer"
                >
                  <Share2 className="w-5 h-5 text-[#F2A900]" />
                  <span>POST ON X</span>
                </button>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="btn-tactile h-[44px] bg-[#F6F0E3] text-[#173F32] border-2 border-[#173F32] rounded-[8px] font-['Oswald'] font-bold text-[13px] uppercase flex items-center justify-center gap-2 hover:bg-[#173F32]/5 cursor-pointer"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-4 h-4 text-[#075B3A]" />
                        <span>COPIED LINK!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-[#075B3A]" />
                        <span>COPY LINK</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>,
    document.body
  );
};
