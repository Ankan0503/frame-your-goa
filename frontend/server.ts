import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';
import { Redis } from '@upstash/redis';

// Reload environment variables with new X credentials
dotenv.config();

// Resolve the built frontend folder robustly (Vercel sandbox vs local).
// Avoids import.meta.url — it is undefined when bundled to CommonJS by Vercel.
function resolveDistDir(): string {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, 'dist'),
    path.join(cwd, '..', 'dist'),
    path.join(cwd, 'frontend', 'dist'),
    path.join(cwd, '..', 'frontend', 'dist'),
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(path.join(candidate, 'index.html'))) return candidate;
    } catch {
      // ignore
    }
  }
  return candidates[0];
}

const X_API_KEY = process.env.X_API_KEY || '';
const X_API_SECRET = process.env.X_API_SECRET || '';
const X_CALLBACK_URL = process.env.X_CALLBACK_URL || '';

// Unique builder ID issuance via Upstash Redis (atomic INCR).
// Covers 1,679,616 (36^4) sequential IDs; beyond that the suffix grows to 5+ chars.
const ID_COUNTER_KEY = 'hhg2026-id-counter';

let upstashRedis: Redis | null | undefined; // undefined = not initialized yet
function getRedis(): Redis | null {
  if (upstashRedis === undefined) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    upstashRedis = url && token ? new Redis({ url, token }) : null;
  }
  return upstashRedis;
}

// Dev-only fallback counter (not atomic across instances) used when Upstash is not configured.
let localIdCounter = 0;

function encodeBuilderId(count: number): string {
  return `hhg-2026-${count.toString(36).padStart(4, '0')}`;
}

async function issueNextBuilderId(): Promise<string> {
  const redis = getRedis();
  if (redis) {
    const count = await redis.incr(ID_COUNTER_KEY);
    return encodeBuilderId(count);
  }
  localIdCounter += 1;
  return encodeBuilderId(localIdCounter);
}

// Register image/avif mime type globally if the express static mime registry is available
try {
  if (express.static && (express.static as any).mime && typeof (express.static as any).mime.define === 'function') {
    (express.static as any).mime.define({ 'image/avif': ['avif'] });
  }
} catch (e) {
  // Fallback to setHeaders in staticOptions will handle this if the registry fails
}

interface ShareRecord {
  id: string;
  imageBuffer?: Buffer;
  landscapeImageBuffer?: Buffer;
  blobImageUrl?: string;
  blobLandscapeImageUrl?: string;
  title: string;
  description: string;
  type: string;
  createdAt: number;
  width?: number;
  height?: number;
  landscapeWidth?: number;
  landscapeHeight?: number;
  metadata?: any;
}

// In-memory store for generated share graphics (LRU / TTL strategy)
const shareStore = new Map<string, ShareRecord>();
const MAX_SHARE_ENTRIES = 500;
const TTL_MS = 72 * 60 * 60 * 1000; // 72 Hours Expiration

// Pending X (Twitter) 3-legged OAuth posts awaiting user authorization
interface PendingXPost {
  shareId?: string;
  imageDataUrl?: string;
  caption: string;
  oauthTokenSecret: string;
  createdAt: number;
}
const xAuthStore = new Map<string, PendingXPost>();
const X_AUTH_TTL_MS = 10 * 60 * 1000; // 10 Minutes to complete authorization
const MAX_X_AUTH_ENTRIES = 200;

async function getShareRecord(id: string): Promise<ShareRecord | null> {
  const local = shareStore.get(id);
  if (local) return local;

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    try {
      const { list } = await import('@vercel/blob');
      const { blobs } = await list({
        prefix: `shares/${id}`,
        token,
      });

      const jsonBlob = blobs.find(b => b.pathname.endsWith('.json'));
      const imageBlob = blobs.find(b => 
        (b.pathname.endsWith('.png') || 
        b.pathname.endsWith('.jpeg') || 
        b.pathname.endsWith('.jpg') || 
        b.pathname.endsWith('.webp')) &&
        !b.pathname.includes('_landscape')
      );
      const landscapeImageBlob = blobs.find(b => 
        (b.pathname.endsWith('.png') || 
        b.pathname.endsWith('.jpeg') || 
        b.pathname.endsWith('.jpg') || 
        b.pathname.endsWith('.webp')) &&
        b.pathname.includes('_landscape')
      );

      if (jsonBlob && imageBlob) {
        const response = await fetch(jsonBlob.url);
        if (response.ok) {
          const meta = await response.json();
          return {
            id,
            blobImageUrl: imageBlob.url,
            blobLandscapeImageUrl: landscapeImageBlob?.url,
            title: meta.title || '',
            description: meta.description || '',
            type: meta.type || 'builder',
            createdAt: meta.createdAt || Date.now(),
            width: meta.width,
            height: meta.height,
            landscapeWidth: meta.landscapeWidth,
            landscapeHeight: meta.landscapeHeight,
          };
        }
      }
    } catch (err) {
      console.error('Error fetching share record from Vercel Blob:', err);
    }
  }
  return null;
}

function cleanupXAuth() {
  const now = Date.now();
  for (const [token, pending] of xAuthStore.entries()) {
    if (now - pending.createdAt > X_AUTH_TTL_MS) {
      xAuthStore.delete(token);
    }
  }
  if (xAuthStore.size > MAX_X_AUTH_ENTRIES) {
    const oldestKeys = Array.from(xAuthStore.keys()).slice(
      0,
      xAuthStore.size - MAX_X_AUTH_ENTRIES
    );
    for (const key of oldestKeys) {
      xAuthStore.delete(key);
    }
  }
}

// Periodic cleanup task every 10 mins
setInterval(cleanupXAuth, 10 * 60 * 1000);

function createXAppClient(): TwitterApi | null {
  if (!X_API_KEY || !X_API_SECRET) return null;
  return new TwitterApi({ appKey: X_API_KEY, appSecret: X_API_SECRET });
}

function buildXPostResultHtml(result: {
  status: 'success' | 'error';
  tweetUrl?: string;
  message?: string;
}): string {
  const heading =
    result.status === 'success' ? 'Posted to X!' : 'Post failed';
  const message =
    result.status === 'success'
      ? 'Your builder pass was posted to X.'
      : result.message || 'Something went wrong while posting to X.';
  const payload = JSON.stringify({ ...result, type: 'X_POST_RESULT' }).replace(/<\//g, '<\\/');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="robots" content="noindex" />
  <title>${heading}</title>
</head>
<body style="font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#F6F0E3;color:#173F32">
  <div style="text-align:center;max-width:420px;padding:24px">
    <div style="font-size:44px;line-height:1">${result.status === 'success' ? '✅' : '⚠️'}</div>
    <h1 style="font-size:22px;margin:14px 0 8px">${heading}</h1>
    <p style="font-size:14px;opacity:0.8;margin:0 0 20px">${message}</p>
    <p style="font-size:12px;opacity:0.6;margin:0">You can close this window now.</p>
  </div>
  <script>
    (function () {
      try { window.opener.postMessage(${payload}, '*'); } catch (e) {}
      setTimeout(function () { window.close(); }, 900);
    })();
  </script>
</body>
</html>`;
}

function cleanupExpiredShares() {
  const now = Date.now();
  for (const [id, record] of shareStore.entries()) {
    if (now - record.createdAt > TTL_MS) {
      shareStore.delete(id);
    }
  }

  // Enforce Max Size LRU
  if (shareStore.size > MAX_SHARE_ENTRIES) {
    const oldestKeys = Array.from(shareStore.keys()).slice(
      0,
      shareStore.size - MAX_SHARE_ENTRIES
    );
    for (const key of oldestKeys) {
      shareStore.delete(key);
    }
  }
}

// Periodic cleanup task every 30 mins
setInterval(cleanupExpiredShares, 30 * 60 * 1000);

let app: express.Express;

async function startServer() {
  app = express();
  
  // Resolve port dynamically from environment variables, CLI arguments, or default to 3000
  let parsedPort = 3000;
  if (process.env.PORT) {
    const val = parseInt(process.env.PORT, 10);
    if (!isNaN(val)) parsedPort = val;
  } else {
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--port' || arg === '-port' || arg === '-p') {
        const nextVal = parseInt(args[i + 1], 10);
        if (!isNaN(nextVal)) {
          parsedPort = nextVal;
          break;
        }
      }
      if (arg.startsWith('--port=') || arg.startsWith('-port=') || arg.startsWith('-p=')) {
        const val = parseInt(arg.split('=')[1], 10);
        if (!isNaN(val)) {
          parsedPort = val;
          break;
        }
      }
    }
    if (parsedPort === 3000) {
      for (const arg of args) {
        const val = parseInt(arg, 10);
        if (!isNaN(val) && val >= 1024 && val < 65536) {
          parsedPort = val;
          break;
        }
      }
    }
  }
  const PORT = parsedPort;

  // Body parser with 25MB limit for high-res PNG canvas exports.
  // Note: Vercel serverless runtime automatically parses the request body. We must
  // avoid running express.json() if req.body is already defined, otherwise body-parser
  // will attempt to read a consumed request stream and throw "stream is not readable".
  app.use((req, res, next) => {
    if (req.body !== undefined) {
      return next();
    }
    express.json({ limit: '25mb' })(req, res, next);
  });

  // Helper to resolve request host & protocol for public URLs
  const getBaseUrl = (req: express.Request) => {
    const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    return `${proto}://${host}`;
  };

  // 0. GET /api/id/next - Atomically issue the next unique builder ID
  app.get('/api/id/next', async (_req, res) => {
    try {
      const id = await issueNextBuilderId();
      return res.json({ id, display: id.toUpperCase() });
    } catch (err) {
      console.error('Error issuing builder ID:', err);
      return res.status(500).json({ error: 'Failed to issue builder ID' });
    }
  });

  // 1. POST /api/share - Upload generated graphic and return unique share link
  app.post('/api/share', async (req, res) => {
    try {
      const {
        imageDataUrl,
        landscapeDataUrl,
        title,
        description,
        type,
        metadata,
        id: suppliedId,
        width,
        height,
        landscapeWidth,
        landscapeHeight,
      } = req.body;

      if (!imageDataUrl || typeof imageDataUrl !== 'string') {
        return res.status(400).json({ error: 'Missing required imageDataUrl parameter' });
      }

      cleanupExpiredShares();

      // Extract base64 buffer and detect mimetype dynamically for original image
      const mimeMatch = imageDataUrl.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      const extension = mimeType.split('/')[1] || 'png';

      const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Process landscape image if provided
      let landscapeImageBuffer: Buffer | undefined;
      let landscapeMimeType: string | undefined;
      let landscapeExtension: string | undefined;
      if (landscapeDataUrl) {
        const lMimeMatch = landscapeDataUrl.match(/^data:(image\/\w+);base64,/);
        landscapeMimeType = lMimeMatch ? lMimeMatch[1] : 'image/png';
        landscapeExtension = landscapeMimeType.split('/')[1] || 'png';
        const lBase64Data = landscapeDataUrl.replace(/^data:image\/\w+;base64,/, '');
        landscapeImageBuffer = Buffer.from(lBase64Data, 'base64');
      }

      // Use the provided builder ID when available (deterministic, predictable share URL),
      // otherwise fall back to a random share id.
      const validId = typeof suppliedId === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(suppliedId);
      const id = validId ? suppliedId : `hhg-${Math.random().toString(36).substring(2, 10)}`;
      const baseUrl = getBaseUrl(req);

      let blobImageUrl = '';
      let blobLandscapeImageUrl = '';
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (token) {
        try {
          const { put } = await import('@vercel/blob');
          const pngBlob = await put(`shares/${id}.${extension}`, imageBuffer, {
            access: 'public',
            token,
            contentType: mimeType,
          });
          blobImageUrl = pngBlob.url;

          if (landscapeImageBuffer && landscapeMimeType && landscapeExtension) {
            const lPngBlob = await put(`shares/${id}_landscape.${landscapeExtension}`, landscapeImageBuffer, {
              access: 'public',
              token,
              contentType: landscapeMimeType,
            });
            blobLandscapeImageUrl = lPngBlob.url;
          }

          const metadataString = JSON.stringify({
            id,
            title: title || 'HH Goa 2026 Builder Pass',
            description: description || 'Official Hacker House Goa 2026 Pass. See you in Goa! #FrameInGoa',
            type: type || 'builder',
            createdAt: Date.now(),
            width: typeof width === 'number' ? width : undefined,
            height: typeof height === 'number' ? height : undefined,
            landscapeWidth: typeof landscapeWidth === 'number' ? landscapeWidth : undefined,
            landscapeHeight: typeof landscapeHeight === 'number' ? landscapeHeight : undefined,
          });
          await put(`shares/${id}.json`, Buffer.from(metadataString), {
            access: 'public',
            token,
            contentType: 'application/json',
          });
          console.log('Saved to Vercel Blob successfully:', id);
        } catch (blobErr) {
          console.error('Error saving to Vercel Blob:', blobErr);
        }
      }

      const record: ShareRecord = {
        id,
        imageBuffer,
        landscapeImageBuffer,
        blobImageUrl,
        blobLandscapeImageUrl,
        title: title || 'HH Goa 2026 Builder Pass',
        description:
          description || 'Official Hacker House Goa 2026 Pass. See you in Goa! #FrameInGoa',
        type: type || 'builder',
        createdAt: Date.now(),
        width: typeof width === 'number' ? width : undefined,
        height: typeof height === 'number' ? height : undefined,
        landscapeWidth: typeof landscapeWidth === 'number' ? landscapeWidth : undefined,
        landscapeHeight: typeof landscapeHeight === 'number' ? landscapeHeight : undefined,
        metadata,
      };

      shareStore.set(id, record);

      const shareUrl = `${baseUrl}/share/${id}`;
      const imageUrl = blobImageUrl || `${baseUrl}/api/share/image/${id}.png`;
      const landscapeImageUrl = blobLandscapeImageUrl || (landscapeImageBuffer ? `${baseUrl}/api/share/image/${id}_landscape.png` : imageUrl);

      return res.json({
        shareId: id,
        shareUrl,
        imageUrl,
        landscapeImageUrl,
        title: record.title,
        description: record.description,
        createdAt: new Date(record.createdAt).toISOString(),
        width: record.width,
        height: record.height,
        landscapeWidth: record.landscapeWidth,
        landscapeHeight: record.landscapeHeight,
      });
    } catch (err: any) {
      console.error('Error creating share link:', err);
      return res.status(500).json({ error: 'Failed to process share upload' });
    }
  });

  // 2. GET /api/share/:id - Retrieve share metadata
  app.get('/api/share/:id', async (req, res) => {
    const record = await getShareRecord(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Share ID not found or expired' });
    }

    const baseUrl = getBaseUrl(req);
    return res.json({
      shareId: record.id,
      shareUrl: `${baseUrl}/share/${record.id}`,
      imageUrl: record.blobImageUrl || `${baseUrl}/api/share/image/${record.id}.png`,
      landscapeImageUrl: record.blobLandscapeImageUrl || (record.landscapeImageBuffer ? `${baseUrl}/api/share/image/${record.id}_landscape.png` : undefined),
      title: record.title,
      description: record.description,
      type: record.type,
      createdAt: new Date(record.createdAt).toISOString(),
      width: record.width,
      height: record.height,
      landscapeWidth: record.landscapeWidth,
      landscapeHeight: record.landscapeHeight,
    });
  });

  // 3. GET /api/share/image/:id.png - Serve raw image PNG for Open Graph crawlers & previews
  app.get('/api/share/image/:id.png', async (req, res) => {
    const rawId = req.params.id.replace(/\.png$/, '');
    const isLandscape = rawId.endsWith('_landscape');
    const lookupId = isLandscape ? rawId.replace(/_landscape$/, '') : rawId;

    const record = await getShareRecord(lookupId);

    if (!record) {
      return res.status(404).send('Image not found or expired');
    }

    if (isLandscape) {
      if (record.blobLandscapeImageUrl) {
        return res.redirect(record.blobLandscapeImageUrl);
      }
      if (record.landscapeImageBuffer) {
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
        return res.send(record.landscapeImageBuffer);
      }
    }

    if (record.blobImageUrl) {
      return res.redirect(record.blobImageUrl);
    }

    if (record.imageBuffer) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      return res.send(record.imageBuffer);
    }

    return res.status(404).send('Image buffer not available');
  });

  // 4a. POST /api/x/post - Begin 3-legged OAuth to post a generated pass to the visitor's X account
  app.post('/api/x/post', async (req, res) => {
    const { shareId, imageDataUrl, caption } = req.body || {};
    if (!shareId && !imageDataUrl) {
      return res.status(400).json({ error: 'Missing shareId or imageDataUrl' });
    }
    const text = String(caption || '').trim();
    if (!text) {
      return res.status(400).json({ error: 'Missing caption' });
    }

    const appClient = createXAppClient();
    if (!appClient) {
      return res
        .status(501)
        .json({ error: 'X API credentials not configured on the server' });
    }

    try {
      const callbackUrl =
        X_CALLBACK_URL || `${getBaseUrl(req)}/api/x/callback`;
      const authLink = await appClient.generateAuthLink(callbackUrl);

      xAuthStore.set(authLink.oauth_token, {
        shareId,
        imageDataUrl,
        caption: text,
        oauthTokenSecret: authLink.oauth_token_secret,
        createdAt: Date.now(),
      });

      return res.json({ authorizeUrl: authLink.url });
    } catch (err: any) {
      console.error('Error starting X authorization:', err);
      return res
        .status(500)
        .json({ error: 'Failed to start X authorization' });
    }
  });

  // 4b. GET /api/x/callback - Complete OAuth, upload pass media & post the tweet
  app.get('/api/x/callback', async (req, res) => {
    const { oauth_token, oauth_verifier } = req.query;
    if (!oauth_token || !oauth_verifier) {
      return res.status(400).send('Missing OAuth parameters');
    }

    const token = String(oauth_token);
    const pending = xAuthStore.get(token);
    if (!pending) {
      return res
        .status(400)
        .send('X authorization request expired. Please try again.');
    }

    const respondWithError = (message: string) => {
      xAuthStore.delete(token);
      res
        .status(200)
        .set({ 'Content-Type': 'text/html' })
        .send(buildXPostResultHtml({ status: 'error', message }));
    };

    try {
      const requestClient = new TwitterApi({
        appKey: X_API_KEY,
        appSecret: X_API_SECRET,
        accessToken: token,
        accessSecret: pending.oauthTokenSecret,
      });
      const loginResult = await requestClient.login(String(oauth_verifier));
      const userClient = loginResult.client;
      console.log('X OAuth step OK: access token exchanged');

      let imageBuffer: Buffer | null = null;
      if (pending.shareId) {
        const record = await getShareRecord(pending.shareId);
        if (record) {
          if (record.imageBuffer) {
            imageBuffer = record.imageBuffer;
          } else if (record.blobImageUrl) {
            try {
              const imgRes = await fetch(record.blobImageUrl);
              if (imgRes.ok) {
                imageBuffer = Buffer.from(await imgRes.arrayBuffer());
              }
            } catch (fetchErr) {
              console.error('Error fetching image from blob URL:', fetchErr);
            }
          }
        }
      }
      if (!imageBuffer && pending.imageDataUrl) {
        const base64 = pending.imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64, 'base64');
      }
      if (!imageBuffer) {
        return respondWithError('Pass image was not found or has expired.');
      }

      const mediaUploadResult = await userClient.v1.uploadMedia(imageBuffer, {
        mimeType: 'image/png',
      });
      console.log('X OAuth step OK: media uploaded, result:', mediaUploadResult);

      const mediaIdStr = typeof mediaUploadResult === 'string' 
        ? mediaUploadResult 
        : (mediaUploadResult as any).media_id_string;

      if (!mediaIdStr) {
        throw new Error('Failed to retrieve media_id_string from upload response');
      }

      const truncatedCaption =
        pending.caption.length > 280
          ? `${pending.caption.slice(0, 277)}...`
          : pending.caption;

      const tweet = await userClient.v2.tweet(truncatedCaption, {
        media: { media_ids: [mediaIdStr] },
      });
      console.log('X OAuth step OK: tweet posted, id', tweet.data.id);

      const tweetUrl = `https://x.com/i/web/status/${tweet.data.id}`;

      xAuthStore.delete(token);
      res
        .status(200)
        .set({ 'Content-Type': 'text/html' })
        .send(buildXPostResultHtml({ status: 'success', tweetUrl }));
    } catch (err: any) {
      const step = err && err.message ? String(err.message) : 'Failed to post to X';
      const apiData = err && err.data ? JSON.stringify(err.data) : '';
      console.error(`Error posting to X (${step})`, apiData);
      respondWithError(`${step}${apiData ? ` — ${apiData}` : ''}`);
    }
  });

  // 5. HTML Handler with Open Graph Tag Injection for /share/:id
  const renderHtmlWithOgTags = async (req: express.Request, res: express.Response, rawHtml: string) => {
    const requestPath = req.originalUrl || req.path;
    const shareIdMatch = requestPath.match(/^\/share\/([a-zA-Z0-9_-]+)/);
    const shareId = shareIdMatch ? shareIdMatch[1] : null;

    let ogTitle = 'Frame Your Goa — HH Goa 2026';
    let ogDesc = 'Official Hacker House Goa 2026 Graphic Generator. See you in Goa! #FrameInGoa';
    const baseUrl = getBaseUrl(req);
    let ogImage = `${baseUrl}/favicon/apple-touch-icon.png`;
    let ogUrl = `${baseUrl}${requestPath}`;
    let ogWidth = '1200';
    let ogHeight = '1200';

    if (shareId) {
      const record = await getShareRecord(shareId);
      if (record) {
        ogTitle = `${record.title} | #FrameInGoa`;
        ogDesc = record.description;
        ogImage = record.blobLandscapeImageUrl || record.blobImageUrl || `${baseUrl}/api/share/image/${shareId}.png`;
        ogUrl = `${baseUrl}/share/${shareId}`;

        if (record.blobLandscapeImageUrl || record.landscapeImageBuffer) {
          ogWidth = String(record.landscapeWidth || 3056);
          ogHeight = String(record.landscapeHeight || 1600);
        } else if (record.width && record.height) {
          ogWidth = String(record.width);
          ogHeight = String(record.height);
        } else {
          ogWidth = '1200';
          ogHeight = '1600';
        }
      }
    }

    const ogTagsHtml = `
    <!-- Open Graph / X Social Preview Meta Tags -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(ogTitle)}" />
    <meta property="og:description" content="${escapeHtml(ogDesc)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="${ogWidth}" />
    <meta property="og:image:height" content="${ogHeight}" />
    <meta property="og:url" content="${ogUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(ogDesc)}" />
    <meta name="twitter:image" content="${ogImage}" />
    `;

    // Inject before </head>
    const injectedHtml = rawHtml.replace('</head>', `${ogTagsHtml}\n</head>`);
    res.status(200).set({ 'Content-Type': 'text/html' }).end(injectedHtml);
  };

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Explicit handler for /share/* route to serve HTML with OG tags before static/vite fallback
  app.get(['/share/*', '/share'], async (req, res, next) => {
    try {
      if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL && viteInstance) {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await viteInstance.transformIndexHtml(req.originalUrl, template);
        return await renderHtmlWithOgTags(req, res, template);
      } else {
        const distPath = resolveDistDir();
        const template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
        return await renderHtmlWithOgTags(req, res, template);
      }
    } catch (e) {
      next(e);
    }
  });

  let viteInstance: any = null;

  // Options to handle mime-type overrides (e.g. for AVIF images on older Node/Express versions)
  const staticOptions = {
    setHeaders: (res: any, filePath: string) => {
      if (/\.avif$/i.test(filePath)) {
        res.setHeader('Content-Type', 'image/avif');
      }
    }
  };

  // Vite Integration (Dev only). Never load Vite inside the Vercel serverless function.
  // Vite bundles native binaries (rollup/esbuild) that crash in the serverless sandbox.
  if (process.env.NODE_ENV !== 'production') {
    const viteModuleName = 'vite';
    const { createServer: createViteServer } = await import(viteModuleName);
    viteInstance = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Serve public static assets (like /assets or /favicon) in development
    app.use(express.static(path.join(process.cwd(), 'public'), staticOptions));
    app.use(viteInstance.middlewares);
  } else {
    const distPath = resolveDistDir();
    app.use(express.static(distPath, { index: false, ...staticOptions }));

    app.get('*', async (req, res) => {
      try {
        const template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
        await renderHtmlWithOgTags(req, res, template);
      } catch (e) {
        res.status(500).send('Internal Server Error');
      }
    });
  }

  const isStandalone = process.argv[1] && (
    process.argv[1].endsWith('server.ts') ||
    process.argv[1].endsWith('server.js') ||
    process.argv[1].endsWith('server.cjs')
  );

  if (isStandalone) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`HH Goa 2026 Share Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

const serverPromise = startServer();

export default async (req: any, res: any) => {
  await serverPromise;
  app(req, res);
};
