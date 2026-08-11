export interface XIntentOptions {
  text?: string;
  url?: string;
  hashtags?: string[];
}

export const DEFAULT_X_CAPTION = `Just generated my HH Goa 2026 Builder ID.

See you in Goa.

#FrameInGoa`;

/**
 * Creates an official X (Twitter) intent URL with pre-filled text and share link.
 */
export function createXIntentUrl(options: XIntentOptions = {}): string {
  const { text = DEFAULT_X_CAPTION, url = '' } = options;

  const params = new URLSearchParams();
  if (text) {
    params.set('text', text);
  }
  if (url) {
    params.set('url', url);
  }

  return `https://x.com/intent/tweet?${params.toString()}`;
}

/**
 * Opens the X intent dialog in a new browser window or popup.
 */
export function openXIntent(options: XIntentOptions = {}): Window | null {
  const intentUrl = createXIntentUrl(options);
  const width = 600;
  const height = 480;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  return window.open(
    intentUrl,
    'share_to_x',
    `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
  );
}
