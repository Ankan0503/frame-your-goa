import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StudioWorkspace, type WorkspaceMode } from './components/StudioWorkspace';
import { ShareView } from './components/ShareView';
import { useImageUpload } from './hooks/useImageUpload';

type View = 'landing' | 'studio' | 'share';

const viewFromPath = (): { view: View; initialMode?: WorkspaceMode; shareId?: string } => {
  const path = window.location.pathname;
  if (path.startsWith('/share/')) {
    const id = path.replace('/share/', '').trim();
    return { view: 'share', shareId: id };
  }
  if (path === '/create/team') return { view: 'studio', initialMode: 'team' };
  if (path === '/create/id' || path === '/create' || path === '/generator' || path === '/create/pfp') return { view: 'studio', initialMode: 'builder' };
  return { view: 'landing' };
};

export default function App() {
  const initial = viewFromPath();
  const [currentView, setCurrentView] = useState<View>(initial.view);
  const [studioMode, setStudioMode] = useState<WorkspaceMode>(initial.initialMode || 'builder');
  const [activeShareId, setActiveShareId] = useState<string | undefined>(initial.shareId);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const { image, selectFile } = useImageUpload();

  useEffect(() => {
    const onPopState = () => {
      setDirection('backward');
      const route = viewFromPath();
      setCurrentView(route.view);
      if (route.initialMode) setStudioMode(route.initialMode);
      setActiveShareId(route.shareId);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

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
    <div className={`min-h-screen bg-[#F6F0E3] text-[#173F32] font-mono selection:bg-[#075B3A] selection:text-[#F6F0E3] bg-paper-noise overflow-x-clip ${currentView === 'landing' ? 'lg:h-screen lg:overflow-y-hidden' : ''} ${currentView === 'studio' ? 'lg:h-screen lg:flex lg:flex-col' : ''}`}>
      <Navbar
        onCreateIdClick={() => openStudio('builder')}
        onCreateTeamClick={() => openStudio('team')}
      />
      <main className={`relative w-full ${currentView === 'studio' ? 'lg:flex-1 lg:min-h-0' : ''}`}>
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
                onCreateTeamClick={() => openStudio('team')}
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
              className="w-full lg:h-full"
            >
              <StudioWorkspace
                initialMode={studioMode}
                initialPhotoUrl={image?.previewUrl}
                onBackToHome={showLanding}
                onFileSelect={selectFile}
              />
            </motion.div>
          )}

          {currentView === 'share' && activeShareId && (
            <motion.div
              key="share"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.35 }}
              className="w-full"
            >
              <ShareView
                shareId={activeShareId}
                onHomeClick={showLanding}
                onCreateYourOwnClick={() => openStudio('builder')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

