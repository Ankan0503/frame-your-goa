import { type DetectedFace, type SmartCropResult } from '../image/smartCrop';

export interface SavedCard {
  /** Canonical lowercase builder ID, e.g. hhg-2026-0a1b */
  id: string;
  /** Uppercase display form, e.g. HHG-2026-0A1B */
  displayId: string;
  qrDataUrl: string;
  fullName: string;
  stack: string;
  passType: string;
  builderClass: string;
  orientation: 'portrait' | 'landscape';
  /** Persisted photo (the live source is a blob: URL that dies on refresh). */
  photoDataUrl: string;
  cropResult?: SmartCropResult | null;
  userScale?: number;
  userOffsetX?: number;
  userOffsetY?: number;
  faces?: DetectedFace[];
  createdAt: number;
}

const STORAGE_KEY = 'hhgoa_2026_last_builder_card';

/**
 * The device-scoped builder identity. One device always keeps the same builder
 * ID, even after START NEW PASS or a page refresh. It is deliberately stored
 * under its own key so clearing the last card never resets the identity.
 */
const DEVICE_ID_KEY = 'hhgoa_2026_device_builder_id';

export interface DeviceBuilderId {
  id: string;
  display: string;
}

export function getDeviceBuilderId(): DeviceBuilderId | null {
  try {
    const raw = localStorage.getItem(DEVICE_ID_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DeviceBuilderId;
    if (parsed && typeof parsed.id === 'string' && parsed.id) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function saveDeviceBuilderId(id: string, display: string): void {
  try {
    localStorage.setItem(DEVICE_ID_KEY, JSON.stringify({ id, display }));
  } catch {
    // ignore
  }
}

export function saveLastCard(card: SavedCard): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(card));
  } catch {
    // Quota exceeded or storage unavailable — non-fatal.
  }
}

export function getLastCard(): SavedCard | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedCard>;
    if (!parsed || typeof parsed.id !== 'string' || !parsed.qrDataUrl || !parsed.photoDataUrl) {
      return null;
    }
    return parsed as SavedCard;
  } catch {
    return null;
  }
}

export function clearLastCard(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Compresses an uploaded photo (blob URL) into a small data URL for persistence. */
export async function compressPhotoToDataUrl(photoUrl: string): Promise<string> {
  if (photoUrl.startsWith('data:')) return photoUrl;
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('photo load failed'));
      img.src = photoUrl;
    });
    const MAX = 900;
    const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return photoUrl;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.82);
  } catch {
    return photoUrl;
  }
}
