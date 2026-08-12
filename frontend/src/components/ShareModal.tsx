import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  X,
  Share2,
  Copy,
  Check,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { createShare, type ShareResponse } from '../lib/share/createShare';
import { openXIntent, DEFAULT_X_CAPTION } from '../lib/share/createXIntent';
import { BrandedProcessingState } from './BrandedProcessingState';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string;
  title?: string;
  description?: string;
  type?: 'builder' | 'pfp' | 'team';
}

type PostState = 'idle' | 'authorizing' | 'posted' | 'error';

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  imageDataUrl,
  title = 'HH Goa 2026 Builder Pass',
  description = 'Official Hacker House Goa 2026 Pass. See you in Goa! #FrameInGoa',
  type = 'builder',
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [shareData, setShareData] = useState<ShareResponse | null>(null);
  const [caption, setCaption] = useState<string>(DEFAULT_X_CAPTION);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [postState, setPostState] = useState<PostState>('idle');
  const [tweetUrl, setTweetUrl] = useState<string>('');
  const [postError, setPostError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-share-open');
      setPostState('idle');
      setPostError('');
      setTweetUrl('');
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
        title,
        description,
        type: type as 'builder' | 'pfp' | 'team',
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
  }, [isOpen, imageDataUrl, title, description, type]);

  useEffect(() => {
    const onXPostMessage = (e: MessageEvent) => {
      if (!e.data || e.data.type !== 'X_POST_RESULT') return;
      if (e.data.status === 'success') {
        setTweetUrl(e.data.tweetUrl || '');
        setPostState('posted');
      } else {
        setPostError(e.data.message || 'Failed to post to X');
        setPostState('error');
      }
    };
    window.addEventListener('message', onXPostMessage);
    return () => window.removeEventListener('message', onXPostMessage);
  }, []);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!shareData) return;
    navigator.clipboard.writeText(shareData.shareUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handlePostToX = async () => {
    if (!shareData) return;
    setPostState('authorizing');
    setPostError('');
    setTweetUrl('');

    try {
      const res = await fetch('/api/x/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId: shareData.shareId, caption }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Could not start X authorization');
      }

      const { authorizeUrl } = await res.json();
      const width = 600;
      const height = 680;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      window.open(
        authorizeUrl,
        'post_to_x',
        `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
      );
    } catch (err: any) {
      // Fall back to classic intent if the media-posting API is unavailable
      openXIntent({ text: caption, url: shareData.shareUrl });
      setPostState('error');
      setPostError(
        err?.message || 'Media posting unavailable — opened classic share instead'
      );
    }
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
                {postState === 'posted' ? (
                  <div className="bg-[#075B3A]/10 border-2 border-[#075B3A] rounded-[12px] p-4 flex flex-col items-center gap-3 text-center">
                    <Check className="w-8 h-8 text-[#075B3A]" />
                    <div>
                      <div className="font-['Oswald'] font-bold text-[18px] text-[#173F32] uppercase">
                        POSTED TO X!
                      </div>
                      <div className="font-mono text-[12px] text-[#123B35] mt-1">
                        Your builder pass is live with the attached image.
                      </div>
                    </div>
                    {tweetUrl && (
                      <a
                        href={tweetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-tactile w-full h-[46px] bg-[#173F32] text-[#F6F0E3] rounded-[10px] font-['Oswald'] font-bold text-[14px] uppercase flex items-center justify-center gap-2 hover:bg-[#075B3A] cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-[#F2A900]" />
                        <span>VIEW TWEET</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn-tactile w-full h-[44px] bg-[#F6F0E3] text-[#173F32] border-2 border-[#173F32] rounded-[8px] font-['Oswald'] font-bold text-[13px] uppercase hover:bg-[#173F32]/5 cursor-pointer"
                    >
                      DONE
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handlePostToX}
                      disabled={postState === 'authorizing'}
                      className="btn-tactile w-full h-[50px] bg-[#173F32] text-[#F6F0E3] border-2 border-[#173F32] rounded-[10px] font-['Oswald'] font-bold text-[17px] uppercase tracking-wider flex items-center justify-center gap-2.5 hover:bg-[#075B3A] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {postState === 'authorizing' ? (
                        <>
                          <Loader2 className="w-5 h-5 text-[#F2A900] animate-spin" />
                          <span>CONNECTING TO X...</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-5 h-5 text-[#F2A900]" />
                          <span>POST ON X NOW</span>
                        </>
                      )}
                    </button>

                    {postState === 'error' && (
                      <div className="bg-[#F05A68]/10 border border-[#F05A68] rounded-[10px] px-3 py-2 font-mono text-[11px] text-[#173F32]">
                        {postError}
                      </div>
                    )}
                  </>
                )}

                {postState !== 'posted' && (
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
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>,
    document.body
  );
};
