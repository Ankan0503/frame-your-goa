import {
  renderPfpFrame,
  type PfpStyle,
  type AspectRatio,
  type PfpRenderOptions,
} from '../image/renderPfpFrame';
import {
  downloadCanvasBlob,
  sanitizeFilename,
  CANVAS_DIMENSIONS,
} from '../image/canvasUtils';
import { type SmartCropResult } from '../image/smartCrop';

export type { PfpStyle, AspectRatio, PfpRenderOptions };

export interface PfpExportOptions extends PfpRenderOptions {
  userScale?: number;
  userOffsetX?: number;
  userOffsetY?: number;
}

export function getExportDimensions(aspectRatio: AspectRatio): { width: number; height: number } {
  switch (aspectRatio) {
    case '4:5':
      return CANVAS_DIMENSIONS.pfpPortrait;
    case '16:9':
      return CANVAS_DIMENSIONS.pfpLandscape;
    case '1:1':
    default:
      return CANVAS_DIMENSIONS.pfpSquare;
  }
}

export async function renderPfpToCanvas(
  options: PfpExportOptions,
  targetCanvas?: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
  return renderPfpFrame(options, targetCanvas);
}

export async function downloadPfpImage(
  options: PfpExportOptions,
  name = 'builder'
): Promise<void> {
  const canvas = await renderPfpToCanvas(options);
  const sanitized = sanitizeFilename(name);
  const filename = `hhgoa-2026-pfp-${sanitized}-${options.style}.png`;
  await downloadCanvasBlob(canvas, filename, 'image/png', 1.0);
}
