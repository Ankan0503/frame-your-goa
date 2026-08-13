import React from 'react';
import { BadgeAttachment, BadgeAttachmentBack } from './BadgeAttachment';
import { type SmartCropResult } from '../lib/image/smartCrop';

export interface IdCardProps {
    /** Optional profile photo URL for future dynamic use */
    photo?: string;
    /** Optional smart crop transform to apply to the photo (zoom/offset) */
    cropResult?: SmartCropResult;
    /** Optional name for future dynamic use */
    name?: string;
    /** Optional tech stack for future dynamic use */
    stack?: string;
    /** Optional role for future dynamic use */
    role?: string;
    /** Optional pass type for future dynamic use */
    passType?: string;
    /** Optional builder class for future dynamic use */
    builderClass?: string;
    /** Optional unique builder ID (e.g. "HHG-OO-0000") for future dynamic use */
    builderId?: string;
    /** Optional QR code data URL to render in the card footer */
    qrDataUrl?: string;
    /** Optional orientation to support portrait/landscape layout changes later */
    orientation?: 'portrait' | 'landscape';
    /** Optional custom aspect ratio if adjusted later (defaults to 4/5) */
    aspectRatio?: string;
    theme?: 'theme1' | 'theme2';
}

export const IdCard: React.FC<IdCardProps> = ({
    photo,
    cropResult,
    name,
    stack,
    role,
    passType,
    builderClass,
    builderId,
    qrDataUrl,
    orientation = 'portrait',
    aspectRatio = '4/5',
    theme = 'theme1',
}) => {
    /* QR + Builder ID appear only after GENERATE issues a real ID. The card keeps its
       original aspect ratio — the footer fits inside without growing the card. */
    const showFooter = Boolean(qrDataUrl && builderId);
    const cardAspect = aspectRatio;

    /* ─── MANUAL LAYOUT TUNING ─────────────────────────────────────────────
       The card keeps the SAME size in both states (4/5). After GENERATE the QR
       footer appears, so the first branch lets you re-fit the photo/text to make
       room for it. Tune the values freely:
         photoPosY    → % of card HEIGHT (bigger = photo lower)
         photoWidth   → % of card WIDTH (photo size)
         detailsPadding → space below the name/badge block
       Tweak the numbers, save, and refresh to see the change. */
    const LAYOUT = showFooter
        ? {
            logoWidth: '30%',
            logoPadding: '8% 0 0 7%',
            photoPosY: '27.5%',
            photoWidth: '45%',
            detailsPadding: '0 8% 0%',
        }
        : {
            logoWidth: '30%',
            logoPadding: '8% 0 0 7%',
            photoPosY: '27.5%',
            photoWidth: '45%',
            detailsPadding: '0 8% 12%',
        };
    /* ───────────────────────────────────────────────────────────────────── */

    /* Enhanced 3D multi-layer depth shadow for card feeling */
    const slotMask = `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAnIGhlaWdodD0nMTAwJyB2aWV3Qm94PScwIDAgMTAwIDEyNScgcHJlc2VydmVBc3BlY3RSYXRpbz0nbm9uZSc+PG1hc2sgaWQ9J20nPjxyZWN0IHdpZHRoPScxMDAnIGhlaWdodD0nMTI1JyBmaWxsPSd3aGl0ZScvPjxyZWN0IHg9JzQyJyB5PSczLjUnIHdpZHRoPScxNicgaGVpZ2h0PSc0LjInIHJ4PScyLjEnIGZpbGw9J2JsYWNrJy8+PC9tYXNrPjxyZWN0IHdpZHRoPScxMDAnIGhlaWdodD0nMTI1JyBmaWxsPSd3aGl0ZScgbWFzaz0ndXJsKCNtKScvPjwvc3ZnPg==")`;

    const cardShadow = {
        boxShadow: `
            inset 1px 0 0 rgba(255, 255, 255, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.6),
            inset 0 2px 1px rgba(255, 255, 255, 0.9),
            inset 0 -2px 2px rgba(0, 0, 0, 0.3),
            inset -1px 0 1px rgba(0, 0, 0, 0.15)
        `,
    };

    return (
        <div
            id="id-card-badge-container"
            className="w-full flex flex-col justify-center items-center pt-0 px-4 pb-4 min-h-[460px] relative select-none"
        >
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CARD ASSEMBLY CONTAINER
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div
                id="physical-id-card-assembly"
                className="relative z-10 w-full max-w-[420px] flex flex-col items-center mt-5"
            >
                {/* 1. BACK ATTACHMENT LAYER (Sits behind the card body, visible through the slot cutout) */}
                <BadgeAttachmentBack />

                {/* 1.5. Background Hole Simulator (visible through the cutout, renders the website background and shadows inside it) */}
                <div
                    id="punched-card-slot-bg"
                    className="absolute left-1/2 -translate-x-1/2 w-[16%] aspect-[3.8/1] rounded-full z-0 pointer-events-none overflow-hidden"
                    style={{
                        top: '2.8%',
                        backgroundColor: '#F6F0E3',
                        boxShadow: `
                            inset 0 4px 8px rgba(0,0,0,0.45),
                            inset 0 1px 2px rgba(0,0,0,0.3),
                            0 0 0 1px rgba(23,63,50,0.08)
                        `,
                    }}
                >
                    <div className="absolute inset-0 bg-paper-noise opacity-90" />
                    {/* Inner paper edge highlight - shows cardstock thickness */}
                    <div className="absolute inset-[1px] rounded-full border-t border-white/20 border-l border-white/10 pointer-events-none" />
                    {/* Subtle radial gradient for depth curvature */}
                    <div className="absolute inset-0 rounded-full bg-gradient-radial from-transparent via-transparent to-black/20 pointer-events-none" />
                    {/* Lanyard strap shadow cast into the hole */}
                    <div
                        className="absolute left-1/2 -translate-x-1/2 w-5 h-8 rounded-[3px] pointer-events-none"
                        style={{
                            top: '80%',
                            background: 'linear-gradient(180deg, rgba(5,50,41,0.55) 0%, rgba(5,50,41,0.2) 60%, transparent 100%)',
                            filter: 'blur(1.5px)',
                            transform: 'translateX(-50%) translateY(-50%)',
                        }}
                    />
                </div>

                {/* 2. Beveled Top Rim representing 3-4mm physical card thickness */}
                <div
                    id="card-top-thickness-rim"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[93%] h-[6px] rounded-t-[30px] z-20 border-b border-black/15 shadow-inner"
                    style={{
                        background: 'linear-gradient(180deg, #F0E6D2 0%, #D9CCB4 55%, #B9A988 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.25)',
                    }}
                />

                {/* 2.5. Card shell - renders 3D edge faces (cardstock thickness) + drop shadow. Unmasked so they show */}
                <div
                    className="relative w-full rounded-[30px] z-10"
                    style={{
                        boxShadow: `
                            2px 3px 0 0 rgba(238, 230, 210, 1),
                            2px 3px 0 1px rgba(160, 145, 118, 0.95),
                            2px 3px 0 2px rgba(255, 255, 255, 0.2),
                            -2px 3px 0 0 rgba(238, 230, 210, 1),
                            -2px 3px 0 1px rgba(160, 145, 118, 0.95),
                            -2px 3px 0 2px rgba(255, 255, 255, 0.2),
                            6px 10px 18px -4px rgba(0, 0, 0, 0.5),
                            14px 22px 50px -12px rgba(0, 0, 0, 0.6),
                            30px 45px 90px -20px rgba(0, 0, 0, 0.5),
                            -6px 0 18px -6px rgba(0, 0, 0, 0.4),
                            -14px 16px 40px -14px rgba(0, 0, 0, 0.45)
                        `,
                    }}
                >
                    <div
                        id="physical-id-card"
                        className="relative overflow-hidden w-full rounded-[30px] bg-[#FAF6EE]"
                        style={{
                            aspectRatio: cardAspect,
                            ...cardShadow,
                            maskImage: slotMask,
                            WebkitMaskImage: slotMask,
                            maskRepeat: 'no-repeat',
                            WebkitMaskRepeat: 'no-repeat',
                            maskSize: '100% 100%',
                            WebkitMaskSize: '100% 100%',
                            maskPosition: '0 0',
                            WebkitMaskPosition: '0 0',
                        }}
                    >
                        {/* Background Layer: Loaded locally, fills entire card, clipped perfectly */}
                        <img
                            id="id-card-background-image"
                            src={theme === 'theme2' ? '/assets/id-image-2.avif' : '/assets/id-image-1.avif'}
                            alt="Hacker House Goa 2026 ID card background"
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover object-center z-0 block"
                        />



                        {/* Content Layer: Sits relative above background with absolute children capability */}
                        <div
                            id="id-card-content-layer"
                            className="relative z-10 w-full h-full flex flex-col justify-between pointer-events-none"
                        >
                            {/* Conceptual sub-layers structured for future dynamic details */}

                            {/* Logo Area: Hacker House Goa logo, top-left, large */}
                            <div id="id-card-logo-area" className="w-full relative">
                                <img
                                    src="/assets/hacker-house-goa-logo.svg"
                                    alt="Hacker House Goa 2026"
                                    referrerPolicy="no-referrer"
                                    className="block h-auto object-contain"
                                    style={{ width: LAYOUT.logoWidth, padding: LAYOUT.logoPadding }}
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        if (target.src.includes('/assets/hacker-house-goa-logo.svg')) {
                                            target.src = '/hacker-house-goa-logo.svg';
                                        } else if (!target.src.endsWith('.png')) {
                                            target.src = '/assets/hacker-house-goa-logo.png';
                                        }
                                    }}
                                />
                            </div>

                            {/* Profile Photo Area: circular photo anchored at a fixed height so text below doesn't shift it */}
                            {photo && (
                                <div
                                    id="id-card-profile-photo-area"
                                    className="absolute left-0 right-0 w-full flex justify-center"
                                    style={{ top: LAYOUT.photoPosY }}
                                >
                                    <div
                                        className="aspect-square rounded-full overflow-hidden"
                                        style={{
                                            width: LAYOUT.photoWidth,
                                            border: '2px solid rgba(255,255,255,0.95)',
                                            boxShadow: '0 4px 18px rgba(0,0,0,0.35)',
                                        }}
                                    >
                                        <img
                                            src={photo}
                                            alt="Builder"
                                            referrerPolicy="no-referrer"
                                            className="w-full h-full object-cover transition-all duration-200 ease-out"
                                            style={cropResult?.transform.cssStyle || { objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* User Details Area: grouping Name, Role, Metadata, and Footer */}
                            <div
                                id="id-card-details-group"
                                className="w-full flex flex-col items-center gap-[0.4em] text-center"
                                style={{ padding: LAYOUT.detailsPadding }}
                            >
                                {/* Name Area */}
                                <div id="id-card-name-area" className="w-full">
                                    <p
                                        className={`font-['Calistoga'] font-bold uppercase leading-tight tracking-wide ${theme === 'theme2' ? 'text-[#F05A68]' : 'text-[#173F32]'}`}
                                        style={{
                                            fontSize: 'clamp(1.15rem, 6.4vw, 2.2rem)',
                                            textShadow: theme === 'theme2' ? '0 1px 3px rgba(23,63,50,0.15)' : '0 1px 3px rgba(255,255,255,0.7)',
                                        }}
                                    >
                                        {name || 'BUILDER NAME'}
                                    </p>
                                </div>

                                {/* Role / Stack Area */}
                                <div id="id-card-role-area" className="w-full">
                                    <p
                                        className={`font-['Oswald'] font-semibold uppercase tracking-[0.14em] ${theme === 'theme2' ? 'text-[#173F32]' : 'text-[#F05A68]'}`}
                                        style={{
                                            fontSize: 'clamp(0.65rem, 3vw, 0.95rem)',
                                            textShadow: '0 1px 3px rgba(255,255,255,0.7)',
                                        }}
                                    >
                                        {stack || 'FULLSTACK DEV'}
                                    </p>
                                </div>

                                {/* Metadata Area: Pass Type / Builder Class badge */}
                                <div id="id-card-metadata-area" className="w-full">
                                    <span
                                        className="inline-block px-[0.8em] py-[0.25em] rounded-full font-mono font-bold uppercase tracking-[0.12em] text-[#F2A900]"
                                        style={{
                                            fontSize: 'clamp(0.55rem, 2.6vw, 0.8rem)',
                                            backgroundColor: 'rgba(23,63,50,0.92)',
                                        }}
                                    >
                                        {passType || builderClass || 'BUILDER PASS 2026'}
                                    </span>
                                </div>

                                {/* Footer Area: QR (left) + Builder ID (right). Only shown after GENERATE issues a real ID. */}
                                {showFooter ? (
                                    <div id="id-card-footer-area" className="w-full flex items-center justify-between gap-2 px-1">
                                        <img
                                            src={qrDataUrl}
                                            alt="Builder pass QR"
                                            className="w-15 h-15 object-contain shrink-0 -translate-x-4 -translate-y-28 border-2 border-[#173F32] bg-white"
                                        />
                                        <div className="flex flex-col items-start leading-tight text-left -translate-x-65 -translate-y-10">
                                            <span className="font-mono font-bold text-[0.7rem] tracking-[0.2em] text-[#2E6B4F]">
                                                BUILDER ID
                                            </span>
                                            <span className="font-mono font-bold text-[0.7rem] sm:text-[0.7rem] tracking-[0.15em] text-[#173F32]">
                                                {builderId}
                                            </span>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* Semi-gloss reflection overlay to make it look like laminated plastic */}
                        <div
                            className="absolute inset-0 z-20 pointer-events-none opacity-[0.06] bg-gradient-to-tr from-transparent via-white to-white"
                            style={{
                                mixBlendMode: 'overlay',
                            }}
                        />

                        {/* Thin white portion at the bottom with #FrameInGoa at the center */}
                        <div
                            id="id-card-bottom-strip"
                            className="absolute bottom-0 left-0 right-0 h-6 bg-white border-t border-[#173F32]/10 flex items-center justify-center z-20 pointer-events-none"
                        >
                            <span className="font-mono text-[13px] sm:text-[14px] font-bold tracking-wider text-[#075B3A] uppercase">
                                #FrameInGoa
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3.5. Punched Card Slot Overlay (Placed outside the mask so its inner shadow and border render correctly) */}
                <div
                    id="punched-card-slot-wrapper"
                    className="absolute left-1/2 -translate-x-1/2 w-[16%] aspect-[3.8/1] rounded-full z-20 pointer-events-none border-2 border-[#173F32]/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                    style={{
                        top: '2.8%',
                        // Bevel effect around the physically cut edge of the cardstock
                        boxShadow: `
                            inset 0 4px 8px rgba(0,0,0,0.5),
                            inset 0 -1px 2px rgba(255,255,255,0.1),
                            0 0 0 1px rgba(23,45,41,0.2),
                            0 4px 12px rgba(0,0,0,0.2)
                        `,
                    }}
                >
                    {/* Subtle inner card thickness bezel showing the warm cardstock inside the cutout */}
                    <div className="absolute inset-[1px] rounded-full border border-[#FAF6EE]/20 pointer-events-none" />
                    {/* Upper inner edge catch light - simulates paper fiber highlight */}
                    <div className="absolute top-[1px] left-[1px] right-[1px] h-[2px] bg-gradient-to-b from-white/30 to-transparent rounded-full pointer-events-none" />
                    {/* Lower inner edge shadow - paper thickness depth */}
                    <div className="absolute bottom-[1px] left-[1px] right-[1px] h-[2px] bg-gradient-to-t from-black/40 to-transparent rounded-full pointer-events-none" />
                    {/* Side edge shadows for 3D paper thickness */}
                    <div className="absolute left-[1px] top-[1px] bottom-[1px] w-[2px] bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />
                    <div className="absolute right-[1px] top-[1px] bottom-[1px] w-[2px] bg-gradient-to-l from-black/30 to-transparent pointer-events-none" />
                </div>

                {/* 4. FRONT ATTACHMENT LAYER (Positioned on top of the card and overlapping the slot) */}
                <BadgeAttachment />
            </div>
        </div>
    );
};

