import React from "react";

interface BadgeAttachmentProps {
    /** Optional custom background card color for the matching top edge rim (Defaults to #FAF6EE) */
    cardColor?: string;
    /** Optional custom styling classes */
    className?: string;
}

/**
 * Front-facing portion of the badge attachment system.
 * Positioned absolutely at the top of the card assembly, overlapping the slot.
 */
export const BadgeAttachment: React.FC<BadgeAttachmentProps> = ({
    cardColor = "#FAF6EE",
    className = "",
}) => {
    return (
        <div
            id="badge-attachment-system"
            className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center select-none z-30 pointer-events-none ${className}`}
            style={{
                // Bottom edge (clamp tip) sits 2.8% + 9px below the card top, so the
                // clamp mechanism always enters the punched slot regardless of card width
                bottom: "calc(97.2% - 9px)",
            }}
        >
            {/* 1. Vertical Lanyard Strap */}
            <div
                id="lanyard-strap"
                className="w-5 h-[150px] lg:h-[70px] relative flex items-end justify-center overflow-hidden rounded-b-[3px]"
                style={{
                    backgroundImage: 'linear-gradient(90deg, #053229 0%, #063F35 45%, #084c40 55%, #053229 100%)',
                    boxShadow: 'inset 1px 0 2px rgba(255,255,255,0.06), inset -1px 0 2px rgba(0,0,0,0.4), 0 3px 6px rgba(0,0,0,0.15)'
                }}
            >
                {/* Subtle horizontal weave fabric texture */}
                <div className="absolute inset-0 opacity-[0.22] bg-[repeating-linear-gradient(45deg,#000,#000_1px,transparent_1px,transparent_3px)] pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.15] bg-[repeating-linear-gradient(-45deg,#000,#000_1px,transparent_1px,transparent_3px)] pointer-events-none" />

                {/* Natural folder/compression soft dark-gradient shadow at connection point */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/50 to-transparent blur-[0.5px]" />
            </div>

            {/* 2. Small Dark Gunmetal/Charcoal Connector Ring */}
            <div
                id="gunmetal-connector-ring"
                className="w-7 h-[18px] -mt-1 bg-gradient-to-b from-[#2e3431] via-[#252A27] to-[#121413] rounded-full border border-[#1b1e1c] relative flex items-center justify-center shadow-[0_3px_5px_rgba(0,0,0,0.22)]"
            >
                {/* Dynamic inner metal hole shine */}
                <div className="w-4 h-2 bg-gradient-to-t from-[#121413] to-[#252A27] rounded-full opacity-90 shadow-inner" />
                {/* Highlight along upper edge */}
                <div className="absolute top-[1px] left-1/4 right-1/4 h-[1px] bg-white/20 blur-[0.5px]" />
            </div>

            {/* 3. Molded Matte Forest Green Plastic Clip Housing */}
            <div
                id="badge-clip-body"
                className="w-8 h-11 -mt-0.5 bg-gradient-to-b from-[#0e5548] via-[#073f35] to-[#052b24] rounded-[8px] border border-[#062c27] relative shadow-[0_4px_8px_rgba(0,0,0,0.2)] flex flex-col items-center justify-between py-1.5"
            >
                {/* Embedded Industrial Bevel */}
                <div className="w-[22px] h-[16px] bg-[#0c4a3e] border border-[#042821] rounded-[4px] shadow-inner opacity-95 relative overflow-hidden">
                    <div className="absolute top-[1px] left-0 right-0 h-[1px] bg-white/10" />
                </div>

                {/* Lower clamp mechanism that extends downward and loops through the card slot */}
                <div className="w-4 h-[14px] bg-gradient-to-b from-[#052b24] to-[#031d18] rounded-b-[3px] border-t border-black/30 shadow-sm relative">
                    <div className="absolute inset-x-1 top-0 h-[1.5px] bg-[#0c4e41] rounded-full opacity-60" />
                </div>
            </div>
        </div>
    );
};

/**
 * Back-facing portion of the badge attachment clip.
 * Positioned absolutely behind the card body, visible only through the transparent card slot.
 */
export const BadgeAttachmentBack: React.FC = () => {
    return (
        <div
            id="badge-attachment-back"
            className="absolute left-1/2 -translate-x-1/2 z-0 pointer-events-none"
            style={{
                top: "12px", // Starts just above slot top edge (14px)
                width: "18px", // Slightly wider than front clamp (16px) for an organic lip overlap
                height: "26px", // Spans down past slot bottom edge (36px)
            }}
        >
            {/* Back side of the plastic clip passing behind the card stock */}
            <div
                className="w-full h-full bg-gradient-to-b from-[#031d18] via-[#021411] to-[#010807] rounded-[4px] border-x border-b border-[#010908] relative"
                style={{
                    boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.05)',
                }}
            >
                {/* Realistic drop shadow of the card paper onto the plastic backing loop */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-black/65 blur-[0.5px]" />

                {/* Soft plastic ambient sheen highlight */}
                <div className="absolute inset-x-[2px] bottom-[2px] h-[3px] bg-white/5 rounded-b-[2px]" />
            </div>
        </div>
    );
};

