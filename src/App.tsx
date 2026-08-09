import React from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';

export default function App() {
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-y-hidden bg-[#F6F0E3] text-[#173F32] font-mono selection:bg-[#075B3A] selection:text-[#F6F0E3] bg-paper-noise overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
      </main>
    </div>
  );
}

