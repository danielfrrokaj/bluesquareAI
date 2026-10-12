import "server-only";

// Logos (virtual accounts, websites): stored in the database next to their record, served by an
// authenticated route. Uploads are checked by their content, not their file name.

export const LOGO_MAX_BYTES = 300 * 1024;

export type Logo = { data: Buffer; type: string };

/** The image type from the first bytes: PNG, JPEG, WebP or SVG; null for anything else. */
function sniff(data: Buffer): string | null {
  if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return "image/jpeg";
  if (data.subarray(0, 4).toString("latin1") === "RIFF" && data.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  if (/^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE[^>]*>\s*)?<svg[\s>]/i.test(data.subarray(0, 2048).toString("utf8"))) return "image/svg+xml";
  return null;
}

/**
 * The logo sent in a form's "logo" field: undefined when none was sent, a message when it isn't
 * a usable image, otherwise the image.
 */
export async function readLogo(form: FormData): Promise<Logo | undefined | string> {
  const file = form.get("logo");
  if (!(file instanceof File) || file.size === 0) return undefined;
  if (file.size > LOGO_MAX_BYTES) return "The logo is too large: up to 300 KB.";
  const data = Buffer.from(await file.arrayBuffer());
  const type = sniff(data);
  return type ? { data, type } : "Upload a PNG, JPG, WebP or SVG image.";
}

/** Response for a logo. Its URL carries ?v=<version>, so it can be cached for good. */
export function logoResponse(logo: { data: Uint8Array; type: string } | null): Response {
  if (!logo) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(logo.data), {
    headers: {
      "Content-Type": logo.type,
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // An SVG opened directly must not run scripts.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
