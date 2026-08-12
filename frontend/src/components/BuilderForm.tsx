import React, { useState } from 'react';
import { generateBuilderClass } from '../lib/builder/generateBuilderClass';
import { Sparkles, Check, AlertCircle } from 'lucide-react';

export interface BuilderFormData {
  name: string;
  stack: string;
  role: string;
  builderClass: string;
}

interface BuilderFormProps {
  formData: BuilderFormData;
  onChange: (data: BuilderFormData) => void;
}

export const BuilderForm: React.FC<BuilderFormProps> = ({ formData, onChange }) => {
  const [touched, setTouched] = useState<{ name?: boolean; stack?: boolean }>({});

  const NAME_MAX = 40;
  const STACK_MAX = 60;
  const ROLE_MAX = 30;

  const handleInputChange = (field: keyof BuilderFormData, value: string) => {
    let limit = NAME_MAX;
    if (field === 'stack') limit = STACK_MAX;
    if (field === 'role') limit = ROLE_MAX;

    const truncated = value.slice(0, limit);
    const nextFormData = {
      ...formData,
      [field]: truncated,
    };

    // Recompute builder class
    nextFormData.builderClass = generateBuilderClass({
      stack: nextFormData.stack,
      role: nextFormData.role,
    });

    onChange(nextFormData);
  };

  const handleBlur = (field: 'name' | 'stack') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isNameInvalid = touched.name && !formData.name.trim();
  const isStackInvalid = touched.stack && !formData.stack.trim();

  return (
    <div className="w-full bg-[#F8F2E6] border-2 border-[#173F32] rounded-[20px] p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#D8CDB9]">
        <div>
          <h2 className="font-['Oswald'] font-bold text-[22px] sm:text-[26px] text-[#173F32] uppercase tracking-[0.02em] flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#075B3A] inline-block shrink-0" />
            <span>BUILDER CREDENTIAL INFO</span>
          </h2>
          <p className="font-mono text-[13px] text-[#123B35] mt-1">
            Fill in your details. Your Builder Class and ID badge update in real time.
          </p>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

        {/* 1. NAME FIELD */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-baseline font-mono text-[13px]">
            <label htmlFor="builder-name" className="font-bold text-[#173F32] uppercase tracking-wide flex items-center gap-1.5">
              <span>1. YOUR NAME</span>
              <span className="text-[#F05A68]">*</span>
            </label>
            <span className={`text-[12px] ${formData.name.length >= NAME_MAX ? 'text-[#F05A68] font-bold' : 'text-[#173F32]/60'}`}>
              {formData.name.length}/{NAME_MAX}
            </span>
          </div>

          <input
            id="builder-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder="e.g. Sayan Sinha"
            maxLength={NAME_MAX}
            required
            className={`w-full h-[58px] px-5 bg-[#F6F0E3] border-2 ${isNameInvalid ? 'border-[#F05A68] focus:ring-[#F05A68]' : 'border-[#173F32] focus:border-[#075B3A]'
              } rounded-[12px] font-['Calistoga',serif] text-[20px] sm:text-[24px] text-[#173F32] placeholder-[#173F32]/35 focus:outline-none focus:ring-2 focus:ring-[#075B3A]/30 transition-all`}
          />

          {isNameInvalid && (
            <p className="font-mono text-[12px] text-[#F05A68] flex items-center gap-1 mt-0.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Name is required for your official HH Goa credential.
            </p>
          )}
        </div>

        {/* 2. STACK FIELD */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-baseline font-mono text-[13px]">
            <label htmlFor="builder-stack" className="font-bold text-[#173F32] uppercase tracking-wide flex items-center gap-1.5">
              <span>2. YOUR STACK</span>
              <span className="text-[#F05A68]">*</span>
            </label>
            <span className={`text-[12px] ${formData.stack.length >= STACK_MAX ? 'text-[#F05A68] font-bold' : 'text-[#173F32]/60'}`}>
              {formData.stack.length}/{STACK_MAX}
            </span>
          </div>

          <input
            id="builder-stack"
            type="text"
            value={formData.stack}
            onChange={(e) => handleInputChange('stack', e.target.value)}
            onBlur={() => handleBlur('stack')}
            placeholder="e.g. CSE / AI / Full Stack"
            maxLength={STACK_MAX}
            required
            className={`w-full h-[58px] px-5 bg-[#F6F0E3] border-2 ${isStackInvalid ? 'border-[#F05A68] focus:ring-[#F05A68]' : 'border-[#173F32] focus:border-[#075B3A]'
              } rounded-[12px] font-['IBM_Plex_Mono',monospace] font-semibold text-[17px] sm:text-[19px] text-[#075B3A] placeholder-[#173F32]/35 focus:outline-none focus:ring-2 focus:ring-[#075B3A]/30 transition-all`}
          />

          {isStackInvalid && (
            <p className="font-mono text-[12px] text-[#F05A68] flex items-center gap-1 mt-0.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Stack is required to compute your Builder Class.
            </p>
          )}
        </div>

        {/* 3. OPTIONAL ROLE FIELD */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-baseline font-mono text-[13px]">
            <label htmlFor="builder-role" className="font-bold text-[#173F32] uppercase tracking-wide flex items-center gap-1.5">
              <span>3. ROLE</span>
              <span className="text-[#173F32]/50 font-normal">(OPTIONAL)</span>
            </label>
            <span className={`text-[12px] ${formData.role.length >= ROLE_MAX ? 'text-[#F05A68] font-bold' : 'text-[#173F32]/60'}`}>
              {formData.role.length}/{ROLE_MAX}
            </span>
          </div>

          <input
            id="builder-role"
            type="text"
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            placeholder="e.g. Builder, Founder, Researcher"
            maxLength={ROLE_MAX}
            className="w-full h-[54px] px-5 bg-[#F6F0E3] border-2 border-[#173F32]/60 focus:border-[#075B3A] rounded-[12px] font-['IBM_Plex_Mono',monospace] text-[16px] text-[#173F32] placeholder-[#173F32]/35 focus:outline-none focus:ring-2 focus:ring-[#075B3A]/30 transition-all"
          />
        </div>

        {/* AUTOMATICALLY GENERATED BUILDER CLASS DISPLAY BADGE */}
        <div className="pt-4 border-t border-[#D8CDB9]">
          <div className="bg-[#075B3A] text-[#F6F0E3] rounded-[14px] p-4 flex flex-col gap-1.5 shadow-xs">
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#F2A900] uppercase tracking-wider font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GENERATED BUILDER CLASS</span>
            </div>
            <div className="font-['Oswald'] font-bold text-[22px] sm:text-[26px] text-[#F6F0E3] uppercase tracking-[0.03em] leading-tight">
              {formData.builderClass}
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
