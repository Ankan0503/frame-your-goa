import {
  renderBuilderCard,
  type BuilderCardData,
} from '../image/renderBuilderCard';
import {
  downloadCanvasBlob,
  sanitizeFilename,
} from '../image/canvasUtils';
import { type SmartCropResult } from '../image/smartCrop';

export interface IdCardData {
  name: string;
  stack: string;
  role?: string;
  builderClass: string;
  photoUrl: string;
  cropResult?: SmartCropResult;
  orientation?: 'portrait' | 'landscape';
  builderId?: string;
  qrDataUrl?: string;
  theme?: 'theme1' | 'theme2';
}

export async function renderIdCardToCanvas(
  data: IdCardData,
  targetCanvas?: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
  const cardData: BuilderCardData = {
    fullName: data.name,
    role: data.stack || data.role || data.builderClass,
    project: data.role || data.builderClass,
    builderId: data.builderId || `HH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    location: 'GOA, INDIA',
    photoUrl: data.photoUrl,
    cropResult: data.cropResult,
    qrCodeDataUrl: data.qrDataUrl,
    theme: data.theme,
  };

  return renderBuilderCard(cardData, targetCanvas);
}

export async function downloadIdCardImage(
  data: IdCardData
): Promise<void> {
  const canvas = await renderIdCardToCanvas(data);
  const sanitized = sanitizeFilename(data.name);
  const filename = `hhgoa-2026-builder-${sanitized}.png`;
  await downloadCanvasBlob(canvas, filename, 'image/png', 1.0);
}
