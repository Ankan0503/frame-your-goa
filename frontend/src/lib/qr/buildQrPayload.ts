import QRCode from 'qrcode';
import { buildBuilderShareUrl } from './config';

export interface QrPayload {
  /** Display builder ID, e.g. HHG-2026-0A1B */
  id: string;
  name: string;
  stack: string;
  pass: string;
  /** Predictable share URL, e.g. https://frame-your-goa.vercel.app/share/hhg-2026-0a1b */
  url: string;
}

export function buildQrPayload(input: {
  id: string;
  name: string;
  stack: string;
  pass: string;
}): QrPayload {
  return {
    id: input.id,
    name: input.name,
    stack: input.stack,
    pass: input.pass,
    url: buildBuilderShareUrl(input.id.toLowerCase()),
  };
}

/** Renders the payload as a JSON QR code data URL. */
export async function buildQrDataUrl(payload: QrPayload): Promise<string> {
  return QRCode.toDataURL(JSON.stringify(payload), {
    margin: 1,
    width: 480,
    errorCorrectionLevel: 'M',
  });
}
