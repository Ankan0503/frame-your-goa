export interface Point {
  x: number; // Normalized 0 to 1
  y: number; // Normalized 0 to 1
}

export interface BoundingBox {
  x: number; // Normalized 0 to 1 (left)
  y: number; // Normalized 0 to 1 (top)
  width: number; // Normalized 0 to 1
  height: number; // Normalized 0 to 1
}

export interface DetectedFace {
  boundingBox: BoundingBox;
  confidence?: number;
}

export interface SmartCropOptions {
  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;
  focalPoint?: Point;
  scale?: number; // Minimum 1.0 (default 1.0 = standard cover)
  position?: Point; // Offset relative adjustment (-0.5 to 0.5)
  minSubjectPadding?: number; // Padding around detected subjects
}

export interface CropTransform {
  cropX: number; // Pixels in source
  cropY: number; // Pixels in source
  cropWidth: number; // Pixels in source
  cropHeight: number; // Pixels in source
  focalPoint: Point; // Normalized focal point used
  scale: number;
  sourceAspectRatio: number;
  targetAspectRatio: number;
  objectPosition: string; // CSS object-position e.g. "45% 30%"
  zoomScale: number;
  cssStyle: {
    objectFit: 'cover';
    objectPosition: string;
    transform?: string;
  };
}

export interface SmartCropResult {
  transform: CropTransform;
  faces: DetectedFace[];
  focalPoint: Point;
  detectionMethod: 'face' | 'multi-face' | 'center-weighted' | 'salient-analysis' | 'explicit';
}

/**
 * LEVEL 2: Face Detection
 * Detects faces using browser FaceDetector API if available, or falls back to
 * skin tone / pixel analysis or lightweight heuristic analysis.
 */
export async function detectFaces(
  imageSource?: HTMLImageElement | HTMLCanvasElement | ImageData | { width: number; height: number; pixels?: Uint8ClampedArray }
): Promise<DetectedFace[]> {
  if (!imageSource) {
    return [];
  }

  // 1. Try native Web Shape Detection API (window.FaceDetector) if available
  if (typeof window !== 'undefined' && 'FaceDetector' in window) {
    try {
      // @ts-expect-error - FaceDetector is experimental in some browsers
      const detector = new window.FaceDetector({ fastMode: true, maxFaces: 10 });
      if (imageSource instanceof HTMLImageElement || imageSource instanceof HTMLCanvasElement || imageSource instanceof ImageData) {
        const nativeFaces = await detector.detect(imageSource);
        if (nativeFaces && nativeFaces.length > 0) {
          const srcW = 'naturalWidth' in imageSource ? imageSource.naturalWidth : imageSource.width;
          const srcH = 'naturalHeight' in imageSource ? imageSource.naturalHeight : imageSource.height;
          
          if (srcW > 0 && srcH > 0) {
            return nativeFaces.map((f: { boundingBox: { x: number; y: number; width: number; height: number } }) => ({
              boundingBox: {
                x: Math.max(0, Math.min(1, f.boundingBox.x / srcW)),
                y: Math.max(0, Math.min(1, f.boundingBox.y / srcH)),
                width: Math.min(1, f.boundingBox.width / srcW),
                height: Math.min(1, f.boundingBox.height / srcH),
              },
              confidence: 0.9,
            }));
          }
        }
      }
    } catch {
      // Ignore native detector errors and use fallback
    }
  }

  // 2. Fast Downscaled Pixel Analysis Fallback
  let pixels: Uint8ClampedArray | undefined;
  let width = 0;
  let height = 0;

  if ('pixels' in imageSource && imageSource.pixels) {
    pixels = imageSource.pixels;
    width = imageSource.width;
    height = imageSource.height;
  } else if (imageSource instanceof HTMLImageElement || imageSource instanceof HTMLCanvasElement) {
    try {
      const srcW = 'naturalWidth' in imageSource ? imageSource.naturalWidth || imageSource.width : imageSource.width;
      const srcH = 'naturalHeight' in imageSource ? imageSource.naturalHeight || imageSource.height : imageSource.height;

      if (srcW > 0 && srcH > 0) {
        const maxDim = 250; // Ultra-fast downscaled dimension for instant face localization
        let scale = 1;
        if (srcW > maxDim || srcH > maxDim) {
          scale = maxDim / Math.max(srcW, srcH);
        }

        width = Math.max(1, Math.round(srcW * scale));
        height = Math.max(1, Math.round(srcH * scale));

        const offCanvas = document.createElement('canvas');
        offCanvas.width = width;
        offCanvas.height = height;
        const ctx = offCanvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(imageSource, 0, 0, width, height);
          const imgData = ctx.getImageData(0, 0, width, height);
          pixels = imgData.data;
        }
      }
    } catch {
      // Ignore canvas security errors or decode issues
    }
  }

  if (pixels && width > 0 && height > 0) {
    const faces = analyzePixelsForFaces(pixels, width, height);
    if (faces.length > 0) return faces;
  }

  return [];
}

/**
 * Pixel analysis helper for skin tone and face candidate clustering
 */
function analyzePixelsForFaces(pixels: Uint8ClampedArray, width: number, height: number): DetectedFace[] {
  const step = Math.max(1, Math.floor(Math.min(width, height) / 80));
  let minX = width, maxX = 0, minY = height, maxY = 0;
  let count = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];

      // Standard skin tone heuristic in RGB space
      const isSkin =
        r > 95 && g > 40 && b > 20 &&
        (Math.max(r, g, b) - Math.min(r, g, b) > 15) &&
        Math.abs(r - g) > 15 && r > g && r > b;

      if (isSkin) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        count++;
      }
    }
  }

  if (count > 20 && maxX > minX && maxY > minY) {
    return [
      {
        boundingBox: {
          x: minX / width,
          y: minY / height,
          width: (maxX - minX) / width,
          height: (maxY - minY) / height,
        },
        confidence: 0.7,
      },
    ];
  }

  return [];
}

/**
 * LEVEL 3 & 4: Focal Point Calculation
 * Calculates focal point from detected faces or falls back to intelligent center-weighted rules.
 */
export function calculateFocalPoint(
  faces: DetectedFace[],
  sourceWidth: number,
  sourceHeight: number
): { focalPoint: Point; method: 'face' | 'multi-face' | 'center-weighted' | 'salient-analysis' } {
  if (faces && faces.length > 0) {
    if (faces.length === 1) {
      const b = faces[0].boundingBox;
      // Single face: focal point near eye level (upper 42% of face box)
      const focalX = b.x + b.width / 2;
      const focalY = b.y + b.height * 0.42;
      return {
        focalPoint: {
          x: Math.max(0.05, Math.min(0.95, focalX)),
          y: Math.max(0.05, Math.min(0.95, focalY)),
        },
        method: 'face',
      };
    } else {
      // Multiple faces: calculate bounding region containing all faces
      let minX = 1, minY = 1, maxX = 0, maxY = 0;
      for (const face of faces) {
        const b = face.boundingBox;
        if (b.x < minX) minX = b.x;
        if (b.y < minY) minY = b.y;
        if (b.x + b.width > maxX) maxX = b.x + b.width;
        if (b.y + b.height > maxY) maxY = b.y + b.height;
      }
      
      const groupCenterX = (minX + maxX) / 2;
      const groupCenterY = minY + (maxY - minY) * 0.45; // slightly upper-centered for eyes

      return {
        focalPoint: {
          x: Math.max(0.05, Math.min(0.95, groupCenterX)),
          y: Math.max(0.05, Math.min(0.95, groupCenterY)),
        },
        method: 'multi-face',
      };
    }
  }

  // LEVEL 5: Intelligent center-weighted fallback based on image orientation
  const isPortrait = sourceHeight > sourceWidth;
  const isLandscape = sourceWidth > sourceHeight;

  let defaultY = 0.45; // Rule-of-thirds upper focus for human portraits
  if (isPortrait) {
    defaultY = 0.38; // In portrait photos, subjects' heads are typically in upper third
  } else if (isLandscape) {
    defaultY = 0.42;
  }

  return {
    focalPoint: { x: 0.5, y: defaultY },
    method: 'center-weighted',
  };
}

/**
 * LEVEL 1, 6 & Mathematical Scaling: Cover Transform Calculation
 * Guarantees zero blank areas, zero stretching distortion, and proper subject framing.
 */
export function calculateCoverTransform(options: SmartCropOptions): CropTransform {
  const {
    sourceWidth,
    sourceHeight,
    targetWidth,
    targetHeight,
    focalPoint = { x: 0.5, y: 0.45 },
    scale = 1.0,
    position = { x: 0, y: 0 },
  } = options;

  const validSourceW = Math.max(1, sourceWidth);
  const validSourceH = Math.max(1, sourceHeight);
  const validTargetW = Math.max(1, targetWidth);
  const validTargetH = Math.max(1, targetHeight);

  const sourceAspect = validSourceW / validSourceH;
  const targetAspect = validTargetW / validTargetH;

  // Base scale calculation for cover fit
  const userScale = Math.max(1.0, scale);

  let unscaledCropW: number;
  let unscaledCropH: number;

  if (sourceAspect > targetAspect) {
    // Source is wider than target -> fit height, crop width
    unscaledCropH = validSourceH;
    unscaledCropW = validSourceH * targetAspect;
  } else {
    // Source is taller than target -> fit width, crop height
    unscaledCropW = validSourceW;
    unscaledCropH = validSourceW / targetAspect;
  }

  // Apply user zoom scale (scale > 1 shrinks crop box to zoom in)
  const cropW = Math.max(10, unscaledCropW / userScale);
  const cropH = Math.max(10, unscaledCropH / userScale);

  // Apply focal point + position offset
  const adjustedFocalX = Math.max(0, Math.min(1, focalPoint.x + position.x));
  const adjustedFocalY = Math.max(0, Math.min(1, focalPoint.y + position.y));

  // Ideal center of crop in source pixel coordinates
  const idealCenterX = adjustedFocalX * validSourceW;
  const idealCenterY = adjustedFocalY * validSourceH;

  // Compute crop box top-left, clamped strictly to source bounds [0, sourceWidth - cropWidth]
  const rawCropX = idealCenterX - cropW / 2;
  const rawCropY = idealCenterY - cropH / 2;

  const cropX = Math.max(0, Math.min(validSourceW - cropW, rawCropX));
  const cropY = Math.max(0, Math.min(validSourceH - cropH, rawCropY));

  // Compute CSS objectPosition percentages (0% to 100%)
  const maxAvailableShiftX = validSourceW - cropW;
  const maxAvailableShiftY = validSourceH - cropH;

  const objectXPercent = maxAvailableShiftX > 0 ? (cropX / maxAvailableShiftX) * 100 : 50;
  const objectYPercent = maxAvailableShiftY > 0 ? (cropY / maxAvailableShiftY) * 100 : 50;

  const objectPositionStr = `${objectXPercent.toFixed(2)}% ${objectYPercent.toFixed(2)}%`;

  return {
    cropX: Math.round(cropX),
    cropY: Math.round(cropY),
    cropWidth: Math.round(cropW),
    cropHeight: Math.round(cropH),
    focalPoint: { x: adjustedFocalX, y: adjustedFocalY },
    scale: userScale,
    sourceAspectRatio: sourceAspect,
    targetAspectRatio: targetAspect,
    objectPosition: objectPositionStr,
    zoomScale: userScale,
    cssStyle: {
      objectFit: 'cover',
      objectPosition: objectPositionStr,
      ...(userScale > 1.0 ? { transform: `scale(${userScale})` } : {}),
    },
  };
}

/**
 * Main Smart Crop pipeline entry point
 */
export function calculateSmartCrop(
  options: SmartCropOptions & { faces?: DetectedFace[] }
): SmartCropResult {
  const { faces = [], sourceWidth, sourceHeight } = options;

  let focalPoint = options.focalPoint;
  let method: SmartCropResult['detectionMethod'] = 'explicit';

  if (!focalPoint) {
    const focalRes = calculateFocalPoint(faces, sourceWidth, sourceHeight);
    focalPoint = focalRes.focalPoint;
    method = focalRes.method;
  }

  const transform = calculateCoverTransform({
    ...options,
    focalPoint,
  });

  return {
    transform,
    faces,
    focalPoint,
    detectionMethod: method,
  };
}
