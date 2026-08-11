import {
  COLORS,
  FONTS,
  CANVAS_DIMENSIONS,
  drawRoundedRect,
  ensureFontsLoaded,
  loadImage,
} from './canvasUtils';
import { type SmartCropResult } from './smartCrop';

export type PfpStyle = 'signal' | 'builder' | 'goa' | 'nightshift';
export type AspectRatio = '1:1' | '4:5' | '16:9';

export interface PfpRenderOptions {
  photoUrl: string;
  style: PfpStyle;
  aspectRatio: AspectRatio;
  cropResult?: SmartCropResult;
}

/**
 * High-resolution canvas renderer for HH Goa 2026 PFP Frames.
 */
export async function renderPfpFrame(
  options: PfpRenderOptions,
  targetCanvas?: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
  await ensureFontsLoaded();

  const { photoUrl, style, aspectRatio, cropResult } = options;
  const { width, height } =
    aspectRatio === '4:5'
      ? CANVAS_DIMENSIONS.pfpPortrait
      : aspectRatio === '16:9'
      ? CANVAS_DIMENSIONS.pfpLandscape
      : CANVAS_DIMENSIONS.pfpSquare;

  const canvas = targetCanvas || document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain 2D canvas context');

  // Background fallback fill
  ctx.fillStyle = style === 'nightshift' ? COLORS.nightBg : COLORS.warmCream;
  ctx.fillRect(0, 0, width, height);

  // Load and draw photo
  if (photoUrl) {
    try {
      const img = await loadImage(photoUrl);
      const crop = cropResult?.transform || {
        cropX: 0,
        cropY: 0,
        cropWidth: img.width,
        cropHeight: img.height,
      };

      ctx.drawImage(
        img,
        crop.cropX,
        crop.cropY,
        crop.cropWidth,
        crop.cropHeight,
        0,
        0,
        width,
        height
      );
    } catch {
      // Image fallback
    }
  }

  // Draw style overlays
  switch (style) {
    case 'signal':
      renderStyleSignal(ctx, width, height);
      break;
    case 'builder':
      renderStyleBuilder(ctx, width, height);
      break;
    case 'goa':
      renderStyleGoa(ctx, width, height);
      break;
    case 'nightshift':
      renderStyleNightShift(ctx, width, height);
      break;
  }

  return canvas;
}

function renderStyleSignal(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const pad = Math.min(width, height) * 0.04;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  // Outer Border Line
  ctx.strokeStyle = COLORS.forestGreen;
  ctx.lineWidth = 12;
  ctx.strokeRect(pad, pad, innerW, innerH);

  // Corner Brackets
  const bracketLen = Math.min(width, height) * 0.08;
  ctx.strokeStyle = COLORS.goldenYellow;
  ctx.lineWidth = 14;

  // Top Left
  ctx.beginPath();
  ctx.moveTo(pad - 8, pad + bracketLen);
  ctx.lineTo(pad - 8, pad - 8);
  ctx.lineTo(pad + bracketLen, pad - 8);
  ctx.stroke();

  // Top Right
  ctx.beginPath();
  ctx.moveTo(width - pad + 8 - bracketLen, pad - 8);
  ctx.lineTo(width - pad + 8, pad - 8);
  ctx.lineTo(width - pad + 8, pad + bracketLen);
  ctx.stroke();

  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(pad - 8, height - pad - bracketLen);
  ctx.lineTo(pad - 8, height - pad + 8);
  ctx.lineTo(pad + bracketLen, height - pad + 8);
  ctx.stroke();

  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(width - pad + 8 - bracketLen, height - pad + 8);
  ctx.lineTo(width - pad + 8, height - pad + 8);
  ctx.lineTo(width - pad + 8, height - pad - bracketLen);
  ctx.stroke();

  // Top Badge
  const badgeW = 320;
  const badgeH = 52;
  const badgeX = pad + 20;
  const badgeY = pad + 20;

  ctx.fillStyle = COLORS.forestGreen;
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 10);
  ctx.fill();

  ctx.fillStyle = COLORS.goldenYellow;
  ctx.font = `bold 24px ${FONTS.mono}`;
  ctx.fillText('HH GOA 2026', badgeX + 22, badgeY + 35);

  // Bottom Hashtag Banner
  const tagH = 58;
  const tagY = height - pad - tagH - 20;
  const tagW = 280;
  const tagX = width - pad - tagW - 20;

  ctx.fillStyle = COLORS.deepForest;
  drawRoundedRect(ctx, tagX, tagY, tagW, tagH, 12);
  ctx.fill();

  ctx.fillStyle = COLORS.warmCream;
  ctx.font = `bold 26px ${FONTS.calistoga}`;
  ctx.fillText('#FRAMEINGOA', tagX + 24, tagY + 39);

  // Bottom Left Date/Location Stamp
  ctx.fillStyle = 'rgba(246, 240, 227, 0.92)';
  drawRoundedRect(ctx, pad + 20, height - pad - 62, 360, 46, 10);
  ctx.fill();

  ctx.fillStyle = COLORS.forestGreen;
  ctx.font = `bold 18px ${FONTS.mono}`;
  ctx.fillText('GOA, INDIA  •  28—31 OCT', pad + 35, height - pad - 33);
}

function renderStyleBuilder(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const borderWidth = Math.min(width, height) * 0.06;

  ctx.fillStyle = COLORS.deepForest;
  ctx.fillRect(0, 0, width, borderWidth * 1.5);
  ctx.fillRect(0, height - borderWidth * 1.5, width, borderWidth * 1.5);
  ctx.fillRect(0, 0, borderWidth, height);
  ctx.fillRect(width - borderWidth, 0, borderWidth, height);

  ctx.fillStyle = COLORS.warmCream;
  ctx.font = `bold 28px ${FONTS.mono}`;
  ctx.fillText('HH GOA 2026  //  BUILDER PFP', borderWidth + 10, borderWidth + 10);

  ctx.fillStyle = COLORS.coralRed;
  ctx.beginPath();
  ctx.arc(width - borderWidth - 30, borderWidth + 2, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.goldenYellow;
  ctx.font = `bold 24px ${FONTS.oswald}`;
  ctx.fillText('GOA, INDIA  •  28—31 OCT 2026', borderWidth + 10, height - borderWidth / 2 + 6);

  ctx.fillStyle = COLORS.warmCream;
  ctx.font = `bold 26px ${FONTS.calistoga}`;
  ctx.textAlign = 'right';
  ctx.fillText('#FRAMEINGOA', width - borderWidth - 10, height - borderWidth / 2 + 6);
  ctx.textAlign = 'left';
}

function renderStyleGoa(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const pad = Math.min(width, height) * 0.05;

  ctx.strokeStyle = COLORS.coralRed;
  ctx.lineWidth = 14;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  ctx.strokeStyle = COLORS.goldenYellow;
  ctx.lineWidth = 5;
  ctx.strokeRect(pad + 14, pad + 14, width - (pad + 14) * 2, height - (pad + 14) * 2);

  const badgeW = 340;
  const badgeH = 56;
  const badgeX = (width - badgeW) / 2;
  const badgeY = pad + 20;

  ctx.fillStyle = COLORS.coralRed;
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 16);
  ctx.fill();

  ctx.fillStyle = COLORS.warmCream;
  ctx.font = `bold 26px ${FONTS.calistoga}`;
  ctx.textAlign = 'center';
  ctx.fillText('HH GOA 2026', width / 2, badgeY + 38);
  ctx.textAlign = 'left';

  const footerH = 64;
  const footerW = width - pad * 2 - 80;
  const footerX = (width - footerW) / 2;
  const footerY = height - pad - footerH - 20;

  ctx.fillStyle = COLORS.forestGreen;
  drawRoundedRect(ctx, footerX, footerY, footerW, footerH, 32);
  ctx.fill();

  ctx.fillStyle = COLORS.goldenYellow;
  ctx.font = `bold 22px ${FONTS.mono}`;
  ctx.fillText('GOA, INDIA • 28—31 OCT', footerX + 32, footerY + 40);

  ctx.fillStyle = COLORS.warmCream;
  ctx.font = `bold 24px ${FONTS.calistoga}`;
  ctx.textAlign = 'right';
  ctx.fillText('#FRAMEINGOA', footerX + footerW - 32, footerY + 40);
  ctx.textAlign = 'left';
}

function renderStyleNightShift(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.3,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.7
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(7, 22, 16, 0.75)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const pad = 32;
  ctx.strokeStyle = COLORS.mintGreen;
  ctx.lineWidth = 4;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  ctx.fillStyle = COLORS.mintGreen;
  ctx.font = `18px ${FONTS.mono}`;
  ctx.fillText('+ 15.4989° N, 73.8278° E', pad + 18, pad + 38);
  ctx.fillText('SYS.LOC // GOA, INDIA', pad + 18, height - pad - 22);

  ctx.textAlign = 'right';
  ctx.fillText('HH GOA 2026 // NIGHT SHIFT', width - pad - 18, pad + 38);
  ctx.font = `bold 24px ${FONTS.calistoga}`;
  ctx.fillText('#FRAMEINGOA', width - pad - 18, height - pad - 22);
  ctx.textAlign = 'left';
}
