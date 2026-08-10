export type ImageOrientation = 'portrait' | 'landscape' | 'square';

export interface UploadedImage {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  orientation: ImageOrientation;
  mimeType: string;
  size: number;
}

export type ImageUploadError =
  | 'unsupported-format'
  | 'file-too-large'
  | 'corrupted-image'
  | 'image-decode-failed';

export const imageUploadMessages: Record<ImageUploadError, string> = {
  'unsupported-format': 'Please choose a JPG, PNG, HEIC, or HEIF photo.',
  'file-too-large': 'That photo is over 15 MB. Please choose a smaller one.',
  'corrupted-image': 'We couldn’t open that photo. Please choose another one.',
  'image-decode-failed': 'This photo could not be decoded. Please choose another one.',
};
