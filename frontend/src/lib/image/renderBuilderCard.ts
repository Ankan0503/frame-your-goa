import {
  COLORS,
  FONTS,
  CANVAS_DIMENSIONS,
  drawRoundedRect,
  ensureFontsLoaded,
  loadImage,
} from './canvasUtils';
import { type SmartCropResult } from './smartCrop';

export interface BuilderCardData {
  fullName: string;
  role: string;
  project?: string;
  location?: string;
  builderId: string;
  issueDate?: string;
  photoUrl: string;
  cropResult?: SmartCropResult;
  qrCodeDataUrl?: string;
}

/**
 * Renders high-resolution HH Goa 2026 Builder ID Pass (1200x1600).
 */
export async function renderBuilderCard(
  data: BuilderCardData,
  targetCanvas?: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
  await ensureFontsLoaded();

  const { width, height } = CANVAS_DIMENSIONS.builderCard;
  const canvas = targetCanvas || document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain 2D canvas context');

  // Background Canvas
  ctx.fillStyle = COLORS.warmCream;
  ctx.fillRect(0, 0, width, height);

  // Outer Decorative Frame Border
  const outerPad = 30;
  ctx.strokeStyle = COLORS.deepForest;
  ctx.lineWidth = 10;
  ctx.strokeRect(outerPad, outerPad, width - outerPad * 2, height - outerPad * 2);

  // Main Card Inner Container
  const cardX = 60;
  const cardY = 60;
  const cardW = width - 120;
  const cardH = height - 120;

  ctx.fillStyle = COLORS.cardBg;
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.fill();

  ctx.strokeStyle = COLORS.deepForest;
  ctx.lineWidth = 4;
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  // CARD HEADER: HH GOA 2026 + Pass Type
  ctx.fillStyle = COLORS.forestGreen;
  ctx.fillRect(cardX, cardY, cardW, 110);

  ctx.fillStyle = COLORS.goldenYellow;
  ctx.font = `bold 42px ${FONTS.mono}`;
  ctx.fillText('HH GOA 2026', cardX + 40, cardY + 70);

  ctx.fillStyle = COLORS.warmCream;
  ctx.font = `bold 24px ${FONTS.oswald}`;
  ctx.textAlign = 'right';
  ctx.fillText('OFFICIAL BUILDER PASS', cardX + cardW - 40, cardY + 70);
  ctx.textAlign = 'left';

  // PHOTO CONTAINER
  const photoW = cardW - 80;
  const photoH = 700;
  const photoX = cardX + 40;
  const photoY = cardY + 150;

  ctx.fillStyle = COLORS.photoBg;
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 16);
  ctx.fill();

  if (data.photoUrl) {
    try {
      const img = await loadImage(data.photoUrl);
      ctx.save();
      drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 16);
      ctx.clip();

      const crop = data.cropResult?.transform || {
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
        photoX,
        photoY,
        photoW,
        photoH
      );
      ctx.restore();
    } catch {
      // Photo fallback
    }
  }

  // Photo Frame Border & Watermark Badge
  ctx.strokeStyle = COLORS.deepForest;
  ctx.lineWidth = 4;
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 16);
  ctx.stroke();

  // "GOA, INDIA 28-31 OCT" Watermark Pill on Photo
  const pillW = 340;
  const pillH = 48;
  const pillX = photoX + 20;
  const pillY = photoY + photoH - 68;

  ctx.fillStyle = 'rgba(23, 63, 50, 0.9)';
  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 10);
  ctx.fill();

  ctx.fillStyle = COLORS.goldenYellow;
  ctx.font = `bold 20px ${FONTS.mono}`;
  ctx.fillText('GOA, INDIA • 28—31 OCT', pillX + 20, pillY + 32);

  // BUILDER DETAILS SECTION
  let currentY = photoY + photoH + 60;

  // Name
  ctx.fillStyle = COLORS.deepForest;
  ctx.font = `bold 22px ${FONTS.mono}`;
  ctx.fillText('BUILDER NAME', photoX, currentY);

  currentY += 45;
  ctx.fillStyle = COLORS.forestGreen;
  ctx.font = `bold 52px ${FONTS.calistoga}`;
  ctx.fillText(data.fullName.toUpperCase() || 'ANONYMOUS BUILDER', photoX, currentY);

  currentY += 60;

  // Role & Project Grid
  ctx.fillStyle = COLORS.deepForest;
  ctx.font = `bold 20px ${FONTS.mono}`;
  ctx.fillText('ROLE', photoX, currentY);
  ctx.fillText('PROJECT', photoX + 450, currentY);

  currentY += 36;
  ctx.fillStyle = COLORS.coralRed;
  ctx.font = `bold 32px ${FONTS.oswald}`;
  ctx.fillText(data.role.toUpperCase() || 'DEVELOPER', photoX, currentY);

  ctx.fillStyle = COLORS.deepForest;
  ctx.font = `bold 32px ${FONTS.oswald}`;
  ctx.fillText((data.project || 'HH GOA 2026').toUpperCase(), photoX + 450, currentY);

  currentY += 80;

  // BOTTOM METADATA & QR CODE AREA
  ctx.strokeStyle = COLORS.borderDivider;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(photoX, currentY);
  ctx.lineTo(photoX + photoW, currentY);
  ctx.stroke();

  currentY += 40;

  // Builder ID Badge Number
  ctx.fillStyle = COLORS.deepForest;
  ctx.font = `bold 18px ${FONTS.mono}`;
  ctx.fillText('BUILDER ID PASS #', photoX, currentY);

  ctx.fillStyle = COLORS.forestGreen;
  ctx.font = `bold 36px ${FONTS.mono}`;
  ctx.fillText(data.builderId || 'HH-2026-0001', photoX, currentY + 42);

  ctx.fillStyle = COLORS.deepForest;
  ctx.font = `bold 18px ${FONTS.mono}`;
  ctx.fillText(`LOCATION: ${data.location || 'GOA, INDIA'}`, photoX, currentY + 85);

  // Draw QR code if provided
  if (data.qrCodeDataUrl) {
    try {
      const qrImg = await loadImage(data.qrCodeDataUrl);
      const qrSize = 130;
      const qrX = photoX + photoW - qrSize;
      const qrY = currentY - 10;

      ctx.fillStyle = COLORS.warmCream;
      drawRoundedRect(ctx, qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 12);
      ctx.fill();
      ctx.strokeStyle = COLORS.deepForest;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    } catch {
      // QR code fallback
    }
  }

  // Bottom Hashtag Banner
  ctx.fillStyle = COLORS.deepForest;
  ctx.fillRect(cardX, cardY + cardH - 70, cardW, 70);

  ctx.fillStyle = COLORS.warmCream;
  ctx.font = `bold 28px ${FONTS.calistoga}`;
  ctx.textAlign = 'center';
  ctx.fillText('#FRAMEINGOA  •  HACKER HOUSE GOA 2026', cardX + cardW / 2, cardY + cardH - 26);
  ctx.textAlign = 'left';

  return canvas;
}
