import React from 'react';
import { IdCard } from './IdCard';

interface BuilderIdCardPreviewProps {
  formData?: any;
  photoUrl?: string;
  cropResult?: any;
  pfpStyle?: any;
  pfpRatio?: any;
}

export const BuilderIdCardPreview: React.FC<BuilderIdCardPreviewProps> = ({
  formData,
  photoUrl,
  cropResult,
}) => {
  return (
    <IdCard
      name={formData?.name}
      stack={formData?.stack}
      role={formData?.role}
      passType={formData?.role}
      builderClass={formData?.builderClass}
      photo={photoUrl}
      cropResult={cropResult}
    />
  );
};
