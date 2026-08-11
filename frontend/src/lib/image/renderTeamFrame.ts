import {
  COLORS,
  FONTS,
  CANVAS_DIMENSIONS,
  drawRoundedRect,
  ensureFontsLoaded,
  loadImage,
  downloadCanvasBlob,
  sanitizeFilename,
} from './canvasUtils';
import { type SmartCropResult } from './smartCrop';

export interface TeamMember {
  id: string;
  name: string;
  stack: string;
  role?: string;
  photoUrl: string;
  cropResult?: SmartCropResult;
}

export type TeamLayout = 'layout-a' | 'layout-b' | 'layout-c';

export interface MultiBuilderTeamFrameData {
  teamName: string;
  projectName?: string;
  layout: TeamLayout;
  builders: TeamMember[];
}

/**
 * Renders high-resolution HH Goa 2026 Team / Squad Frame Poster (1600x1200).
 */
export async function renderTeamFrame(
  data: MultiBuilderTeamFrameData,
  targetCanvas?: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
  await ensureFontsLoaded();

  const { width, height } = CANVAS_DIMENSIONS.teamFrame; // 1600 x 1200
  const canvas = targetCanvas || document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain 2D canvas context');

  // Background
  ctx.fillStyle = COLORS.warmCream;
  ctx.fillRect(0, 0, width, height);

  // Outer Border Frame
  const outerPad = 32;
  ctx.strokeStyle = COLORS.deepForest;
  ctx.lineWidth = 12;
  ctx.strokeRect(outerPad, outerPad, width - outerPad * 2, height - outerPad * 2);

  // TOP HEADER BANNER
  const headerY = outerPad + 24;
  const headerH = 90;
  const headerW = width - outerPad * 2 - 48;
  const headerX = outerPad + 24;

  ctx.fillStyle = COLORS.deepForest;
  drawRoundedRect(ctx, headerX, headerY, headerW, headerH, 16);
  ctx.fill();

  ctx.fillStyle = COLORS.goldenYellow;
  ctx.font = `bold 38px ${FONTS.mono}`;
  ctx.fillText('HH GOA 2026', headerX + 32, headerY + 56);

  ctx.fillStyle = COLORS.coralRed;
  ctx.font = `bold 22px ${FONTS.mono}`;
  ctx.fillText('TEAM BUILDER MODE', headerX + 330, headerY + 54);

  ctx.fillStyle = COLORS.warmCream;
  ctx.font = `bold 24px ${FONTS.oswald}`;
  ctx.textAlign = 'right';
  ctx.fillText('GOA, INDIA  •  28—31 OCT', headerX + headerW - 32, headerY + 56);
  ctx.textAlign = 'left';

  // MAIN CONTENT AREA FOR BUILDERS
  const contentY = headerY + headerH + 24;
  const contentH = height - contentY - outerPad - 110;
  const contentW = headerW;
  const contentX = headerX;

  const count = Math.min(Math.max(data.builders.length, 1), 3);

  switch (data.layout) {
    case 'layout-b':
      await renderLayoutB(ctx, data.builders, contentX, contentY, contentW, contentH);
      break;
    case 'layout-c':
      await renderLayoutC(ctx, data.builders, contentX, contentY, contentW, contentH);
      break;
    case 'layout-a':
    default:
      await renderLayoutA(ctx, data.builders, contentX, contentY, contentW, contentH);
      break;
  }

  // BOTTOM FOOTER BANNER
  const footerY = height - outerPad - 94;
  const footerH = 70;

  ctx.fillStyle = COLORS.forestGreen;
  drawRoundedRect(ctx, headerX, footerY, headerW, footerH, 16);
  ctx.fill();

  ctx.fillStyle = COLORS.warmCream;
  ctx.font = `bold 32px ${FONTS.calistoga}`;
  const displayTeam = (data.teamName || 'HH GOA BUILDER TEAM').toUpperCase();
  ctx.fillText(displayTeam, headerX + 32, footerY + 46);

  if (data.projectName) {
    ctx.fillStyle = COLORS.goldenYellow;
    ctx.font = `bold 22px ${FONTS.oswald}`;
    ctx.fillText(`PROJECT: ${data.projectName.toUpperCase()}`, headerX + 560, footerY + 44);
  }

  ctx.fillStyle = COLORS.coralRed;
  ctx.font = `bold 28px ${FONTS.calistoga}`;
  ctx.textAlign = 'right';
  ctx.fillText('#FRAMEINGOA', headerX + headerW - 32, footerY + 46);
  ctx.textAlign = 'left';

  return canvas;
}

/**
 * LAYOUT A: Equal Columns (1 to 3 equal cards)
 */
async function renderLayoutA(
  ctx: CanvasRenderingContext2D,
  builders: TeamMember[],
  x: number,
  y: number,
  w: number,
  h: number
) {
  const count = Math.min(Math.max(builders.length, 1), 3);
  const gap = 24;
  const cardW = (w - gap * (count - 1)) / count;

  for (let i = 0; i < count; i++) {
    const cardX = x + i * (cardW + gap);
    const builder = builders[i];
    await drawBuilderCardSlot(ctx, builder, cardX, y, cardW, h, i + 1);
  }
}

/**
 * LAYOUT B: Featured Large Builder on Left + Stacked Smaller Builders on Right
 */
async function renderLayoutB(
  ctx: CanvasRenderingContext2D,
  builders: TeamMember[],
  x: number,
  y: number,
  w: number,
  h: number
) {
  const count = Math.min(Math.max(builders.length, 1), 3);
  if (count === 1) {
    await renderLayoutA(ctx, builders, x, y, w, h);
    return;
  }

  const gap = 24;
  const leftW = w * 0.58 - gap / 2;
  const rightW = w - leftW - gap;

  // Featured Builder
  await drawBuilderCardSlot(ctx, builders[0], x, y, leftW, h, 1, true);

  // Side Builders
  const sideCount = count - 1;
  const sideH = (h - gap * (sideCount - 1)) / sideCount;

  for (let i = 0; i < sideCount; i++) {
    const sideY = y + i * (sideH + gap);
    await drawBuilderCardSlot(ctx, builders[i + 1], x + leftW + gap, sideY, rightW, sideH, i + 2);
  }
}

/**
 * LAYOUT C: Editorial Asymmetric Composition (Staggered Overlap Panels)
 */
async function renderLayoutC(
  ctx: CanvasRenderingContext2D,
  builders: TeamMember[],
  x: number,
  y: number,
  w: number,
  h: number
) {
  const count = Math.min(Math.max(builders.length, 1), 3);
  if (count === 1) {
    await renderLayoutA(ctx, builders, x, y, w, h);
    return;
  }

  const gap = 20;
  if (count === 2) {
    const cardW = (w - gap) / 2;
    await drawBuilderCardSlot(ctx, builders[0], x, y, cardW, h * 0.88, 1);
    await drawBuilderCardSlot(ctx, builders[1], x + cardW + gap, y + h * 0.12, cardW, h * 0.88, 2);
  } else {
    // 3 Builders Asymmetric
    const w1 = w * 0.42;
    const w2 = w * 0.30;
    const w3 = w - w1 - w2 - gap * 2;

    await drawBuilderCardSlot(ctx, builders[0], x, y, w1, h, 1, true);
    await drawBuilderCardSlot(ctx, builders[1], x + w1 + gap, y + 30, w2, h - 30, 2);
    await drawBuilderCardSlot(ctx, builders[2], x + w1 + w2 + gap * 2, y, w3, h - 30, 3);
  }
}

/**
 * Helper to draw a single builder card slot with photo and metadata
 */
async function drawBuilderCardSlot(
  ctx: CanvasRenderingContext2D,
  builder: TeamMember,
  x: number,
  y: number,
  w: number,
  h: number,
  index: number,
  isFeatured = false
) {
  // Card Container Background
  ctx.fillStyle = COLORS.cardBg;
  drawRoundedRect(ctx, x, y, w, h, 16);
  ctx.fill();

  ctx.strokeStyle = isFeatured ? COLORS.coralRed : COLORS.deepForest;
  ctx.lineWidth = isFeatured ? 5 : 3;
  drawRoundedRect(ctx, x, y, w, h, 16);
  ctx.stroke();

  // Builder Index Pill Badge
  const badgeW = Math.min(130, w - 20);
  ctx.fillStyle = isFeatured ? COLORS.coralRed : COLORS.deepForest;
  drawRoundedRect(ctx, x + 12, y + 12, badgeW, 32, 8);
  ctx.fill();

  ctx.fillStyle = COLORS.warmCream;
  ctx.font = `bold 14px ${FONTS.mono}`;
  ctx.fillText(`BUILDER 0${index}`, x + 22, y + 33);

  // Photo Area
  const infoH = Math.max(110, h * 0.28);
  const photoX = x + 12;
  const photoY = y + 52;
  const photoW = w - 24;
  const photoH = h - infoH - 60;

  ctx.fillStyle = COLORS.photoBg;
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 12);
  ctx.fill();

  if (builder.photoUrl) {
    try {
      const img = await loadImage(builder.photoUrl);
      ctx.save();
      drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 12);
      ctx.clip();

      const crop = builder.cropResult?.transform || {
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

  // Photo Frame Border
  ctx.strokeStyle = COLORS.deepForest;
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 12);
  ctx.stroke();

  // Builder Name & Stack Metadata
  const textY = photoY + photoH + 28;

  ctx.fillStyle = COLORS.deepForest;
  ctx.font = `bold ${isFeatured ? '28px' : '22px'} ${FONTS.calistoga}`;
  const nameTrunc = (builder.name || `BUILDER ${index}`).toUpperCase();
  ctx.fillText(nameTrunc, photoX + 4, textY);

  ctx.fillStyle = COLORS.forestGreen;
  ctx.font = `bold ${isFeatured ? '18px' : '15px'} ${FONTS.mono}`;
  const stackTrunc = (builder.stack || 'DEVELOPER').toUpperCase();
  ctx.fillText(stackTrunc, photoX + 4, textY + 28);

  if (builder.role) {
    ctx.fillStyle = COLORS.coralRed;
    ctx.font = `bold 14px ${FONTS.oswald}`;
    ctx.fillText(builder.role.toUpperCase(), photoX + 4, textY + 48);
  }
}

/**
 * Downloads the team frame poster as a high-res PNG image file
 */
export async function downloadTeamFrameImage(
  data: MultiBuilderTeamFrameData
): Promise<void> {
  const canvas = await renderTeamFrame(data);
  const sanitized = sanitizeFilename(data.teamName || 'team');
  const filename = `hhgoa-2026-team-${sanitized}.png`;
  await downloadCanvasBlob(canvas, filename, 'image/png', 1.0);
}
