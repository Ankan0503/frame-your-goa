import React, { useState, useRef } from 'react';

interface UploadFrameProps {
  onFileSelect?: (file: File) => void;
}

export const UploadFrame: React.FC<UploadFrameProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect?.(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelect?.(file);
      }
    }
  };

  const validateFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'heic', 'heif'];
    return validTypes.includes(file.type) || (extension && validExtensions.includes(extension));
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Border & background color resolution based on states
  let innerBg = '#F8F2E6';
  let innerBorderColor = '#173F32';
  let iconColor = '#0B6839';

  if (isDragging) {
    innerBg = '#FFF1EF';
    innerBorderColor = '#F05A68';
    iconColor = '#F05A68';
  } else if (isHovered) {
    innerBg = '#FAF4E9';
    innerBorderColor = '#0B6839';
    iconColor = '#0B6839';
  }

  return (
    <div className="relative overflow-visible w-full max-w-[320px] min-[380px]:max-w-[340px] sm:max-w-[420px] lg:w-[min(420px,36vw)] xl:w-[420px] select-none mx-auto lg:mx-0">
      {/* DECORATIVE GOA BACKGROUND (BEHIND UPLOAD CARD) */}
      <picture className="absolute z-0 pointer-events-none top-[-55px] sm:top-[-70px] lg:top-[-75px] xl:top-[-80px] left-1/2 -translate-x-1/2 w-[420px] min-[380px]:w-[480px] sm:w-[580px] lg:w-[640px] xl:w-[760px] block">
        <source type="image/avif" srcSet="/assets/goa-background-decor.avif" />
        <img
          src="/assets/goa-background-decor.avif"
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="w-full h-auto object-contain pointer-events-none"
          loading="lazy"
        />
      </picture>

      {/* DECORATIVE CATHEDRAL TOP (BEHIND CARD, ABOVE GOA BACKGROUND) */}
      <picture className="absolute z-1 pointer-events-none left-1/2 -translate-x-1/2 top-[-90px] min-[380px]:top-[-110px] sm:top-[-150px] lg:top-[-220px] xl:top-[-275px] w-[200px] min-[380px]:w-[240px] sm:w-[320px] lg:w-[360px] xl:w-[420px] scale-80 origin-bottom block">
        <source type="image/avif" srcSet="/assets/goa-cathedral-top-bell-transparent.avif" />
        <img
          src="/assets/goa-cathedral-top-bell-transparent.avif"
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="w-full h-auto object-contain pointer-events-none"
          loading="lazy"
        />
      </picture>

      {/* OUTER CARD */}
      <div
        className="w-full h-[360px] min-[380px]:h-[400px] sm:h-[500px] bg-[#F8F2E6] border border-[#D8CDB9] rounded-[18px] p-[14px] min-[380px]:p-[16px] sm:p-[24px] relative z-2 transition-all duration-180 ease-out"
        style={{
          boxShadow: '0 12px 28px rgba(23, 63, 50, 0.08)'
        }}
      >
        {/* Hidden File Input */}
        <input
          type="file"
          id="landing-file-input"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif"
          className="hidden"
        />

        {/* INNER DROP ZONE */}
        <div
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="w-full h-full rounded-[15px] cursor-pointer flex flex-col items-center justify-center p-3 sm:p-4 relative transition-colors duration-180 ease-out overflow-hidden"
          style={{ backgroundColor: innerBg }}
        >
          {/* SVG Dashed Border overlay for precise 12px dash / 10px gap rendering */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="1"
              y="1"
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              rx="14"
              ry="14"
              fill="none"
              stroke={innerBorderColor}
              strokeWidth="2"
              strokeDasharray="12 10"
              className="transition-colors duration-180 ease-out"
            />
          </svg>

          {/* CONTENT COMPOSITION */}
          <div className="flex flex-col items-center justify-center z-10 text-center pointer-events-none">
            {/* UPLOAD ICON */}
            <div className="mb-[14px] sm:mb-[20px] transition-colors duration-180 ease-out" style={{ color: iconColor }}>
              <svg
                width="68"
                height="68"
                viewBox="0 0 68 68"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[48px] h-[48px] sm:w-[60px] sm:h-[60px]"
              >
                {/* Rounded Cloud Outline */}
                <path
                  d="M 18 44 C 11.5 44 6.5 39 6.5 32.5 C 6.5 26.2 11 21.2 17.5 20.8 C 19.5 13 26.5 7.5 35 7.5 C 44 7.5 51.5 13.8 53 21.8 C 58.5 22.8 62.5 27.5 62.5 33 C 62.5 39.2 57.5 44 51 44"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Upward Arrow from center bottom */}
                <path
                  d="M 34 56 V 28 M 23 38 L 34 27 L 45 38"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* PRIMARY TEXT */}
            <h2 className="font-['Oswald'] font-semibold text-[20px] sm:text-[24px] text-[#173F32] uppercase tracking-[0.015em] leading-[1.1] mb-[10px] sm:mb-[12px]">
              DROP YOUR PHOTO HERE
            </h2>

            {/* SECONDARY TEXT */}
            <p className="font-mono font-normal text-[13px] sm:text-[15px] text-[#173F32] tracking-[0.01em] leading-[1.4] mb-[16px] sm:mb-[20px]">
              or click to upload
            </p>

            {/* DECORATIVE DIVIDER */}
            <div className="mb-[14px] sm:mb-[18px]">
              <svg
                width="42"
                height="2"
                viewBox="0 0 42 2"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="block"
              >
                <path
                  d="M 1 1 Q 21 1.8 41 1"
                  stroke="#6B9142"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* SUPPORTED FORMATS */}
            <p className="font-mono font-medium text-[12px] sm:text-[14px] text-[#173F32] tracking-[0.04em] flex items-center justify-center gap-2 sm:gap-2.5">
              <span>JPG</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#173F32] inline-block opacity-80" />
              <span>PNG</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#173F32] inline-block opacity-80" />
              <span>HEIC</span>
            </p>
          </div>
        </div>
      </div>

      {/* DECORATIVE MINT GOA SCOOTER (FOREGROUND OVERLAY) */}
      <div
        className="absolute z-10 pointer-events-none -left-[70px] min-[400px]:-left-[90px] sm:-left-[130px] lg:-left-[190px] -bottom-[30px] min-[400px]:-bottom-[35px] sm:-bottom-[45px] lg:-bottom-[40px] w-[190px] min-[400px]:w-[230px] sm:w-[310px] lg:w-[390px] flex flex-col items-center"
        aria-hidden="true"
      >
        {/* Subtle warm/green halo glow behind the scooter */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none -z-10"
          style={{
            background: 'rgba(107, 145, 66, 0.12)',
            filter: 'blur(20px)',
            transform: 'scale(1.2)',
            opacity: 0.12
          }}
        />

        {/* Scooter Image Asset */}
        <picture>
          <source type="image/avif" srcSet="/assets/goa-scooter.avif" />
          <img
            src="/assets/goa-scooter.avif"
            alt="Mint Goa Scooter"
            referrerPolicy="no-referrer"
            className="w-full h-auto object-contain pointer-events-none"
            style={{
              transform: 'none',
              filter: 'drop-shadow(0px 8px 16px rgba(23, 63, 50, 0.12))'
            }}
            loading="lazy"
          />
        </picture>

        {/* Grounding Shadow beneath wheels */}
        <div
          className="w-[85%] h-[10px] sm:h-[12px] rounded-full mt-[-8px] sm:mt-[-10px] pointer-events-none"
          style={{
            background: 'rgba(23, 63, 50, 0.10)',
            filter: 'blur(14px)',
            opacity: 0.20
          }}
        />

        {/* Tiny Dust & Stone Detail Particles */}
        <div className="relative w-full h-[6px] mt-[-2px] pointer-events-none overflow-visible flex items-center justify-center gap-1.5 sm:gap-2 opacity-35">
          <span className="w-[3px] sm:w-[4px] h-[2px] sm:h-[3px] rounded-full bg-[#C8A878] inline-block" />
          <span className="w-[2px] sm:w-[3px] h-[2px] sm:h-[3px] rounded-full bg-[#B79A70] inline-block" />
          <span className="w-[4px] sm:w-[5px] h-[2px] rounded-full bg-[#C8A878] inline-block" />
          <span className="w-[2px] sm:w-[3px] h-[3px] sm:h-[4px] rounded-full bg-[#B79A70] inline-block" />
          <span className="w-[2px] h-[2px] rounded-full bg-[#C8A878] inline-block" />
          <span className="w-[3px] sm:w-[4px] h-[2px] sm:h-[3px] rounded-full bg-[#B79A70] inline-block" />
        </div>
      </div>

      {/* HIBISCUS FLOWER & LEAVES (Placed beside the back wheel, overlapping the card border) */}
      <div
        className="absolute z-20 pointer-events-none left-[80px] min-[400px]:left-[100px] sm:left-[150px] lg:left-[140px] -bottom-[15px] sm:-bottom-[20px] w-[60px] min-[400px]:w-[70px] sm:w-[95px] lg:w-[120px]"
        aria-hidden="true"
        style={{
          filter: 'drop-shadow(0px 6px 14px rgba(23, 63, 50, 0.18))'
        }}
      >
        <picture>
          <source type="image/avif" srcSet="/assets/hibiscus-flower-leaves.avif" />
          <img
            src="/assets/hibiscus-flower-leaves.avif"
            alt="Hibiscus Flower and Leaves"
            referrerPolicy="no-referrer"
            className="w-full h-auto object-contain pointer-events-none"
            loading="lazy"
          />
        </picture>
      </div>
    </div>
  );
};
