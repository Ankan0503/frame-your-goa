import { useCallback, useEffect, useRef, useState } from 'react';
import type { ImageOrientation, ImageUploadError, UploadedImage } from '../types/image';

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/heic', 'image/heif']);
const ACCEPTED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'heic', 'heif']);

const getOrientation = (width: number, height: number): ImageOrientation => {
  if (width === height) return 'square';
  return width > height ? 'landscape' : 'portrait';
};

const waitForImage = (url: string) => new Promise<{ width: number; height: number }>((resolve, reject) => {
  const image = new Image();
  image.onload = async () => {
    try {
      if ('decode' in image) await image.decode();
      if (!image.naturalWidth || !image.naturalHeight) throw new Error('Invalid dimensions');
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    } catch {
      reject(new Error('Decode failed'));
    }
  };
  image.onerror = () => reject(new Error('Load failed'));
  image.src = url;
});

export function useImageUpload() {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [error, setError] = useState<ImageUploadError | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const activeUrl = useRef<string | null>(null);

  const reset = useCallback(() => {
    if (activeUrl.current) URL.revokeObjectURL(activeUrl.current);
    activeUrl.current = null;
    setImage(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  useEffect(() => () => {
    if (activeUrl.current) URL.revokeObjectURL(activeUrl.current);
  }, []);

  const selectFile = useCallback(async (file: File) => {
    setError(null);
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

    if (!ACCEPTED_TYPES.has(file.type) && !ACCEPTED_EXTENSIONS.has(extension)) {
      setError('unsupported-format');
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('file-too-large');
      return null;
    }

    setIsProcessing(true);
    const nextUrl = URL.createObjectURL(file);

    try {
      const { width, height } = await waitForImage(nextUrl);

      if (activeUrl.current) URL.revokeObjectURL(activeUrl.current);
      activeUrl.current = nextUrl;

      const uploadedImage: UploadedImage = {
        file,
        previewUrl: nextUrl,
        width,
        height,
        orientation: getOrientation(width, height),
        mimeType: file.type,
        size: file.size,
      };

      setImage(uploadedImage);
      return uploadedImage;
    } catch {
      URL.revokeObjectURL(nextUrl);
      setError(file.size === 0 ? 'corrupted-image' : 'image-decode-failed');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { image, error, isProcessing, selectFile, reset, clearError: () => setError(null) };
}
