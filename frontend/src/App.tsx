import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { GeneratorSection } from './components/GeneratorSection';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'generator'>('landing');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const handleFileSelect = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setUploadedImageUrl(imageUrl);
    setDirection('forward');
    setCurrentView('generator');
  };

  const handleCreateClick = () => {
    if (uploadedImageUrl) {
      setDirection('forward');
      setCurrentView('generator');
    } else {
      const fileInput = document.getElementById('landing-file-input');
      fileInput?.click();
    }
  };

  const handleBackToUpload = () => {
    setDirection('backward');
    setCurrentView('landing');
  };

  const slideVariants = {
    enter: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? '100vw' : '-100vw',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? '-100vw' : '100vw',
      opacity: 0,
    }),
  };

  const slideTransition = {
    type: 'tween',
    ease: [0.25, 1, 0.5, 1], // refined easeOutQuart transition curve
    duration: 0.5,
  };

  return (
    <div className={`min-h-screen bg-[#F6F0E3] text-[#173F32] font-mono selection:bg-[#075B3A] selection:text-[#F6F0E3] bg-paper-noise overflow-x-hidden ${currentView === 'landing' ? 'lg:h-screen lg:overflow-y-hidden' : ''}`}>
      <Navbar />
      <main className="relative w-full">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          {currentView === 'landing' ? (
            <motion.div
              key="landing"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="w-full"
            >
              <HeroSection
                onFileSelect={handleFileSelect}
                onCreateClick={handleCreateClick}
              />
            </motion.div>
          ) : (
            uploadedImageUrl && (
              <motion.div
                key="generator"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="w-full"
              >
                <GeneratorSection
                  uploadedImageUrl={uploadedImageUrl}
                  onBackToUpload={handleBackToUpload}
                />
              </motion.div>
            )
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}


