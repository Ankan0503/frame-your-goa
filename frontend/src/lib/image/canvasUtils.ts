/**
 * Centralized Canvas Rendering Engine Constants & Utilities
 * Ensures high-res, devicePixelRatio aware, crisp typography and deterministic rendering.
 */

export const COLORS = {
  forestGreen: '#075B3A',
  deepForest: '#173F32',
  coralRed: '#F05A68',
  goldenYellow: '#F2A900',
  warmCream: '#F6F0E3',
  cardBg: '#F8F2E6',
  photoBg: '#EDE5D4',
  borderDivider: '#D8CDB9',
  mintGreen: '#00FF9D',
  nightBg: '#071610',
  textDark: '#123B35',
} as const;

export const FONTS = {
  calistoga: '"Calistoga", serif',
  oswald: '"Oswald", sans-serif',
  mono: '"IBM Plex Mono", monospace',
  caveat: '"Caveat", cursive',
} as const;

export const CANVAS_DIMENSIONS = {
  builderCard: { width: 1200, height: 1600 },
  pfpSquare: { width: 1200, height: 1200 },
  pfpPortrait: { width: 1200, height: 1500 },
  pfpLandscape: { width: 1600, height: 900 },
  teamFrame: { width: 1600, height: 1200 },
} as const;

export const SPACING = {
  marginOuter: 50,
  cardPadding: 60,
  borderRadiusCard: 32,
  borderRadiusInner: 20,
} as const;

export const BORDER_WIDTH = {
  outerFrame: 8,
  innerFrame: 4,
  divider: 3,
} as const;

/**
 * Sanitizes strings for safe, clean filenames (e.g., "Sayan Sinha!" -> "sayan-sinha")
 */
export function sanitizeFilename(name: string): string {
  if (!name || !name.trim()) return 'builder';
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Font loading cache promise
let fontsLoadedPromise: Promise<void> | null = null;

/**
 * Ensures document web fonts (Calistoga, Oswald, IBM Plex Mono) are loaded before Canvas text drawing.
 */
export async function ensureFontsLoaded(): Promise<void> {
  if (!fontsLoadedPromise) {
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      fontsLoadedPromise = document.fonts.ready.then(() => {}).catch(() => {});
    } else {
      fontsLoadedPromise = Promise.resolve();
    }
  }
  return fontsLoadedPromise;
}

// In-memory image element cache
const imageCache = new Map<string, HTMLImageElement>();

/**
 * Loads an image into an HTMLImageElement with crossOrigin support and in-memory caching.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    const cached = imageCache.get(src)!;
    if (cached.complete && cached.naturalWidth > 0) {
      return Promise.resolve(cached);
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      if ('decode' in img) {
        try {
          await img.decode();
        } catch {
          // Ignore decode error
        }
      }
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load image from source: ${src}`));
    img.src = src;
  });
}

/**
 * Draws rounded rectangle on Canvas context
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Converts a canvas to a blob and triggers browser download with mobile fallback.
 */
export async function downloadCanvasBlob(
  canvas: HTMLCanvasElement,
  filename: string,
  format: 'image/png' | 'image/webp' = 'image/png',
  quality = 1.0
): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas blob generation failed'));
          return;
        }

        const url = URL.createObjectURL(blob);
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        try {
          const link = document.createElement('a');
          link.download = filename;
          link.href = url;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Give mobile browsers extra time to handle the download trigger before revoking
          setTimeout(() => URL.revokeObjectURL(url), isMobile ? 10000 : 2000);
          resolve();
        } catch (err) {
          // Fallback if programmatic click is blocked on strict mobile browser
          window.open(url, '_blank');
          setTimeout(() => URL.revokeObjectURL(url), 10000);
          resolve();
        }
      },
      format,
      quality
    );
  });
}
