import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { GeneratorSection } from './components/GeneratorSection';
import { CreateUploadPanel } from './components/CreateUploadPanel';
import { useImageUpload } from './hooks/useImageUpload';

type View = 'landing' | 'create' | 'generator';
const viewFromPath = (): View => window.location.pathname === '/create' ? 'create' : 'landing';

export default function App() {
  const [currentView, setCurrentView] = useState<View>(viewFromPath);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const { image, error, isProcessing, selectFile, reset } = useImageUpload();

  // Control scroll: lock on landing (both axes), unlock on create/generator.
  // Must set overflow on both <html> and <body> since <html> is the real scroll container.
  useEffect(() => {
    const isLanding = currentView === 'landing';
    const lock = isLanding ? 'hidden' : '';
    document.documentElement.style.overflow = lock;
    document.documentElement.style.overflowX = lock;
    document.documentElement.style.overflowY = lock;
    document.body.style.overflow = lock;
    document.body.style.overflowX = lock;
    document.body.style.overflowY = lock;
    return () => {
      document.documentElement.style.overflow = '';
      document.documentElement.style.overflowX = '';
      document.documentElement.style.overflowY = '';
      document.body.style.overflow = '';
      document.body.style.overflowX = '';
      document.body.style.overflowY = '';
    };
  }, [currentView]);

  useEffect(() => {
    const onPopState = () => {
      setDirection('backward');
      setCurrentView(viewFromPath());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const showCreate = () => {
    setDirection('forward');
    setCurrentView('create');
    if (window.location.pathname !== '/create') window.history.pushState({}, '', '/create');
  };

  const showLanding = () => {
    setDirection('backward');
    setCurrentView('landing');
    if (window.location.pathname !== '/') window.history.pushState({}, '', '/');
  };

  const handleFileSelect = async (file: File) => {
    if (currentView !== 'create') showCreate();
    const uploaded = await selectFile(file);
    if (uploaded) {
      setDirection('forward');
      setCurrentView('generator');
    }
  };

  const handleBackToUpload = () => {
    reset();
    showCreate();
  };

  const slideVariants = {
    enter: (dir: 'forward' | 'backward') => ({ x: dir === 'forward' ? '100vw' : '-100vw', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 'forward' | 'backward') => ({ x: dir === 'forward' ? '-100vw' : '100vw', opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-[#F6F0E3] text-[#173F32] font-mono selection:bg-[#075B3A] selection:text-[#F6F0E3] bg-paper-noise">
      <Navbar />
      <main className="relative w-full">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          {currentView === 'landing' && <motion.div key="landing" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.45 }} className="w-full"><HeroSection onFileSelect={handleFileSelect} onCreateClick={showCreate} /></motion.div>}
          {currentView === 'create' && <motion.div key="create" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.35 }} className="w-full"><CreateUploadPanel isProcessing={isProcessing} error={error} onFileSelect={handleFileSelect} onBack={showLanding} /></motion.div>}
          {currentView === 'generator' && image && <motion.div key="generator" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.45 }} className="w-full"><GeneratorSection uploadedImageUrl={image.previewUrl} onBackToUpload={handleBackToUpload} /></motion.div>}
        </AnimatePresence>
      </main>
    </div>
  );
}
