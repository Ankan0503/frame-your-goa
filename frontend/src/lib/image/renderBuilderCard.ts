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
  /** Tech stack shown on the coral accent line */
  role: string;
  /** Pass type / builder class shown in the badge pill */
  project?: string;
  location?: string;
  builderId: string;
  issueDate?: string;
  photoUrl: string;
  orientation?: 'portrait' | 'landscape';
  cropResult?: SmartCropResult;
  qrCodeDataUrl?: string;
  theme?: 'theme1' | 'theme2';
}

const CARD_BG_SRC = '/assets/id-image-1.avif';
const LOGO_SRC = '/assets/hacker-house-goa-logo.svg';

export async function renderBuilderCard(
  data: BuilderCardData,
  targetCanvas?: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
  await ensureFontsLoaded();

  const width = CANVAS_DIMENSIONS.builderCard.width;
  const height = CANVAS_DIMENSIONS.builderCard.height;

  const canvas = targetCanvas || document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain 2D canvas context');

  // ─── LAYOUT TUNING (mirrors the hand-tuned DOM IdCard.tsx look) ──────────
  const LAYOUT = {
    photoPosY: 0.29, // profile circle top, % of height
    nameSize: 0.075, // % of width
    stackSize: 0.036, // % of width
    badgeSize: 0.03, // % of width
    textGap: 0.03, // gap between name/stack/badge, % of height
    footerReserve: 0.06, // reserved space below the text block (above the strip), % of height
    qrSize: 0.1, // QR square side, % of height
    qrCenterX: 0.12, // QR center, % of width
    qrCenterY: 0.74, // QR center, % of height
    qrBorder: 0.004, // QR border thickness, % of width
    idX: 0.06, // Builder ID column left edge, % of width
    idCenterY: 0.90, // Builder ID column center, % of height
    idLabelSize: 0.03, // % of width
    idValueSize: 0.034, // % of width
  };

  // Round the card corners so the downloaded image feels like a physical ID card
  const cornerRadius = Math.round(width * 0.07);
  ctx.save();
  drawRoundedRect(ctx, 0, 0, width, height, cornerRadius);
  ctx.clip();

  // 1. Card background (object-cover crop of the card art to fill the 4:5 canvas, like the DOM card)
  try {
    const bgSrc = data.theme === 'theme2' ? '/assets/id-image-2.avif' : CARD_BG_SRC;
    const bg = await loadImage(bgSrc);
    const scale = Math.max(width / bg.naturalWidth, height / bg.naturalHeight);
    const srcW = width / scale;
    const srcH = height / scale;
    const srcX = (bg.naturalWidth - srcW) / 2;
    const srcY = (bg.naturalHeight - srcH) / 2;
    ctx.drawImage(bg, srcX, srcY, srcW, srcH, 0, 0, width, height);
  } catch {
    ctx.fillStyle = COLORS.cardBg;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Logo top-left
  try {
    const logo = await loadImage(LOGO_SRC);
    const logoW = width * 0.3;
    const logoH = logoW * ((logo.naturalHeight || 300) / (logo.naturalWidth || 600));
    ctx.drawImage(logo, width * 0.07, height * 0.08, logoW, logoH);
  } catch {
    // Logo is decorative; skip if it fails to load
  }

  // 3. Circular profile photo (mirrors the DOM card: top 27.5%, 45% width)
  if (data.photoUrl) {
    try {
      const img = await loadImage(data.photoUrl);

      // Replicate the DOM card's exact CSS pipeline:
      // object-fit: cover + object-position + transform: scale(zoom), all inside a square circle box.
      const transform = data.cropResult?.transform;
      const d = width * 0.45;
      const cx = width / 2;
      const cy = height * LAYOUT.photoPosY + d / 2;

      const srcW = img.naturalWidth || img.width;
      const srcH = img.naturalHeight || img.height;
      const scaleFit = Math.max(d / srcW, d / srcH);
      const scaledW = srcW * scaleFit;
      const scaledH = srcH * scaleFit;

      const [pxStr = '50%', pyStr = '50%'] = (transform?.objectPosition || '50% 50%').split(' ');
      const px = parseFloat(pxStr) / 100;
      const py = parseFloat(pyStr) / 100;
      const zoom = transform?.scale || 1;

      // Center of the visible region in source pixels.
      // CSS object-position aligns px% of the object with px% of the box, so the visible region
      // starts at px*(scaled - d) and its center is px*(scaled - d) + d/2 (in element units).
      const centerX = (px * (scaledW - d) + d / 2) / scaleFit;
      const centerY = (py * (scaledH - d) + d / 2) / scaleFit;

      const cropW = d / (zoom * scaleFit);
      const cropH = d / (zoom * scaleFit);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, d / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, centerX - cropW / 2, centerY - cropH / 2, cropW, cropH, cx - d / 2, cy - d / 2, d, d);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(cx, cy, d / 2, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(4, width * 0.006);
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.stroke();
    } catch {
      // Photo fallback: draw empty circle outline
      const d = width * 0.45;
      const cx = width / 2;
      const cy = height * LAYOUT.photoPosY + d / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, d / 2, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(4, width * 0.006);
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.stroke();
    }
  }

  const centerX = width / 2;

  const stripH = Math.round(height * 0.045);
  const gap = Math.round(height * LAYOUT.textGap);
  const footerReserve = Math.round(height * LAYOUT.footerReserve);
  const qrSize = Math.round(height * LAYOUT.qrSize);

  // 4. Name (deepForest, Calistoga) — shrink to fit
  const nameText = (data.fullName || 'BUILDER NAME').toUpperCase();
  let nameSize = width * LAYOUT.nameSize;
  ctx.textAlign = 'center';
  ctx.fillStyle = data.theme === 'theme2' ? COLORS.coralRed : COLORS.deepForest;
  ctx.font = `bold ${Math.round(nameSize)}px ${FONTS.calistoga}`;
  while (ctx.measureText(nameText).width > width * 0.84 && nameSize > width * 0.045) {
    nameSize -= 2;
    ctx.font = `bold ${Math.round(nameSize)}px ${FONTS.calistoga}`;
  }

  // 5. Pass type badge pill (gold on dark forest), bottom-anchored above the strip
  const badgeText = (data.project || 'BUILDER PASS 2026').toUpperCase();
  const badgeSize = width * LAYOUT.badgeSize;
  ctx.font = `bold ${Math.round(badgeSize)}px ${FONTS.mono}`;
  const padX = width * 0.022;
  const pillW = ctx.measureText(badgeText).width + padX * 2;
  const pillH = Math.round(height * 0.045);
  const pillBottom = height - stripH - footerReserve - gap;
  const pillY = pillBottom - pillH;
  const pillX = centerX - pillW / 2;

  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fillStyle = 'rgba(23,63,50,0.92)';
  ctx.fill();
  ctx.fillStyle = COLORS.goldenYellow;
  ctx.fillText(badgeText, centerX, pillY + pillH * 0.66);

  // 6. Tech stack (coral, Oswald) sits just above the badge
  const stackText = (data.role || 'FULLSTACK DEV').toUpperCase();
  const stackSize = width * LAYOUT.stackSize;
  const stackBaseline = pillY - gap;
  ctx.fillStyle = data.theme === 'theme2' ? COLORS.deepForest : COLORS.coralRed;
  ctx.font = `bold ${Math.round(stackSize)}px ${FONTS.oswald}`;
  ctx.fillText(stackText, centerX, stackBaseline);

  // 7. Name sits just above the stack
  const nameBaseline = stackBaseline - gap - Math.round(stackSize);
  ctx.fillStyle = data.theme === 'theme2' ? COLORS.coralRed : COLORS.deepForest;
  ctx.font = `bold ${Math.round(nameSize)}px ${FONTS.calistoga}`;
  ctx.fillText(nameText, centerX, nameBaseline);

  // 8. Bottom white strip with #FrameInGoa at the center
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, height - stripH, width, stripH);
  ctx.fillStyle = 'rgba(23,63,50,0.1)';
  ctx.fillRect(0, height - stripH, width, 1);

  const stripCenterY = height - stripH / 2;
  ctx.fillStyle = COLORS.forestGreen;
  ctx.font = `bold ${Math.round(width * 0.03)}px ${FONTS.mono}`;
  ctx.fillText('#FrameInGoa', centerX, stripCenterY + width * 0.012);

  // 9. QR (square, white bg, dark border) in the lower-left, above the strip
  if (data.qrCodeDataUrl) {
    try {
      const qrImg = await loadImage(data.qrCodeDataUrl);
      const qrCenterX = width * LAYOUT.qrCenterX;
      const qrCenterY = height * LAYOUT.qrCenterY;
      const qrX = qrCenterX - qrSize / 2;
      const qrY = qrCenterY - qrSize / 2;
      const borderW = Math.max(2, Math.round(width * LAYOUT.qrBorder));
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(qrX - borderW, qrY - borderW, qrSize + borderW * 2, qrSize + borderW * 2);
      ctx.strokeStyle = '#173F32';
      ctx.lineWidth = borderW;
      ctx.strokeRect(qrX - borderW, qrY - borderW, qrSize + borderW * 2, qrSize + borderW * 2);
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    } catch {
      // QR is decorative; skip if it fails to load
    }
  }

  // 10. Builder ID column (label above value), left-aligned right of the QR
  if (data.builderId) {
    ctx.textAlign = 'left';
    const idX = width * LAYOUT.idX;
    const idCenterY = height * LAYOUT.idCenterY;
    const valueSize = width * LAYOUT.idValueSize;
    ctx.fillStyle = '#2E6B4F';
    ctx.font = `bold ${Math.round(width * LAYOUT.idLabelSize)}px ${FONTS.mono}`;
    ctx.fillText('BUILDER ID', idX, idCenterY - valueSize * 0.6);
    ctx.fillStyle = '#173F32';
    ctx.font = `bold ${Math.round(valueSize)}px ${FONTS.mono}`;
    ctx.fillText(data.builderId, idX, idCenterY + valueSize * 0.4);
    ctx.textAlign = 'center';
  }

  // 8. Subtle gloss overlay for the laminated look
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  const gloss = ctx.createLinearGradient(0, 0, width, height);
  gloss.addColorStop(0, 'rgba(255,255,255,0)');
  gloss.addColorStop(0.5, 'rgba(255,255,255,0.4)');
  gloss.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gloss;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // 9. Subtle rounded edge stroke to define the card boundary once the clip is lifted
  drawRoundedRect(ctx, 1, 1, width - 2, height - 2, cornerRadius);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(23,63,50,0.35)';
  ctx.stroke();

  ctx.restore();

  return canvas;
}
