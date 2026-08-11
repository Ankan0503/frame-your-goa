import React from 'react';
import { type BuilderFormData } from './BuilderForm';
import { type SmartCropResult } from '../lib/image/smartCrop';

export type IdOrientation = 'portrait' | 'landscape';

interface GoaIdTemplatePreviewProps {
  formData: BuilderFormData;
  photoUrl: string;
  cropResult?: SmartCropResult;
  orientation: IdOrientation;
}

export const GoaIdTemplatePreview: React.FC<GoaIdTemplatePreviewProps> = ({ formData, photoUrl, cropResult, orientation }) => {
  const isPortrait = orientation === 'portrait';
  const template = isPortrait
    ? '/assets/id-templates/goa-id-portrait-reference.png'
    : '/assets/id-templates/goa-id-landscape-reference.png';

  return (
    <div className={`w-full mx-auto ${isPortrait ? 'max-w-[620px]' : 'max-w-[960px]'}`}>
      <div className="relative w-full overflow-hidden rounded-[18px] shadow-2xl bg-[#F6F0E3]" style={{ aspectRatio: isPortrait ? '2 / 3' : '3 / 2' }}>
        <img src={template} alt={`${orientation} Hacker House Goa ID template`} className="absolute inset-0 w-full h-full object-cover" />

        <div className={`absolute overflow-hidden ${isPortrait ? 'left-[31%] top-[30%] w-[38%] aspect-square rounded-full' : 'left-[7.2%] top-[23.5%] w-[29%] h-[49%] rounded-[16%]'}`}>
          <img src={photoUrl} alt="Builder" className="w-full h-full object-cover" style={cropResult?.transform.cssStyle || { objectFit: 'cover' }} />
        </div>

        {isPortrait ? (
          <>
            <div className="absolute left-[27%] top-[58.5%] w-[47%] bg-[#123B35] rounded-[7px] py-[1.2%] px-[2%] text-center font-['Oswald'] font-bold tracking-[0.08em] text-[#F6F0E3] text-[clamp(10px,3.2vw,30px)] leading-none truncate">
              {formData.name || 'YOUR NAME'}
            </div>
            <div className="absolute left-[29%] top-[65.2%] w-[42%] bg-[#D83550] py-[0.8%] px-[2%] text-center font-['Oswald'] font-bold tracking-[0.06em] text-[#F2D249] text-[clamp(8px,2.2vw,22px)] leading-none truncate">
              {formData.stack || 'YOUR STACK'}
            </div>
            <div className="absolute left-[36%] top-[69.4%] w-[28%] bg-[#123B35] rounded-[4px] py-[0.7%] px-[1%] text-center font-mono font-bold text-[#F6F0E3] text-[clamp(7px,1.7vw,17px)] leading-none truncate">
              {formData.role || 'BUILDER'}
            </div>
            <div className="absolute left-[25%] top-[73.8%] w-[50%] bg-[#173F32]/85 rounded-[6px] py-[0.8%] px-[2%] text-center font-mono font-bold text-[#F6F0E3] text-[clamp(7px,1.4vw,16px)] leading-none truncate">
              {formData.builderClass || 'CREATIVE BUILDER'}
            </div>
          </>
        ) : (
          <>
            <div className="absolute left-[38.5%] top-[29%] w-[42%] bg-[#F6F0E3]/90 px-[1%] py-[0.5%] font-['Oswald'] font-bold tracking-[0.03em] text-[#123B35] text-[clamp(12px,4vw,58px)] leading-none truncate">HHG26-7F4A3B</div>
            <div className="absolute left-[15%] top-[77%] w-[29%] bg-[#F6F0E3]/92 px-[1%] py-[0.5%] font-['Oswald'] font-bold tracking-[0.04em] text-[#123B35] text-[clamp(10px,3vw,42px)] leading-none truncate">{formData.name || 'YOUR NAME'}</div>
            <div className="absolute left-[39%] top-[66%] w-[22%] bg-[#F6F0E3]/92 px-[1%] py-[0.4%] font-['Oswald'] font-bold tracking-[0.03em] text-[#123B35] text-[clamp(8px,2vw,28px)] leading-none truncate">{formData.stack || 'YOUR STACK'}</div>
            <div className="absolute left-[40%] top-[51%] w-[18%] bg-[#123B35] rounded-[5px] px-[1%] py-[0.8%] text-center font-['Oswald'] font-bold tracking-[0.06em] text-[#F6F0E3] text-[clamp(8px,1.8vw,25px)] leading-none truncate">{formData.role || 'BUILDER'}</div>
            <div className="absolute left-[39%] top-[73%] w-[24%] bg-[#173F32]/85 rounded-[5px] px-[1%] py-[0.7%] text-center font-mono font-bold text-[#F6F0E3] text-[clamp(7px,1.75vw,22px)] leading-none truncate">
              {formData.builderClass || 'CREATIVE BUILDER'}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
