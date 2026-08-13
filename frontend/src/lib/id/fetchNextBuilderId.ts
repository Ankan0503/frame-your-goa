export interface NextBuilderId {
  /** Canonical lowercase form, e.g. hhg-2026-0a1b (used in URLs). */
  id: string;
  /** Uppercase display form, e.g. HHG-2026-0A1B (printed on the card). */
  display: string;
}

/**
 * Requests the next globally-unique builder ID from the server.
 * The server issues it atomically via an Upstash Redis INCR.
 */
export async function fetchNextBuilderId(): Promise<NextBuilderId> {
  const res = await fetch('/api/id/next', { method: 'GET' });
  if (!res.ok) {
    throw new Error(`Failed to issue builder ID: ${res.statusText}`);
  }
  const data = await res.json();
  const id: string = typeof data.id === 'string' ? data.id : '';
  const display: string = typeof data.display === 'string' ? data.display : id.toUpperCase();
  if (!/^hhg-2026-[a-z0-9]{4,}$/.test(id)) {
    throw new Error('Invalid builder ID received from server');
  }
  return { id, display };
}
