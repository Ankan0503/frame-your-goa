import React from 'react';
import { IdCard } from './IdCard';

export type IdOrientation = 'portrait' | 'landscape';

interface GoaIdTemplatePreviewProps {
  formData?: any;
  photoUrl?: string;
  cropResult?: any;
  orientation?: IdOrientation;
}

export const GoaIdTemplatePreview: React.FC<GoaIdTemplatePreviewProps> = () => {
  return <IdCard />;
};

