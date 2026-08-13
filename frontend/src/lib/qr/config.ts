/**
 * Public origin used for predictable builder pass share URLs.
 * The URL is derived from the builder ID alone, so the QR can be drawn before
 * any record is stored server-side. The link only resolves once the pass has
 * been shared (POST /api/share with the builder ID as the key).
 */
export const SHARE_ORIGIN = 'https://frame-your-goa.vercel.app';

/** Builds the predictable share URL for a canonical builder ID. */
export function buildBuilderShareUrl(canonicalId: string): string {
  return `${SHARE_ORIGIN}/share/${canonicalId}`;
}
