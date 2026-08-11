import React from 'react';
import { type MultiBuilderTeamFrameData, type TeamLayout } from '../lib/image/renderTeamFrame';
import { type PfpStyle } from '../lib/pfp/pfpCanvasExport';

interface TeamFramePreviewProps {
  data: MultiBuilderTeamFrameData;
  pfpStyle?: PfpStyle;
}

export const TeamFramePreview: React.FC<TeamFramePreviewProps> = ({ data, pfpStyle = 'signal' }) => {
  const { teamName, projectName, layout, builders } = data;
  const count = Math.min(Math.max(builders.length, 1), 3);

  return (
    <div className="w-full max-w-[800px] mx-auto p-2 sm:p-4">
      {/* POSTER CONTAINER */}
      <div
        className="w-full aspect-[4/3] bg-[#F6F0E3] border-[6px] sm:border-[10px] border-[#173F32] rounded-[24px] p-4 sm:p-6 shadow-2xl flex flex-col justify-between select-none relative overflow-hidden"
        style={{ boxShadow: '0 25px 60px rgba(23, 63, 50, 0.2)' }}
      >
        {/* TOP HEADER BANNER */}
        <div className="w-full bg-[#173F32] text-[#F6F0E3] rounded-[12px] p-2.5 sm:p-3.5 flex items-center justify-between mb-3 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-mono font-bold text-[14px] sm:text-[20px] text-[#F2A900]">
              HH GOA 2026
            </span>
            <span className="font-mono font-semibold text-[10px] sm:text-[12px] text-[#F05A68] hidden min-[480px]:inline">
              TEAM BUILDER MODE
            </span>
          </div>
          <span className="font-['Oswald'] font-bold text-[11px] sm:text-[14px] text-[#F6F0E3] uppercase tracking-wider">
            GOA, INDIA • 28—31 OCT
          </span>
        </div>

        {/* MIDDLE CONTENT: BUILDER CARDS GRID */}
        <div className="w-full flex-1 relative overflow-hidden my-1">
          {/* LAYOUT A: EQUAL COLUMNS */}
          {layout === 'layout-a' && (
            <div
              className={`w-full h-full grid gap-2 sm:gap-4 ${
                count === 1
                  ? 'grid-cols-1'
                  : count === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-3'
              }`}
            >
              {builders.slice(0, 3).map((builder, idx) => (
                <BuilderPreviewCard key={builder.id || idx} builder={builder} index={idx + 1} />
              ))}
            </div>
          )}

          {/* LAYOUT B: FEATURED LEFT + STACKED RIGHT */}
          {layout === 'layout-b' && (
            <div className="w-full h-full flex gap-2 sm:gap-4">
              {/* Featured Main Builder */}
              <div className="w-[58%] h-full">
                {builders[0] && (
                  <BuilderPreviewCard builder={builders[0]} index={1} isFeatured />
                )}
              </div>

              {/* Stacked Side Builders */}
              <div className="w-[42%] h-full flex flex-col gap-2 sm:gap-4">
                {builders.slice(1, 3).map((builder, idx) => (
                  <div key={builder.id || idx} className="w-full flex-1">
                    <BuilderPreviewCard builder={builder} index={idx + 2} />
                  </div>
                ))}
                {count === 1 && (
                  <div className="w-full h-full border-2 border-dashed border-[#173F32]/30 rounded-[12px] flex items-center justify-center p-2 text-center text-[#173F32]/40 font-mono text-[11px]">
                    + Add Builder 02
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LAYOUT C: EDITORIAL ASYMMETRIC */}
          {layout === 'layout-c' && (
            <div className="w-full h-full flex gap-2 sm:gap-3">
              {count === 1 && (
                <div className="w-full h-full">
                  <BuilderPreviewCard builder={builders[0]} index={1} isFeatured />
                </div>
              )}

              {count === 2 && (
                <>
                  <div className="w-1/2 h-[92%] self-start">
                    <BuilderPreviewCard builder={builders[0]} index={1} isFeatured />
                  </div>
                  <div className="w-1/2 h-[92%] self-end">
                    <BuilderPreviewCard builder={builders[1]} index={2} />
                  </div>
                </>
              )}

              {count === 3 && (
                <>
                  <div className="w-[42%] h-full">
                    <BuilderPreviewCard builder={builders[0]} index={1} isFeatured />
                  </div>
                  <div className="w-[29%] h-[92%] self-end">
                    <BuilderPreviewCard builder={builders[1]} index={2} />
                  </div>
                  <div className="w-[29%] h-[92%] self-start">
                    <BuilderPreviewCard builder={builders[2]} index={3} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM FOOTER BANNER */}
        <div className="w-full bg-[#075B3A] text-[#F6F0E3] rounded-[12px] p-2.5 sm:p-3.5 flex items-center justify-between mt-3 shadow-md">
          <div className="flex items-center gap-3">
            <span className="font-['Calistoga',serif] text-[13px] sm:text-[18px] uppercase font-bold truncate max-w-[240px] sm:max-w-[380px]">
              {(teamName || 'HH GOA BUILDER TEAM').toUpperCase()}
            </span>
            {projectName && (
              <span className="font-['Oswald'] text-[11px] sm:text-[14px] text-[#F2A900] uppercase hidden sm:inline">
                • {projectName}
              </span>
            )}
          </div>
          <span className="font-['Calistoga',serif] text-[12px] sm:text-[16px] text-[#F05A68]">
            #FRAMEINGOA
          </span>
        </div>
      </div>
    </div>
  );
};

interface BuilderPreviewCardProps {
  builder: {
    name: string;
    stack: string;
    role?: string;
    photoUrl: string;
    cropResult?: any;
  };
  index: number;
  isFeatured?: boolean;
}

const BuilderPreviewCard: React.FC<BuilderPreviewCardProps> = ({
  builder,
  index,
  isFeatured,
}) => {
  return (
    <div
      className={`w-full h-full bg-[#F8F2E6] border-2 ${
        isFeatured ? 'border-[#F05A68]' : 'border-[#173F32]'
      } rounded-[14px] p-2 sm:p-3 flex flex-col justify-between shadow-xs overflow-hidden relative`}
    >
      {/* BUILDER INDEX BADGE */}
      <div
        className={`self-start px-2 py-0.5 rounded-md font-mono font-bold text-[9px] sm:text-[11px] mb-1 ${
          isFeatured ? 'bg-[#F05A68] text-[#F6F0E3]' : 'bg-[#173F32] text-[#F6F0E3]'
        }`}
      >
        BUILDER 0{index}
      </div>

      {/* PHOTO CONTAINER */}
      <div className="w-full flex-1 bg-[#EDE5D4] rounded-[10px] overflow-hidden border border-[#173F32]/20 relative my-1">
        <img
          src={builder.photoUrl}
          alt={builder.name}
          className="w-full h-full object-cover"
          style={builder.cropResult?.transform?.cssStyle || { objectFit: 'cover' }}
        />
      </div>

      {/* TEXT DETAILS */}
      <div className="w-full pt-1 flex flex-col items-start leading-tight">
        <span className="font-['Calistoga',serif] text-[12px] sm:text-[15px] text-[#173F32] truncate w-full font-bold">
          {(builder.name || `BUILDER ${index}`).toUpperCase()}
        </span>
        <span className="font-mono text-[9px] sm:text-[11px] text-[#075B3A] font-bold truncate w-full">
          {(builder.stack || 'DEVELOPER').toUpperCase()}
        </span>
        {builder.role && (
          <span className="font-['Oswald'] text-[9px] sm:text-[11px] text-[#F05A68] uppercase truncate w-full">
            {builder.role}
          </span>
        )}
      </div>
    </div>
  );
};
