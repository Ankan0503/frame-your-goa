import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  UserPlus,
  Trash2,
  MoveUp,
  MoveDown,
  Upload,
  Users,
  Grid,
} from 'lucide-react';
import { TeamFramePreview } from './TeamFramePreview';
import {
  renderTeamFrame,
  downloadTeamFrameImage,
  type TeamMember,
  type TeamLayout,
  type MultiBuilderTeamFrameData,
} from '../lib/image/renderTeamFrame';
import { padCanvasToLandscape } from '../lib/image/canvasUtils';
import { ShareModal } from './ShareModal';
import { BrandedProcessingState } from './BrandedProcessingState';
import {
  calculateSmartCrop,
  detectFaces,
  type DetectedFace,
  type SmartCropResult,
} from '../lib/image/smartCrop';

interface CreateTeamSectionProps {
  onBack: () => void;
  initialPhotoUrl?: string;
  onFileSelect?: (file: File) => void;
}

const DEFAULT_BUILDERS: TeamMember[] = [
  {
    id: 'builder-1',
    name: 'SAYAN SINHA',
    stack: 'FULLSTACK & AI',
    role: 'TEAM LEAD',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'builder-2',
    name: 'ANANYA SHARMA',
    stack: 'SMART CONTRACTS',
    role: 'PROTOCOL ARCHITECT',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'builder-3',
    name: 'KABIR VERMA',
    stack: 'UI & MOTION',
    role: 'DESIGNER',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
  },
];

const LAYOUT_OPTIONS: { id: TeamLayout; title: string; subtitle: string }[] = [
  { id: 'layout-a', title: 'LAYOUT A', subtitle: 'Equal Column Posters' },
  { id: 'layout-b', title: 'LAYOUT B', subtitle: 'Featured Lead + Stacked Builders' },
  { id: 'layout-c', title: 'LAYOUT C', subtitle: 'Editorial Asymmetric Grid' },
];

export const CreateTeamSection: React.FC<CreateTeamSectionProps> = ({
  onBack,
  initialPhotoUrl,
}) => {
  const [teamName, setTeamName] = useState<string>('ALPHA PROTOCOL');
  const [projectName, setProjectName] = useState<string>('AI AGENT INFRA');
  const [selectedLayout, setSelectedLayout] = useState<TeamLayout>('layout-a');

  const [builders, setBuilders] = useState<TeamMember[]>(() => {
    if (initialPhotoUrl) {
      return [
        {
          id: 'builder-1',
          name: 'MY BUILDER',
          stack: 'FULLSTACK',
          role: 'CREATOR',
          photoUrl: initialPhotoUrl,
        },
        DEFAULT_BUILDERS[1],
        DEFAULT_BUILDERS[2],
      ];
    }
    return DEFAULT_BUILDERS;
  });

  // Smart crop cache map for builders
  const [cropsMap, setCropsMap] = useState<Record<string, SmartCropResult>>({});

  // Action feedback states
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
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
      const canvas = await renderTeamFrame({
        teamName,
        projectName,
        layout: selectedLayout,
        builders,
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

  // Compute smart crop for each builder photo
  useEffect(() => {
    let isMounted = true;

    builders.forEach((builder) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = builder.photoUrl;

      img.onload = async () => {
        if (!isMounted) return;
        try {
          const faces = await detectFaces(img);
          const crop = calculateSmartCrop({
            sourceWidth: img.width,
            sourceHeight: img.height,
            targetWidth: 400,
            targetHeight: 500,
            faces,
          });
          if (isMounted) {
            setCropsMap((prev) => ({ ...prev, [builder.id]: crop }));
          }
        } catch {
          // Fallback
        }
      };
    });

    return () => {
      isMounted = false;
    };
  }, [builders]);

  // Combine builder data with smart crop results
  const processedBuilders: TeamMember[] = builders.map((b) => ({
    ...b,
    cropResult: cropsMap[b.id],
  }));

  const teamData: MultiBuilderTeamFrameData = {
    teamName,
    projectName,
    layout: selectedLayout,
    builders: processedBuilders,
  };

  // Builder Management
  const addBuilder = () => {
    if (builders.length >= 3) return;
    const newId = `builder-${Date.now()}`;
    const newBuilder: TeamMember = {
      id: newId,
      name: `BUILDER 0${builders.length + 1}`,
      stack: 'ENGINEER',
      role: 'CONTRIBUTOR',
      photoUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    };
    setBuilders([...builders, newBuilder]);
  };

  const removeBuilder = (id: string) => {
    if (builders.length <= 1) return;
    setBuilders(builders.filter((b) => b.id !== id));
  };

  const moveBuilder = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= builders.length) return;

    const newArr = [...builders];
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setBuilders(newArr);
  };

  const updateBuilder = (id: string, field: keyof TeamMember, value: string) => {
    setBuilders(
      builders.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handlePhotoUploadForBuilder = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateBuilder(id, 'photoUrl', url);
    }
  };

  // Canvas Download
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadTeamFrameImage(teamData);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch {
      // Fallback
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-[40px] pt-2 sm:pt-3 pb-28 lg:pb-16 relative z-10">
      
      {/* 1. BACK BUTTON */}
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

      {/* 2. HEADING */}
      <div className="mb-8 sm:mb-10 flex flex-col items-start text-left">
        <h1
          className="font-['Calistoga',serif] font-normal uppercase text-[42px] min-[400px]:text-[52px] sm:text-[68px] lg:text-[82px] leading-[0.92] tracking-[-0.015em] select-none"
          aria-label="HH Goa Team Frame Generator"
        >
          <span className="block text-[#0B6839]">TEAM BUILDER</span>
          <span className="block text-[#0B6839]">FRAME POSTER</span>
          <span className="block text-[#F05A68]">GENERATOR.</span>
        </h1>

        <p className="font-mono text-[15px] sm:text-[17px] text-[#123B35] mt-3 leading-relaxed max-w-2xl">
          Bring up to 3 teammates into an official HH Goa 2026 poster. Customize names, roles, and layout styles in real-time.
        </p>
      </div>

      {/* 3. WORKSPACE GRID */}
      <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-between">
        
        {/* LEFT COLUMN: TEAM & BUILDER INPUTS (50%) */}
        <div className="w-full lg:w-[50%] flex flex-col gap-6">
          
          {/* TEAM DETAILS */}
          <div className="w-full bg-[#F8F2E6] border-2 border-[#173F32] rounded-[20px] p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="font-['Oswald'] font-bold text-[18px] sm:text-[20px] text-[#173F32] uppercase tracking-[0.02em] pb-2 border-b border-[#D8CDB9] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#075B3A]" />
              <span>TEAM &amp; PROJECT INFO</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] font-bold text-[#173F32] uppercase mb-1">
                  TEAM / SQUAD NAME
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. ALPHA PROTOCOL"
                  className="w-full h-[42px] px-3 bg-[#F6F0E3] border-2 border-[#173F32] rounded-[8px] font-mono text-[13px] text-[#173F32] font-semibold focus:outline-none focus:border-[#075B3A]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold text-[#173F32] uppercase mb-1">
                  PROJECT / HACK NAME
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. AI INFRA"
                  className="w-full h-[42px] px-3 bg-[#F6F0E3] border-2 border-[#173F32] rounded-[8px] font-mono text-[13px] text-[#173F32] font-semibold focus:outline-none focus:border-[#075B3A]"
                />
              </div>
            </div>
          </div>

          {/* LAYOUT SELECTOR */}
          <div className="w-full bg-[#F8F2E6] border-2 border-[#173F32] rounded-[20px] p-5 sm:p-6 shadow-xs">
            <h2 className="font-['Oswald'] font-bold text-[18px] sm:text-[20px] text-[#173F32] uppercase tracking-[0.02em] mb-4 pb-2 border-b border-[#D8CDB9] flex items-center gap-2">
              <Grid className="w-4 h-4 text-[#075B3A]" />
              <span>CHOOSE TEAM LAYOUT</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {LAYOUT_OPTIONS.map((lo) => {
                const isSelected = selectedLayout === lo.id;
                return (
                  <button
                    key={lo.id}
                    type="button"
                    onClick={() => setSelectedLayout(lo.id)}
                    className={`p-3.5 rounded-[12px] text-center transition-all cursor-pointer border-2 ${
                      isSelected
                        ? 'bg-[#075B3A] text-[#F6F0E3] border-[#173F32] shadow-sm'
                        : 'bg-[#F6F0E3] text-[#173F32] border-[#D8CDB9] hover:border-[#075B3A]'
                    }`}
                  >
                    <div className="font-['Oswald'] font-bold text-[15px] uppercase tracking-wide">
                      {lo.title}
                    </div>
                    <div
                      className={`font-mono text-[10px] mt-1 ${
                        isSelected ? 'text-[#F2A900]' : 'text-[#173F32]/60'
                      }`}
                    >
                      {lo.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* BUILDER CARDS MANAGEMENT (1-3 BUILDERS) */}
          <div className="w-full bg-[#F8F2E6] border-2 border-[#173F32] rounded-[20px] p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8CDB9]">
              <h2 className="font-['Oswald'] font-bold text-[18px] sm:text-[20px] text-[#173F32] uppercase tracking-[0.02em]">
                TEAM BUILDERS ({builders.length}/3)
              </h2>

              <button
                type="button"
                onClick={addBuilder}
                disabled={builders.length >= 3}
                className="h-[38px] px-3.5 bg-[#F2A900] text-[#173F32] border border-[#173F32] rounded-[8px] font-mono text-[11px] font-bold uppercase hover:bg-[#e09b00] disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ ADD BUILDER</span>
              </button>
            </div>

            {/* BUILDERS LIST */}
            <div className="space-y-4">
              {builders.map((b, idx) => (
                <div
                  key={b.id}
                  className="bg-[#F6F0E3] border-2 border-[#173F32] rounded-[16px] p-4 relative shadow-xs"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#D8CDB9]">
                    <span className="font-['Oswald'] font-bold text-[14px] text-[#075B3A] uppercase tracking-wide">
                      BUILDER 0{idx + 1}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Move Up */}
                      <button
                        type="button"
                        onClick={() => moveBuilder(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 hover:bg-[#173F32]/10 rounded-md disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5 text-[#173F32]" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        onClick={() => moveBuilder(idx, 'down')}
                        disabled={idx === builders.length - 1}
                        className="p-1.5 hover:bg-[#173F32]/10 rounded-md disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5 text-[#173F32]" />
                      </button>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeBuilder(b.id)}
                        disabled={builders.length <= 1}
                        className="p-1.5 hover:bg-[#F05A68]/10 rounded-md disabled:opacity-30 cursor-pointer ml-1"
                        title="Remove Builder"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#F05A68]" />
                      </button>
                    </div>
                  </div>

                  {/* BUILDER INPUT FIELDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    {/* PHOTO THUMB & REPLACE */}
                    <div className="flex items-center gap-3">
                      <img
                        src={b.photoUrl}
                        alt={b.name}
                        className="w-12 h-12 rounded-lg object-cover border border-[#173F32]/30 shrink-0"
                      />
                      <label className="cursor-pointer px-2.5 py-1.5 bg-[#075B3A] text-[#F6F0E3] rounded-md font-mono text-[10px] font-bold uppercase hover:bg-[#0B6839] transition-colors flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>REPLACE</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUploadForBuilder(b.id, e)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* NAME */}
                    <div>
                      <input
                        type="text"
                        value={b.name}
                        onChange={(e) => updateBuilder(b.id, 'name', e.target.value)}
                        placeholder="NAME"
                        className="w-full h-[36px] px-2.5 bg-[#F8F2E6] border border-[#173F32] rounded-[6px] font-mono text-[11px] text-[#173F32] font-semibold focus:outline-none"
                      />
                    </div>

                    {/* STACK / ROLE */}
                    <div>
                      <input
                        type="text"
                        value={b.stack}
                        onChange={(e) => updateBuilder(b.id, 'stack', e.target.value)}
                        placeholder="STACK (e.g. FULLSTACK)"
                        className="w-full h-[36px] px-2.5 bg-[#F8F2E6] border border-[#173F32] rounded-[6px] font-mono text-[11px] text-[#173F32] font-semibold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: INSTANT LIVE PREVIEW & DOWNLOAD ACTIONS (50%) */}
        <div className="w-full lg:w-[48%] shrink-0 flex flex-col gap-6 sticky top-8">
          
          <div className="w-full bg-[#F8F2E6] border-2 border-[#173F32] rounded-[20px] p-6 shadow-sm">
            
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#D8CDB9]">
              <h3 className="font-['Oswald'] font-bold text-[20px] text-[#173F32] uppercase tracking-[0.02em] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#075B3A]" />
                <span>TEAM FRAME PREVIEW</span>
              </h3>

              <div className="px-2.5 py-0.5 bg-[#075B3A]/10 border border-[#075B3A]/20 rounded-full text-[10px] font-mono text-[#075B3A] font-bold">
                REALTIME SYNC
              </div>
            </div>

            {/* BRANDED PROCESSING ENGINE BANNER */}
            <AnimatePresence>
              {isDownloading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <BrandedProcessingState
                    currentStep="FINALIZING ID"
                    message="Exporting multi-builder high-res poster"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* LIVE PREVIEW COMPONENT */}
            <div className="w-full mb-6">
              <TeamFramePreview data={teamData} />
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-3">
              {/* DOWNLOAD BUTTON */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
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

              <div className="grid grid-cols-2 gap-3">
                {/* SHARE TO X */}
                <button
                  type="button"
                  onClick={handleOpenShareModal}
                  className="btn-tactile h-[46px] bg-[#173F32] text-[#F6F0E3] border-2 border-[#173F32] rounded-[10px] font-['Oswald'] font-bold text-[14px] uppercase tracking-[0.025em] flex items-center justify-center gap-2 hover:bg-[#075B3A] cursor-pointer focus:outline-none"
                >
                  <Share2 className="w-4 h-4 text-[#F2A900]" />
                  <span>SHARE TO X</span>
                </button>

                {/* COPY SHARE LINK */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="btn-tactile h-[46px] bg-[#F6F0E3] text-[#173F32] border-2 border-[#173F32] rounded-[10px] font-['Oswald'] font-bold text-[14px] uppercase tracking-[0.025em] flex items-center justify-center gap-2 hover:bg-[#173F32]/5 cursor-pointer focus:outline-none"
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
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* STICKY BOTTOM ACTION BAR FOR MOBILE ONE-HANDED OPERATION */}
      <div className="mobile-action-bar lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F6F0E3]/95 backdrop-blur-md border-t-2 border-[#173F32] p-3 shadow-2xl flex items-center gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
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
          title={`Team ${teamName} — HH Goa 2026`}
          description={`Team ${teamName} heading to Hacker House Goa 2026! See you in Goa. #FrameInGoa`}
          type="team"
        />
      )}

    </section>
  );
};
