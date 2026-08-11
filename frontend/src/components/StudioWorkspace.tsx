import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Share2,
  Copy,
  Sparkles,
  Upload,
  UserPlus,
  Trash2,
  Instagram,
  Calendar,
  ArrowUpRight,
  Palette,
  Users,
  ImageIcon,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Edit3,
  ArrowLeft,
} from 'lucide-react';
import { BuilderIdCardPreview } from './BuilderIdCardPreview';
import { PfpFramePreview } from './PfpFramePreview';
import { TeamFramePreview } from './TeamFramePreview';
import { type BuilderFormData } from './BuilderForm';
import { downloadIdCardImage, renderIdCardToCanvas } from '../lib/builder/canvasExport';
import {
  downloadPfpImage,
  renderPfpToCanvas,
  type PfpStyle,
  type AspectRatio,
} from '../lib/pfp/pfpCanvasExport';
import {
  downloadTeamFrameImage,
  renderTeamFrame,
  type TeamMember,
  type TeamLayout,
} from '../lib/image/renderTeamFrame';
import { ShareModal } from './ShareModal';
import {
  calculateSmartCrop,
  detectFaces,
  type DetectedFace,
  type SmartCropResult,
} from '../lib/image/smartCrop';

export type WorkspaceMode = 'builder' | 'team';

const slideVariants = {
  enter: (dir: 'forward' | 'backward') => ({
    x: dir === 'forward' ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: 'forward' | 'backward') => ({
    x: dir === 'forward' ? '-100%' : '100%',
    opacity: 0,
  }),
};

interface StudioWorkspaceProps {
  initialMode?: WorkspaceMode | string;
  initialPhotoUrl?: string;
  onBackToHome?: () => void;
  onFileSelect?: (file: File) => void;
}

const DEFAULT_SAMPLE_PHOTO =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000';

const FRAME_STYLES: { id: PfpStyle; title: string; subtitle: string }[] = [
  { id: 'signal', title: 'STYLE 01 — SIGNAL', subtitle: 'Forest green, yellow brackets & reticles' },
  { id: 'builder', title: 'STYLE 02 — BUILDER', subtitle: 'Solid dark green frame & technical status' },
  { id: 'goa', title: 'STYLE 03 — GOA', subtitle: 'Tropical sunset coral, gold & wave pills' },
  { id: 'nightshift', title: 'STYLE 04 — NIGHT SHIFT', subtitle: 'Midnight theme & glowing mint coordinates' },
];

const ASPECT_RATIOS: { id: AspectRatio; label: string; desc: string }[] = [
  { id: '1:1', label: '1:1', desc: 'Square Profile' },
  { id: '4:5', label: '4:5', desc: 'Portrait Feed' },
  { id: '16:9', label: '16:9', desc: 'Landscape Banner' },
];

const TEAM_LAYOUTS: { id: TeamLayout; title: string; subtitle: string }[] = [
  { id: 'layout-a', title: 'LAYOUT A', subtitle: 'Equal Column Posters' },
  { id: 'layout-b', title: 'LAYOUT B', subtitle: 'Featured Lead + Stacked' },
  { id: 'layout-c', title: 'LAYOUT C', subtitle: 'Editorial Asymmetric' },
];

const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'member-1',
    name: 'SAYAN SINHA',
    stack: 'FULLSTACK & AI',
    role: 'TEAM LEAD',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'member-2',
    name: 'ANANYA SHARMA',
    stack: 'SMART CONTRACTS',
    role: 'ARCHITECT',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'member-3',
    name: 'KABIR VERMA',
    stack: 'UI & MOTION',
    role: 'DESIGNER',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
  },
];

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({
  initialMode = 'builder',
  initialPhotoUrl,
  onBackToHome,
}) => {
  const [activeMode, setActiveMode] = useState<WorkspaceMode>(
    initialMode === 'team' ? 'team' : 'builder'
  );
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [photoUrl, setPhotoUrl] = useState<string>(initialPhotoUrl || DEFAULT_SAMPLE_PHOTO);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const switchMode = (mode: WorkspaceMode) => {
    setActiveMode(mode);
    setIsGenerated(false);
  };

  // 1. BUILDER ID FORM STATE
  const [builderForm, setBuilderForm] = useState<BuilderFormData>({
    name: 'ANKAN GIRI',
    stack: 'FULLSTACK & AI',
    role: 'BUILDER',
    builderClass: 'CREATIVE BUILDER',
  });

  // 2. PFP FRAME FORM STATE
  const [pfpStyle, setPfpStyle] = useState<PfpStyle>('signal');
  const [pfpRatio, setPfpRatio] = useState<AspectRatio>('1:1');

  // 3. TEAM FRAME FORM STATE
  const [teamName, setTeamName] = useState<string>('ALPHA PROTOCOL');
  const [projectName, setProjectName] = useState<string>('AI AGENT INFRA');
  const [teamLayout, setTeamLayout] = useState<TeamLayout>('layout-a');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    if (initialPhotoUrl) {
      return [
        {
          id: 'member-1',
          name: 'MY BUILDER',
          stack: 'FULLSTACK',
          role: 'CREATOR',
          photoUrl: initialPhotoUrl,
        },
        DEFAULT_TEAM_MEMBERS[1],
        DEFAULT_TEAM_MEMBERS[2],
      ];
    }
    return DEFAULT_TEAM_MEMBERS;
  });

  // SMART CROP & FACE DETECTION STATE
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const [isDetecting, setIsDetecting] = useState<boolean>(true);

  // CROP ADJUSTMENTS
  const [showAdjustPanel, setShowAdjustPanel] = useState<boolean>(false);
  const [userScale, setUserScale] = useState<number>(1.0);
  const [userOffsetX, setUserOffsetX] = useState<number>(0);
  const [userOffsetY, setUserOffsetY] = useState<number>(0);

  // EXPORT & SHARE STATE
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [shareDataUrl, setShareDataUrl] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Load image & detect faces
  useEffect(() => {
    let isMounted = true;
    setIsDetecting(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photoUrl;

    img.onload = async () => {
      if (!isMounted) return;
      setImageDimensions({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      try {
        const detected = await detectFaces(img);
        if (isMounted) setFaces(detected);
      } catch {
        if (isMounted) setFaces([]);
      } finally {
        if (isMounted) setIsDetecting(false);
      }
    };

    return () => { isMounted = false; };
  }, [photoUrl]);

  // Compute smart crop
  const cropResult: SmartCropResult = calculateSmartCrop({
    sourceWidth: imageDimensions?.width || 1000,
    sourceHeight: imageDimensions?.height || 1000,
    targetWidth: activeMode === 'pfp' && pfpRatio === '16:9' ? 900 : 600,
    targetHeight: activeMode === 'pfp' && pfpRatio === '4:5' ? 750 : 600,
    scale: userScale,
    position: { x: userOffsetX, y: userOffsetY },
    faces,
  });

  // Handle Uploading a new photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
    }
  };

  // Download HD Image for current active mode
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (activeMode === 'builder') {
        await downloadIdCardImage({
          name: builderForm.name,
          stack: builderForm.stack,
          role: builderForm.role,
          builderClass: builderForm.builderClass,
          photoUrl,
          cropResult,
        });
      } else if (activeMode === 'team') {
        await downloadTeamFrameImage({
          teamName,
          projectName,
          layout: teamLayout,
          builders: teamMembers,
        });
      }
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Open Share Modal with live canvas preview
  const handleOpenShare = async () => {
    try {
      let canvas: HTMLCanvasElement;
      if (activeMode === 'builder') {
        canvas = await renderIdCardToCanvas({
          name: builderForm.name,
          stack: builderForm.stack,
          role: builderForm.role,
          builderClass: builderForm.builderClass,
          photoUrl,
          cropResult,
        });
      } else {
        canvas = await renderTeamFrame({
          teamName,
          projectName,
          layout: teamLayout,
          builders: teamMembers,
        });
      }
      setShareDataUrl(canvas.toDataURL('image/png', 1.0));
      setIsShareModalOpen(true);
    } catch {
      setIsShareModalOpen(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Team Member Editing Handlers
  const handleAddMember = () => {
    if (teamMembers.length >= 3) return;
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: `BUILDER ${teamMembers.length + 1}`,
      stack: 'CREATIVE & CODE',
      role: 'MEMBER',
      photoUrl,
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  const handleRemoveMember = (id: string) => {
    if (teamMembers.length <= 1) return;
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
  };

  const handleUpdateMember = (id: string, field: keyof TeamMember, val: string) => {
    setTeamMembers(teamMembers.map((m) => (m.id === id ? { ...m, [field]: val } : m)));
  };

  // FULL SCREEN RESULT PAGE (PICTURE 2 FLOW) WHEN GENERATED
  const renderResultView = () => {
    return (
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 pt-2 pb-4 relative z-10 animate-fade-in lg:h-full lg:overflow-hidden lg:flex lg:flex-col">
        
        {/* RESULT PAGE HEADER / NAVBAR */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mb-4 pb-3 border-b-2 border-[#173F32]/15 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsGenerated(false)}
              className="btn-tactile px-3.5 py-2 bg-[#FAF6EE] text-[#075B3A] border-2 border-[#173F32] rounded-[10px] font-mono text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-[#173F32]/5 flex items-center gap-1.5 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-[#075B3A]" />
              <span>BACK TO EDITOR</span>
            </button>
          </div>
        </div>

        {/* MAIN RESULT GRID */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)_340px] gap-8 flex-1 min-h-0 lg:grid-rows-1 mb-6 lg:mb-0">
          
          {/* CENTER COLUMN: PREVIEW CARD & PAGINATION DOTS */}
          <div className="flex flex-col items-center justify-start w-full min-h-[400px] lg:min-h-0 h-full lg:col-start-2">
            <div className="w-full flex items-center justify-center">
              {activeMode === 'builder' && (
                <BuilderIdCardPreview
                  formData={builderForm}
                  photoUrl={photoUrl}
                  cropResult={cropResult}
                  pfpStyle={pfpStyle}
                  pfpRatio={pfpRatio}
                />
              )}

              {activeMode === 'team' && (
                <TeamFramePreview
                  data={{
                    teamName,
                    projectName,
                    layout: teamLayout,
                    builders: teamMembers,
                  }}
                  pfpStyle={pfpStyle}
                />
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ACTION PANELS */}
          <div className="flex flex-col gap-5 w-full lg:col-start-3">
            
            {/* CARD 1: YOUR FRAME IS READY */}
            <div className="w-full bg-[#FAF6EE] border-2 border-[#173F32] rounded-[20px] p-5 shadow-xs flex flex-col gap-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#F05A68] text-[#F6F0E3] flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-['Oswald'] font-bold text-[17px] text-[#173F32] uppercase">
                    YOUR FRAME IS READY
                  </span>
                  <span className="font-mono text-[11px] text-[#173F32]/70">
                    Download, share and show off your Goa spirit.
                  </span>
                </div>
              </div>

              {/* DOWNLOAD HD IMAGE */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="btn-tactile w-full h-[50px] bg-[#075B3A] text-[#F6F0E3] border-2 border-[#173F32] rounded-[10px] font-['Oswald'] font-bold text-[16px] uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer hover:bg-[#0B6839] shadow-md"
              >
                <Download className="w-4 h-4 text-[#F2A900]" />
                <span>{downloadSuccess ? 'DOWNLOADED HD!' : 'DOWNLOAD HD IMAGE'}</span>
              </button>

              {/* SHARE TO X */}
              <button
                type="button"
                onClick={handleOpenShare}
                className="btn-tactile w-full h-[42px] bg-[#FAF6EE] text-[#173F32] border-2 border-[#173F32] rounded-[8px] font-mono text-[12px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer hover:bg-[#173F32]/5"
              >
                <Share2 className="w-3.5 h-3.5 text-[#075B3A]" />
                <span>SHARE TO X</span>
              </button>

              {/* SHARE TO INSTAGRAM */}
              <button
                type="button"
                onClick={handleOpenShare}
                className="btn-tactile w-full h-[42px] bg-[#FAF6EE] text-[#173F32] border-2 border-[#173F32] rounded-[8px] font-mono text-[12px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer hover:bg-[#173F32]/5"
              >
                <Instagram className="w-3.5 h-3.5 text-[#F05A68]" />
                <span>SHARE TO INSTAGRAM</span>
              </button>

              {/* COPY SHARE LINK */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn-tactile w-full h-[42px] bg-[#FAF6EE] text-[#173F32] border-2 border-[#173F32] rounded-[8px] font-mono text-[12px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer hover:bg-[#173F32]/5"
              >
                <Copy className="w-3.5 h-3.5 text-[#075B3A]" />
                <span>{copySuccess ? 'LINK COPIED!' : 'COPY LINK'}</span>
              </button>

              {/* CALENDAR BADGE */}
              <div className="w-full bg-[#F2E8D5] border border-[#173F32]/20 rounded-[12px] p-3 mt-1 flex items-center justify-between font-mono text-[11px] text-[#173F32]">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#075B3A]" />
                  <div className="flex flex-col">
                    <span className="font-bold text-[10px] text-[#075B3A] uppercase">ADD TO CALENDAR</span>
                    <span className="font-bold">24 — 30 DEC 2026</span>
                    <span className="text-[10px] text-[#173F32]/70">Candolim, Goa</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#075B3A]" />
              </div>

            </div>

            {/* CARD 2: WHAT'S NEXT? */}
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
                  onClick={() => {
                    setIsGenerated(false);
                    setTimeout(() => fileInputRef.current?.click(), 100);
                  }}
                  className="btn-tactile bg-[#F6F0E3] text-[#173F32] border border-[#173F32] rounded-[10px] p-2.5 flex flex-col items-center text-center cursor-pointer hover:bg-[#075B3A]/10"
                >
                  <ImageIcon className="w-4 h-4 mb-1 text-[#075B3A]" />
                  <span className="font-mono text-[9px] font-bold uppercase leading-tight">
                    ANOTHER PHOTO
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsGenerated(false);
                  }}
                  className="btn-tactile bg-[#F6F0E3] text-[#173F32] border border-[#173F32] rounded-[10px] p-2.5 flex flex-col items-center text-center cursor-pointer hover:bg-[#075B3A]/10"
                >
                  <Palette className="w-4 h-4 mb-1 text-[#F05A68]" />
                  <span className="font-mono text-[9px] font-bold uppercase leading-tight">
                    EDIT STYLE
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    switchMode(activeMode === 'builder' ? 'team' : 'builder');
                  }}
                  className="btn-tactile bg-[#F6F0E3] text-[#173F32] border border-[#173F32] rounded-[10px] p-2.5 flex flex-col items-center text-center cursor-pointer hover:bg-[#075B3A]/10"
                >
                  <Users className="w-4 h-4 mb-1 text-[#F2A900]" />
                  <span className="font-mono text-[9px] font-bold uppercase leading-tight">
                    {activeMode === 'builder' ? 'TEAM FRAME' : 'BUILDER ID'}
                  </span>
                </button>
              </div>
            </div>

          </div>

          {/* LEFT COLUMN: EDITORIAL HEADING & VINTAGE GOA STAMP */}
          <div className="flex flex-col justify-between gap-6 h-full min-h-[360px] lg:min-h-0 lg:col-start-1">
            <div>
              <div className="flex flex-col font-['Calistoga',serif] font-normal uppercase leading-[0.9] tracking-[-0.015em]">
                <span className="text-[54px] sm:text-[72px] lg:text-[64px] xl:text-[76px] text-[#0B6839]">YOUR GOA</span>
                <span className="text-[54px] sm:text-[72px] lg:text-[64px] xl:text-[76px] text-[#0B6839]">FRAME</span>
                <span className="text-[54px] sm:text-[72px] lg:text-[64px] xl:text-[76px] text-[#F05A68]">IS READY!</span>
              </div>

              {/* DECORATIVE OCEAN WAVE (like landing page) */}
              <svg
                width="170"
                height="55"
                viewBox="0 0 170 55"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="block overflow-visible mt-3"
                aria-hidden="true"
              >
                <path
                  d="M 5 32 C 18 36, 32 32, 48 24 C 64 16, 78 7, 92 7 C 102 7, 108 11, 102 18 C 96 25, 87 28, 92 33 C 98 38, 115 35, 128 27 C 137 21, 142 15, 145 22 C 141 24, 139 27, 142 29 C 146 31, 152 29, 158 31 C 162 32, 166 31, 170 32"
                  stroke="#6B9142"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 40 33 C 50 28, 62 26, 70 29 C 78 32, 73 37, 68 39 C 63 41, 62 36, 68 32"
                  stroke="#6B9142"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 148 35 C 154 33, 160 36, 168 35"
                  stroke="#6B9142"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* VINTAGE STAMP & AZULEJO TILES DECORATION */}
            <div className="flex flex-col gap-4 mt-auto mb-6">
              <div className="flex items-center gap-3">
                {/* VINTAGE CIRCULAR POSTMARK STAMP */}
                <div className="w-18 h-18 rounded-full border-2 border-dashed border-[#075B3A]/60 flex flex-col items-center justify-center p-2 text-center transform rotate-[-8deg] bg-[#F2E8D5] shadow-xs shrink-0">
                  <span className="font-mono text-[8px] font-bold text-[#075B3A] leading-tight">MADE OF</span>
                  <span className="font-['Oswald'] font-bold text-[14px] text-[#173F32] leading-none my-0.5">GOA</span>
                  <span className="font-mono text-[8px] font-bold text-[#F05A68] leading-tight">2026</span>
                </div>

                <div className="flex flex-col">
                  <span className="font-mono text-[10px] font-bold text-[#075B3A] uppercase">CONFIRMED PASS</span>
                  <span className="font-mono text-[9px] text-[#173F32]/70">HHGOA-2026-VERIFIED</span>
                </div>
              </div>

              {/* AZULEJO TILES PATTERN WATERMARK */}
              <div className="w-36 h-24 bg-gradient-to-tr from-[#1B4B82]/20 to-transparent rounded-[14px] border border-[#1B4B82]/30 p-2 relative overflow-hidden flex items-center justify-center opacity-85">
                <div className="grid grid-cols-2 gap-2 opacity-35">
                  <div className="w-8 h-8 border-2 border-[#1B4B82] rotate-45" />
                  <div className="w-8 h-8 border-2 border-[#1B4B82] rotate-45" />
                  <div className="w-8 h-8 border-2 border-[#1B4B82] rotate-45" />
                  <div className="w-8 h-8 border-2 border-[#1B4B82] rotate-45" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* SHARE MODAL */}
        {shareDataUrl && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            imageDataUrl={shareDataUrl}
            title="HH Goa 2026 Pass"
            description="I'm attending Hacker House Goa 2026! #FrameInGoa"
            type={activeMode}
          />
        )}
      </section>
    );
  };

  const renderEditorView = () => {
    return (
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 pt-4 pb-20 relative z-10">
      
      {/* 1. TOP HEADER NAVIGATION & MODE SELECTOR TABS */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mb-8 pb-4 border-b-2 border-[#173F32]/15">
        
        {/* BACK BUTTON & HEADING */}
        <div className="flex items-center gap-3">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="btn-tactile px-3 py-1.5 bg-[#FAF6EE] text-[#075B3A] border-2 border-[#173F32] rounded-[8px] font-mono text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:bg-[#173F32]/5"
            >
              ← HOME
            </button>
          )}
          <div>
            <h1 className="font-['Oswald'] font-bold text-[22px] sm:text-[26px] text-[#173F32] uppercase tracking-wide leading-none">
              FRAME STUDIO WORKSPACE
            </h1>
            <p className="font-mono text-[11px] text-[#173F32]/70">
              Upload, customize and generate individual or team cards in one single place.
            </p>
          </div>
        </div>

        {/* MODE SELECTOR PILLS */}
        <div className="flex items-center gap-1.5 bg-[#EDE5D4] p-1.5 rounded-full border border-[#173F32]/15 shadow-sm">
          <button
            type="button"
            onClick={() => switchMode('builder')}
            className={`btn-tactile px-5 py-2 rounded-full font-['Oswald'] font-semibold text-[13px] sm:text-[14px] uppercase tracking-wide cursor-pointer transition-all duration-200 flex items-center gap-1.5 ${
              activeMode === 'builder'
                ? 'bg-[#075B3A] text-[#F6F0E3] shadow-md'
                : 'text-[#173F32]/70 hover:text-[#173F32] hover:bg-[#173F32]/10'
            }`}
          >
            <span>🆔 BUILDER ID</span>
          </button>

          <button
            type="button"
            onClick={() => switchMode('team')}
            className={`btn-tactile px-5 py-2 rounded-full font-['Oswald'] font-semibold text-[13px] sm:text-[14px] uppercase tracking-wide cursor-pointer transition-all duration-200 flex items-center gap-1.5 ${
              activeMode === 'team'
                ? 'bg-[#F2A900] text-[#173F32] shadow-md'
                : 'text-[#173F32]/70 hover:text-[#173F32] hover:bg-[#173F32]/10'
            }`}
          >
            <span>👥 TEAM FRAME</span>
          </button>
        </div>

      </div>

      {/* 2. WORKSPACE GRID: PREVIEW CARD CENTER, OPTIONS ON RIGHT */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(340px,1fr)_minmax(0,640px)_minmax(340px,1fr)] gap-6 items-start mb-16">
        
        {/* LEFT COLUMN: EDITORIAL HEADING & VINTAGE GOA STAMP */}
        <div className="flex flex-col justify-between gap-6 h-full min-h-[360px] lg:min-h-0 lg:col-start-1">
          <div>
            <div className="flex flex-col font-['Calistoga',serif] font-normal uppercase leading-[0.9] tracking-[-0.015em]">
              <span className="text-[54px] sm:text-[72px] lg:text-[64px] xl:text-[76px] text-[#0B6839]">YOUR GOA</span>
              <span className="text-[54px] sm:text-[72px] lg:text-[64px] xl:text-[76px] text-[#0B6839]">IS</span>
              <span className="text-[54px] sm:text-[72px] lg:text-[64px] xl:text-[76px] text-[#F05A68]">COOKING!</span>
            </div>

            {/* DECORATIVE OCEAN WAVE */}
            <svg
              width="170"
              height="55"
              viewBox="0 0 170 55"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="block overflow-visible mt-3"
              aria-hidden="true"
            >
              <path
                d="M 5 32 C 18 36, 32 32, 48 24 C 64 16, 78 7, 92 7 C 102 7, 108 11, 102 18 C 96 25, 87 28, 92 33 C 98 38, 115 35, 128 27 C 137 21, 142 15, 145 22 C 141 24, 139 27, 142 29 C 146 31, 152 29, 158 31 C 162 32, 166 31, 170 32"
                stroke="#6B9142"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 40 33 C 50 28, 62 26, 70 29 C 78 32, 73 37, 68 39 C 63 41, 62 36, 68 32"
                stroke="#6B9142"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 148 35 C 154 33, 160 36, 168 35"
                stroke="#6B9142"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* VINTAGE STAMP & AZULEJO TILES DECORATION */}
          <div className="flex flex-col gap-4 mt-auto mb-6">
            <div className="flex items-center gap-3">
              {/* VINTAGE CIRCULAR POSTMARK STAMP */}
              <div className="w-18 h-18 rounded-full border-2 border-dashed border-[#075B3A]/60 flex flex-col items-center justify-center p-2 text-center transform rotate-[-8deg] bg-[#F2E8D5] shadow-xs shrink-0">
                <span className="font-mono text-[8px] font-bold text-[#075B3A] leading-tight">MADE OF</span>
                <span className="font-['Oswald'] font-bold text-[14px] text-[#173F32] leading-none my-0.5">GOA</span>
                <span className="font-mono text-[8px] font-bold text-[#F05A68] leading-tight">2026</span>
              </div>

              <div className="flex flex-col">
                <span className="font-mono text-[10px] font-bold text-[#075B3A] uppercase">DESIGN IN PROGRESS</span>
                <span className="font-mono text-[9px] text-[#173F32]/70">HHGOA-2026-WORKSPACE</span>
              </div>
            </div>

            {/* AZULEJO TILES PATTERN WATERMARK */}
            <div className="w-36 h-24 bg-gradient-to-tr from-[#1B4B82]/20 to-transparent rounded-[14px] border border-[#1B4B82]/30 p-2 relative overflow-hidden flex items-center justify-center opacity-85">
              <div className="grid grid-cols-2 gap-2 opacity-35">
                <div className="w-8 h-8 border-2 border-[#1B4B82] rotate-45" />
                <div className="w-8 h-8 border-2 border-[#1B4B82] rotate-45" />
                <div className="w-8 h-8 border-2 border-[#1B4B82] rotate-45" />
                <div className="w-8 h-8 border-2 border-[#1B4B82] rotate-45" />
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: LIVE PREVIEW CARD & GENERATE BUTTON BELOW */}
        <div className="flex flex-col gap-5 w-full lg:col-start-2">
          
          {/* LIVE PREVIEW CARD */}
          <div className="flex flex-col items-center justify-center w-full">
            {activeMode === 'builder' && (
              <BuilderIdCardPreview
                formData={builderForm}
                photoUrl={photoUrl}
                cropResult={cropResult}
                pfpStyle={pfpStyle}
                pfpRatio={pfpRatio}
              />
            )}

            {activeMode === 'team' && (
              <TeamFramePreview
                data={{
                  teamName,
                  projectName,
                  layout: teamLayout,
                  builders: teamMembers,
                }}
                pfpStyle={pfpStyle}
              />
            )}
          </div>

          {/* ACTION CONTROLS & QUICK ACTIONS */}
          {/* PRIMARY ACTION: GENERATE */}
          {!isGenerated ? (
            <button
              type="button"
              onClick={() => setIsGenerated(true)}
              className="btn-tactile w-full max-w-[300px] mx-auto h-[52px] bg-[#075B3A] text-[#F6F0E3] border-2 border-[#173F32] rounded-[10px] font-['Oswald'] font-bold text-[17px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:bg-[#0B6839] shadow-md"
            >
              <Sparkles className="w-5 h-5 text-[#F2A900]" />
              <span>GENERATE NOW</span>
            </button>
          ) : (
            <div className="w-full bg-[#FAF6EE] border-2 border-[#173F32] rounded-[20px] p-5 shadow-xs flex flex-col gap-3.5">
              
              {/* EDIT AGAIN OPTION */}
              <button
                type="button"
                onClick={() => setIsGenerated(false)}
                className="btn-tactile w-full h-[40px] bg-[#EDE5D4] text-[#173F32] border-2 border-[#173F32] rounded-[8px] font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:bg-[#173F32]/10 mb-1"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#075B3A]" />
                <span>EDIT AGAIN / MAKE CHANGES</span>
              </button>

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

              {/* DOWNLOAD HD IMAGE */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="btn-tactile w-full h-[48px] bg-[#075B3A] text-[#F6F0E3] border-2 border-[#173F32] rounded-[10px] font-['Oswald'] font-bold text-[15px] uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer hover:bg-[#0B6839]"
              >
                <Download className="w-4 h-4 text-[#F2A900]" />
                <span>{downloadSuccess ? 'DOWNLOADED HD!' : 'DOWNLOAD HD IMAGE'}</span>
              </button>

              {/* SHARE TO X */}
              <button
                type="button"
                onClick={handleOpenShare}
                className="btn-tactile w-full h-[42px] bg-[#FAF6EE] text-[#173F32] border-2 border-[#173F32] rounded-[8px] font-mono text-[12px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer hover:bg-[#173F32]/5"
              >
                <Share2 className="w-3.5 h-3.5 text-[#075B3A]" />
                <span>POST ON X NOW</span>
              </button>

              {/* SHARE TO INSTAGRAM */}
              <button
                type="button"
                onClick={handleOpenShare}
                className="btn-tactile w-full h-[42px] bg-[#FAF6EE] text-[#173F32] border-2 border-[#173F32] rounded-[8px] font-mono text-[12px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer hover:bg-[#173F32]/5"
              >
                <Instagram className="w-3.5 h-3.5 text-[#F05A68]" />
                <span>SHARE TO INSTAGRAM</span>
              </button>

              {/* COPY SHARE LINK */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn-tactile w-full h-[42px] bg-[#FAF6EE] text-[#173F32] border-2 border-[#173F32] rounded-[8px] font-mono text-[12px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer hover:bg-[#173F32]/5"
              >
                <Copy className="w-3.5 h-3.5 text-[#075B3A]" />
                <span>{copySuccess ? 'LINK COPIED!' : 'COPY LINK'}</span>
              </button>

              {/* CALENDAR BADGE */}
              <div className="w-full bg-[#F2E8D5] border border-[#173F32]/20 rounded-[12px] p-3 mt-1 flex items-center justify-between font-mono text-[11px] text-[#173F32]">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#075B3A]" />
                  <div className="flex flex-col">
                    <span className="font-bold text-[10px] text-[#075B3A] uppercase">EVENT DATE</span>
                    <span className="font-bold">28 — 31 OCT 2026</span>
                    <span className="text-[10px] text-[#173F32]/70">Candolim, Goa</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#075B3A]" />
              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: ALL CUSTOMIZATION OPTIONS (RIGHT-ALIGNED IN COLUMN 3) */}
        <div className="flex flex-col gap-5 w-full bg-[#FAF6EE] border-2 border-[#173F32] rounded-[20px] p-5 shadow-xs lg:col-start-3 lg:justify-self-end lg:w-[min(340px,100%)]">
          
          {/* PHOTO UPLOAD BOX */}
          <div className="flex flex-col gap-2">
            <span className="font-['Oswald'] font-bold text-[14px] text-[#173F32] uppercase flex items-center justify-between">
              <span>1. PHOTO UPLOAD</span>
              <span className="font-mono text-[10px] text-[#075B3A]">
                {isDetecting ? 'ANALYZING...' : 'AUTOFRAMED'}
              </span>
            </span>

            <div className="flex items-center gap-3 bg-[#F6F0E3] p-2.5 rounded-[12px] border border-[#173F32]/20">
              <div className="w-14 h-14 rounded-[10px] overflow-hidden border border-[#173F32] shrink-0 bg-[#EDE5D4]">
                <img src={photoUrl} alt="Thumbnail" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-tactile h-9 bg-[#075B3A] text-[#F6F0E3] border border-[#173F32] rounded-[8px] font-mono text-[11px] font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 hover:bg-[#0B6839] cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#F2A900]" />
                  <span>UPLOAD PHOTO</span>
                </button>
                <span className="font-mono text-[9px] text-[#173F32]/60 mt-1">
                  JPG, PNG or WEBP up to 20MB
                </span>
              </div>
            </div>
          </div>

          <div className="w-full border-b border-dashed border-[#173F32]/20" />

          {/* MODE-SPECIFIC FORM CONTROLS */}
          {activeMode === 'builder' && (
            <div className="flex flex-col gap-4">
              <span className="font-['Oswald'] font-bold text-[14px] text-[#173F32] uppercase">
                2. BUILDER ID DETAILS
              </span>

              {/* NAME */}
              <div>
                <label className="font-mono text-[11px] font-bold text-[#173F32]/80 uppercase block mb-1">
                  BUILDER NAME
                </label>
                <input
                  type="text"
                  value={builderForm.name}
                  onChange={(e) => setBuilderForm({ ...builderForm, name: e.target.value })}
                  placeholder="e.g. SAYAN SINHA"
                  className="w-full h-10 px-3 bg-[#F6F0E3] border border-[#173F32] rounded-[8px] font-mono text-[13px] text-[#173F32] uppercase focus:outline-none focus:ring-2 focus:ring-[#075B3A]"
                />
              </div>

              {/* TECH STACK */}
              <div>
                <label className="font-mono text-[11px] font-bold text-[#173F32]/80 uppercase block mb-1">
                  TECH STACK
                </label>
                <input
                  type="text"
                  value={builderForm.stack}
                  onChange={(e) => setBuilderForm({ ...builderForm, stack: e.target.value })}
                  placeholder="e.g. FULLSTACK & AI"
                  className="w-full h-10 px-3 bg-[#F6F0E3] border border-[#173F32] rounded-[8px] font-mono text-[13px] text-[#173F32] uppercase focus:outline-none focus:ring-2 focus:ring-[#075B3A]"
                />
              </div>

              {/* PASS TYPE / ROLE */}
              <div>
                <label className="font-mono text-[11px] font-bold text-[#173F32]/80 uppercase block mb-1.5">
                  PASS TYPE
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['BUILDER', 'SPEAKER', 'VOLUNTEER', 'CREW', 'COMMUNITY', 'VIP'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setBuilderForm({ ...builderForm, role })}
                      className={`btn-tactile py-1.5 px-2 rounded-[6px] font-mono text-[10px] font-bold uppercase tracking-wider border cursor-pointer ${
                        builderForm.role === role
                          ? 'bg-[#075B3A] text-[#F6F0E3] border-[#173F32]'
                          : 'bg-[#F6F0E3] text-[#173F32] border-[#173F32]/30 hover:bg-[#173F32]/5'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* PFP FEATURE EMBEDDED */}
              <div className="pt-3 border-t border-dashed border-[#173F32]/20 flex flex-col gap-3">
                <span className="font-['Oswald'] font-bold text-[13px] text-[#173F32] uppercase flex items-center justify-between">
                  <span>PFP &amp; FRAME STYLING</span>
                  <span className="font-mono text-[10px] text-[#075B3A]">FEATURE INCLUDED</span>
                </span>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] font-bold text-[#173F32]/80 uppercase">
                    CHOOSE FRAME STYLE
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {FRAME_STYLES.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setPfpStyle(st.id)}
                        className={`btn-tactile p-2 rounded-[8px] text-left border cursor-pointer flex flex-col gap-0.5 ${
                          pfpStyle === st.id
                            ? 'bg-[#075B3A] text-[#F6F0E3] border-[#173F32]'
                            : 'bg-[#F6F0E3] text-[#173F32] border-[#173F32]/30 hover:bg-[#173F32]/5'
                        }`}
                      >
                        <span className="font-['Oswald'] font-bold text-[11px] uppercase tracking-wide truncate">
                          {st.title.replace('STYLE ', '')}
                        </span>
                        <span className="font-mono text-[9px] opacity-80 truncate">{st.subtitle.split(',')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[10px] font-bold text-[#173F32]/80 uppercase block mb-1">
                    ASPECT RATIO
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {ASPECT_RATIOS.map((ar) => (
                      <button
                        key={ar.id}
                        type="button"
                        onClick={() => setPfpRatio(ar.id)}
                        className={`btn-tactile py-1.5 px-1 rounded-[6px] font-mono text-[10px] font-bold uppercase tracking-wider border cursor-pointer text-center ${
                          pfpRatio === ar.id
                            ? 'bg-[#075B3A] text-[#F6F0E3] border-[#173F32]'
                            : 'bg-[#F6F0E3] text-[#173F32] border-[#173F32]/30 hover:bg-[#173F32]/5'
                        }`}
                      >
                        <div>{ar.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'team' && (
            <div className="flex flex-col gap-4">
              <span className="font-['Oswald'] font-bold text-[14px] text-[#173F32] uppercase">
                2. TEAM DETAILS &amp; BUILDERS
              </span>

              {/* TEAM NAME */}
              <div>
                <label className="font-mono text-[11px] font-bold text-[#173F32]/80 uppercase block mb-1">
                  TEAM NAME
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="ALPHA PROTOCOL"
                  className="w-full h-10 px-3 bg-[#F6F0E3] border border-[#173F32] rounded-[8px] font-mono text-[13px] text-[#173F32] uppercase focus:outline-none focus:ring-2 focus:ring-[#075B3A]"
                />
              </div>

              {/* PROJECT TRACK */}
              <div>
                <label className="font-mono text-[11px] font-bold text-[#173F32]/80 uppercase block mb-1">
                  PROJECT / TRACK
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="AI AGENT INFRA"
                  className="w-full h-10 px-3 bg-[#F6F0E3] border border-[#173F32] rounded-[8px] font-mono text-[13px] text-[#173F32] uppercase focus:outline-none focus:ring-2 focus:ring-[#075B3A]"
                />
              </div>

              {/* LAYOUT PICKER */}
              <div>
                <label className="font-mono text-[11px] font-bold text-[#173F32]/80 uppercase block mb-1.5">
                  LAYOUT STYLE
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {TEAM_LAYOUTS.map((ly) => (
                    <button
                      key={ly.id}
                      type="button"
                      onClick={() => setTeamLayout(ly.id)}
                      className={`btn-tactile py-1.5 px-1 rounded-[6px] font-mono text-[10px] font-bold uppercase tracking-wider border cursor-pointer text-center ${
                        teamLayout === ly.id
                          ? 'bg-[#075B3A] text-[#F6F0E3] border-[#173F32]'
                          : 'bg-[#F6F0E3] text-[#173F32] border-[#173F32]/30 hover:bg-[#173F32]/5'
                      }`}
                    >
                      {ly.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* MEMBERS LIST */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-mono text-[11px] font-bold text-[#173F32]/80 uppercase">
                    TEAM MEMBERS ({teamMembers.length}/3)
                  </label>
                  {teamMembers.length < 3 && (
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="font-mono text-[10px] font-bold text-[#075B3A] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3 h-3" /> ADD BUILDER
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {teamMembers.map((m, idx) => (
                    <div
                      key={m.id}
                      className="bg-[#F6F0E3] border border-[#173F32]/30 p-2 rounded-[8px] flex items-center gap-2"
                    >
                      <img
                        src={m.photoUrl}
                        alt=""
                        className="w-9 h-9 rounded-md object-cover border border-[#173F32]"
                      />
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <input
                          type="text"
                          value={m.name}
                          onChange={(e) => handleUpdateMember(m.id, 'name', e.target.value)}
                          className="h-6 px-1.5 bg-white border border-[#173F32]/20 rounded font-mono text-[11px] text-[#173F32] uppercase"
                        />
                      </div>
                      {teamMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m.id)}
                          className="text-[#F05A68] hover:bg-[#F05A68]/10 p-1 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* PFP FEATURE EMBEDDED IN TEAM FRAME */}
              <div className="pt-3 border-t border-dashed border-[#173F32]/20 flex flex-col gap-3">
                <span className="font-['Oswald'] font-bold text-[13px] text-[#173F32] uppercase flex items-center justify-between">
                  <span>PFP &amp; FRAME STYLING</span>
                  <span className="font-mono text-[10px] text-[#075B3A]">FEATURE INCLUDED</span>
                </span>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] font-bold text-[#173F32]/80 uppercase">
                    CHOOSE FRAME STYLE
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {FRAME_STYLES.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setPfpStyle(st.id)}
                        className={`btn-tactile p-2 rounded-[8px] text-left border cursor-pointer flex flex-col gap-0.5 ${
                          pfpStyle === st.id
                            ? 'bg-[#075B3A] text-[#F6F0E3] border-[#173F32]'
                            : 'bg-[#F6F0E3] text-[#173F32] border-[#173F32]/30 hover:bg-[#173F32]/5'
                        }`}
                      >
                        <span className="font-['Oswald'] font-bold text-[11px] uppercase tracking-wide truncate">
                          {st.title.replace('STYLE ', '')}
                        </span>
                        <span className="font-mono text-[9px] opacity-80 truncate">{st.subtitle.split(',')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FINE TUNE ADJUSTMENTS COLLAPSIBLE */}
          <div className="pt-2 border-t border-dashed border-[#173F32]/20">
            <button
              type="button"
              onClick={() => setShowAdjustPanel(!showAdjustPanel)}
              className="w-full py-2 px-3 bg-[#F6F0E3] border border-[#173F32]/30 rounded-[8px] font-mono text-[11px] font-bold text-[#173F32] flex items-center justify-between cursor-pointer hover:bg-[#173F32]/5"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#075B3A]" />
                <span>FINE-TUNE CROP &amp; ZOOM</span>
              </span>
              {showAdjustPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <AnimatePresence>
              {showAdjustPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-3 space-y-3 font-mono text-[11px]"
                >
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>ZOOM</span>
                      <span>{userScale.toFixed(2)}x</span>
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
                      <span>OFFSET X</span>
                      <span>{userOffsetX.toFixed(2)}</span>
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
                      <span>OFFSET Y</span>
                      <span>{userOffsetY.toFixed(2)}</span>
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

                  <button
                    type="button"
                    onClick={() => {
                      setUserScale(1.0);
                      setUserOffsetX(0);
                      setUserOffsetY(0);
                    }}
                    className="text-[10px] font-bold text-[#F05A68] flex items-center gap-1 cursor-pointer hover:underline pt-1"
                  >
                    <RotateCcw className="w-3 h-3" /> RESET CROP
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* SHARE MODAL */}
      {shareDataUrl && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          imageDataUrl={shareDataUrl}
          title="HH Goa 2026 Pass"
          description="I'm attending Hacker House Goa 2026! #FrameInGoa"
          type={activeMode}
        />
      )}
    </section>
    );
  };

  const direction = isGenerated ? 'forward' : 'backward';

  return (
    <div className="w-full lg:h-full relative overflow-hidden">
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        {isGenerated ? (
          <motion.div
            key="result-view"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.35 }}
            className="w-full lg:h-full flex flex-col"
          >
            {renderResultView()}
          </motion.div>
        ) : (
          <motion.div
            key="editor-view"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.35 }}
            className="w-full"
          >
            {renderEditorView()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
