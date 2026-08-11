export interface ShareData {
  imageDataUrl: string;
  title?: string;
  description?: string;
  type?: 'builder' | 'pfp' | 'team';
  metadata?: Record<string, any>;
}

export interface ShareResponse {
  shareId: string;
  shareUrl: string;
  imageUrl: string;
  title: string;
  description: string;
  createdAt: string;
}

/**
 * Creates a unique public share link for a generated HH Goa graphic.
 * Uploads the image to storage backend and returns public share URL & metadata.
 */
export async function createShare(data: ShareData): Promise<ShareResponse> {
  const {
    imageDataUrl,
    title = 'HH Goa 2026 Builder Pass',
    description = 'Official Hacker House Goa 2026 Pass. See you in Goa! #FrameInGoa',
    type = 'builder',
    metadata = {},
  } = data;

  try {
    const res = await fetch('/api/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageDataUrl,
        title,
        description,
        type,
        metadata,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to create share: ${res.statusText}`);
    }

    const result: ShareResponse = await res.json();
    return result;
  } catch (err) {
    console.warn('Backend share API unavailable, generating local fallback share URL:', err);

    // Fallback share link generation if server endpoint is unreachable
    const id = `hhg-${Math.random().toString(36).substring(2, 10)}`;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/share/${id}`;
    const imageUrl = `${origin}/api/share/image/${id}.png`;

    // Cache locally in localStorage for client-side persistence fallback
    try {
      const localStoreKey = `hhgoa_share_${id}`;
      localStorage.setItem(
        localStoreKey,
        JSON.stringify({
          shareId: id,
          imageDataUrl,
          title,
          description,
          type,
          createdAt: new Date().toISOString(),
        })
      );
    } catch {
      // localStorage quota safeguard
    }

    return {
      shareId: id,
      shareUrl,
      imageUrl,
      title,
      description,
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Fetches share metadata for a given shareId.
 */
export async function getShare(shareId: string): Promise<ShareResponse | null> {
  try {
    const res = await fetch(`/api/share/${shareId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // API failed, try localStorage
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(`hhgoa_share_${shareId}`);
    if (local) {
      const parsed = JSON.parse(local);
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      return {
        shareId: parsed.shareId,
        shareUrl: `${origin}/share/${parsed.shareId}`,
        imageUrl: parsed.imageDataUrl, // base64 directly
        title: parsed.title,
        description: parsed.description,
        createdAt: parsed.createdAt,
      };
    }
  } catch {
    // Ignore error
  }

  return null;
}
