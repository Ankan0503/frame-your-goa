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
  orientation?: 'portrait' | 'landscape';
  cropResult?: SmartCropResult;
  qrCodeDataUrl?: string;
}

export async function renderBuilderCard(
  data: BuilderCardData,
  targetCanvas?: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
  await ensureFontsLoaded();

  const templatePath = data.orientation === 'landscape'
    ? '/assets/id-templates/goa-id-landscape-reference.png'
    : '/assets/id-templates/goa-id-portrait-reference.png';

  const templateImage = await loadImage(templatePath);
  const width = templateImage.naturalWidth || CANVAS_DIMENSIONS.builderCard.width;
  const height = templateImage.naturalHeight || CANVAS_DIMENSIONS.builderCard.height;

  const canvas = targetCanvas || document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain 2D canvas context');

  ctx.drawImage(templateImage, 0, 0, width, height);

  const photoBox = data.orientation === 'landscape'
    ? {
        x: width * 0.08,
        y: height * 0.20,
        width: width * 0.28,
        height: height * 0.56,
        radius: width * 0.04,
      }
    : {
        x: width * 0.32,
        y: height * 0.18,
        width: width * 0.36,
        height: width * 0.36,
        radius: width * 0.5,
      };

  if (data.photoUrl) {
    try {
      const img = await loadImage(data.photoUrl);
      const crop = data.cropResult?.transform || {
        cropX: 0,
        cropY: 0,
        cropWidth: img.width,
        cropHeight: img.height,
      };

      ctx.save();
      if (data.orientation === 'landscape') {
        drawRoundedRect(ctx, photoBox.x, photoBox.y, photoBox.width, photoBox.height, photoBox.radius);
      } else {
        ctx.beginPath();
        ctx.arc(photoBox.x + photoBox.width / 2, photoBox.y + photoBox.height / 2, photoBox.width / 2, 0, Math.PI * 2);
        ctx.closePath();
      }
      ctx.clip();

      ctx.drawImage(
        img,
        crop.cropX,
        crop.cropY,
        crop.cropWidth,
        crop.cropHeight,
        photoBox.x,
        photoBox.y,
        photoBox.width,
        photoBox.height
      );
      ctx.restore();
    } catch {
      // Photo fallback
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = Math.max(6, width * 0.006);
    if (data.orientation === 'landscape') {
      drawRoundedRect(ctx, photoBox.x, photoBox.y, photoBox.width, photoBox.height, photoBox.radius);
    } else {
      ctx.beginPath();
      ctx.arc(photoBox.x + photoBox.width / 2, photoBox.y + photoBox.height / 2, photoBox.width / 2, 0, Math.PI * 2);
      ctx.closePath();
    }
    ctx.stroke();
  }

  const nameText = data.fullName || 'YOUR NAME';
  const stackText = data.role || 'BUILDER';
  const projectText = data.project || 'HH GOA 2026';

  if (data.orientation === 'landscape') {
    const textX = photoBox.x + photoBox.width + width * 0.05;
    const textWidth = width - textX - width * 0.08;

    ctx.textAlign = 'left';
    ctx.fillStyle = COLORS.deepForest;
    ctx.font = `bold ${Math.round(width * 0.045)}px ${FONTS.calistoga}`;
    ctx.fillText(nameText.toUpperCase(), textX, photoBox.y + height * 0.07);

    ctx.fillStyle = COLORS.coralRed;
    ctx.font = `bold ${Math.round(width * 0.03)}px ${FONTS.oswald}`;
    ctx.fillText(stackText.toUpperCase(), textX, photoBox.y + height * 0.13);

    ctx.fillStyle = COLORS.deepForest;
    ctx.font = `bold ${Math.round(width * 0.02)}px ${FONTS.mono}`;
    ctx.fillText(projectText.toUpperCase(), textX, photoBox.y + height * 0.19);

    const badgeY = photoBox.y + photoBox.height + height * 0.04;
    ctx.fillStyle = 'rgba(23, 63, 50, 0.88)';
    ctx.fillRect(textX, badgeY, textWidth * 0.95, height * 0.065);
    ctx.fillStyle = COLORS.goldenYellow;
    ctx.font = `bold ${Math.round(width * 0.025)}px ${FONTS.mono}`;
    ctx.fillText(`BUILDER ID: ${data.builderId}`, textX + width * 0.01, badgeY + height * 0.042);
  } else {
    const centerX = width / 2;
    const textY = photoBox.y + photoBox.height + height * 0.05;

    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.deepForest;
    ctx.font = `bold ${Math.round(width * 0.05)}px ${FONTS.calistoga}`;
    ctx.fillText(nameText.toUpperCase(), centerX, textY);

    ctx.fillStyle = COLORS.coralRed;
    ctx.font = `bold ${Math.round(width * 0.03)}px ${FONTS.oswald}`;
    ctx.fillText(stackText.toUpperCase(), centerX, textY + height * 0.06);

    ctx.fillStyle = COLORS.deepForest;
    ctx.font = `bold ${Math.round(width * 0.022)}px ${FONTS.mono}`;
    ctx.fillText(projectText.toUpperCase(), centerX, textY + height * 0.11);

    const badgeWidth = width * 0.44;
    const badgeHeight = height * 0.07;
    const badgeX = centerX - badgeWidth / 2;
    const badgeY = textY + height * 0.145;

    ctx.fillStyle = 'rgba(23, 63, 50, 0.9)';
    drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, badgeHeight * 0.38);
    ctx.fill();

    ctx.fillStyle = COLORS.goldenYellow;
    ctx.font = `bold ${Math.round(width * 0.023)}px ${FONTS.mono}`;
    ctx.fillText(`BUILDER ID: ${data.builderId}`, centerX, badgeY + badgeHeight * 0.62);
  }

  return canvas;
}
