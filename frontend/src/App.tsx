import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StudioWorkspace, type WorkspaceMode } from './components/StudioWorkspace';
import { useImageUpload } from './hooks/useImageUpload';
import { getShare, type ShareResponse } from './lib/share/createShare';

type View = 'landing' | 'studio' | 'share';

const viewFromPath = (): { view: View; initialMode?: WorkspaceMode; shareId?: string } => {
  const path = window.location.pathname;
  if (path === '/create/team') return { view: 'studio', initialMode: 'team' };
  if (path === '/create/id' || path === '/create' || path === '/generator' || path === '/create/pfp') return { view: 'studio', initialMode: 'builder' };

  const shareMatch = path.match(/^\/share\/([a-zA-Z0-9_-]+)/);
  if (shareMatch) return { view: 'share', shareId: shareMatch[1] };

  return { view: 'landing' };
};

export default function App() {
  const initial = viewFromPath();
  const [currentView, setCurrentView] = useState<View>(initial.view);
  const [studioMode, setStudioMode] = useState<WorkspaceMode>(initial.initialMode || 'builder');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Share Page States
  const [shareId, setShareId] = useState<string | null>(initial.shareId || null);
  const [shareData, setShareData] = useState<ShareResponse | null>(null);
  const [shareLoading, setShareLoading] = useState<boolean>(false);

  const { image, selectFile } = useImageUpload();

  useEffect(() => {
    const onPopState = () => {
      setDirection('backward');
      const route = viewFromPath();
      setCurrentView(route.view);
      if (route.initialMode) setStudioMode(route.initialMode);
      if (route.shareId) {
        setShareId(route.shareId);
      } else {
        setShareId(null);
        setShareData(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Fetch share data if shareId is set
  useEffect(() => {
    if (currentView === 'share' && shareId) {
      setShareLoading(true);
      getShare(shareId)
        .then((data) => {
          setShareData(data);
          setShareLoading(false);
        })
        .catch(() => {
          setShareLoading(false);
        });
    }
  }, [currentView, shareId]);

  const openStudio = (mode: WorkspaceMode = 'builder') => {
    setDirection('forward');
    setStudioMode(mode);
    setCurrentView('studio');
    const path = mode === 'team' ? '/create/team' : '/create/id';
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
  };

  const showLanding = () => {
    setDirection('backward');
    setCurrentView('landing');
    setShareId(null);
    setShareData(null);
    if (window.location.pathname !== '/') window.history.pushState({}, '', '/');
  };

  const handleFileSelect = async (file: File) => {
    const uploaded = await selectFile(file);
    if (uploaded) {
      openStudio('builder');
    }
  };

  const slideVariants = {
    enter: (dir: 'forward' | 'backward') => ({ x: dir === 'forward' ? '100vw' : '-100vw', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 'forward' | 'backward') => ({ x: dir === 'forward' ? '-100vw' : '100vw', opacity: 0 }),
  };

  return (
    <div className="relative min-h-[100dvh] bg-[#F6F0E3] text-[#173F32] font-mono selection:bg-[#075B3A] selection:text-[#F6F0E3] bg-paper-noise overflow-x-clip">
      <Navbar
        onCreateIdClick={() => openStudio('builder')}
        onCreateTeamClick={() => openStudio('team')}
        showDivider={currentView !== 'landing'}
      />
      <main className="relative w-full">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          {currentView === 'landing' && (
            <motion.div
              key="landing"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.45 }}
              className="w-full"
            >
              <HeroSection
                onFileSelect={handleFileSelect}
                onCreateClick={() => openStudio('builder')}
              />
            </motion.div>
          )}

          {currentView === 'studio' && (
            <motion.div
              key="studio"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.35 }}
              className="w-full"
            >
              <StudioWorkspace
                initialMode={studioMode}
                initialPhotoUrl={image?.previewUrl}
                onBackToHome={showLanding}
                onFileSelect={selectFile}
              />
            </motion.div>
          )}

          {currentView === 'share' && (
            <motion.div
              key="share"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.35 }}
              className="w-full max-w-[500px] mx-auto px-4 pt-4 pb-20 flex flex-col items-center text-center"
            >
              {shareLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                  <div className="w-10 h-10 border-4 border-[#075B3A] border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-mono text-[14px] text-[#173F32] mt-4">FETCHING PASS DETAILS...</p>
                </div>
              ) : shareData ? (
                <div className="w-full flex flex-col items-center">
                  <div className="mb-6 flex flex-col items-center">
                    <span className="px-3 py-1 bg-[#075B3A]/10 border border-[#075B3A]/20 rounded-full text-[11px] font-bold text-[#075B3A] tracking-wider uppercase mb-2">
                      #{shareData.type || 'builder'} pass
                    </span>
                    <h1 className="font-['Calistoga',serif] text-[32px] sm:text-[40px] leading-tight text-[#173F32] uppercase">
                      {shareData.title.split('|')[0].trim()}
                    </h1>
                    <p className="font-mono text-[13px] text-[#123B35]/80 mt-1 max-w-[360px]">
                      {shareData.description}
                    </p>
                  </div>

                  {/* Image Preview Card */}
                  <div className="w-full max-w-[360px] bg-[#F8F2E6] border-2 border-[#173F32] rounded-[24px] p-4 shadow-md mb-8">
                    <img
                      src={shareData.imageUrl}
                      alt={shareData.title}
                      className="w-full h-auto rounded-[16px] border border-[#D8CDB9]"
                    />
                  </div>

                  {/* Call To Action Buttons */}
                  <div className="w-full max-w-[320px] space-y-3">
                    <button
                      type="button"
                      onClick={() => openStudio('builder')}
                      className="btn-tactile w-full h-[52px] bg-[#075B3A] text-[#F6F0E3] border-2 border-[#173F32] rounded-[12px] font-['Oswald'] font-bold text-[17px] uppercase tracking-[0.03em] flex items-center justify-center gap-2 cursor-pointer hover:bg-[#0B6839]"
                    >
                      CREATE YOUR OWN PASS
                    </button>
                    <button
                      type="button"
                      onClick={showLanding}
                      className="btn-tactile w-full h-[46px] bg-[#F8F2E6] text-[#173F32] border-2 border-[#173F32] rounded-[12px] font-['Oswald'] font-bold text-[14px] uppercase tracking-[0.02em] flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#173F32]/5"
                    >
                      BACK TO HOME
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                  <div className="text-[44px]">⚠️</div>
                  <h2 className="font-['Calistoga',serif] text-[24px] text-[#173F32] mt-2">PASS NOT FOUND</h2>
                  <p className="font-mono text-[13px] text-[#123B35]/70 mt-1">This pass might have expired or does not exist.</p>
                  <button
                    type="button"
                    onClick={showLanding}
                    className="btn-tactile h-[46px] px-6 mt-6 bg-[#075B3A] text-[#F6F0E3] border-2 border-[#173F32] rounded-[12px] font-['Oswald'] font-bold text-[14px] uppercase tracking-[0.02em] cursor-pointer hover:bg-[#0B6839]"
                  >
                    GO TO HOME
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

