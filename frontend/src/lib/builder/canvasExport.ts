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
}

export async function renderIdCardToCanvas(
  data: IdCardData,
  targetCanvas?: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
  const cardData: BuilderCardData = {
    fullName: data.name,
    role: data.role || data.stack,
    project: data.builderClass,
    builderId: `HH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    location: 'GOA, INDIA',
    photoUrl: data.photoUrl,
    cropResult: data.cropResult,
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
