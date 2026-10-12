import "server-only";
import { createReadStream } from "node:fs";
import { mkdir, open, rm, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

// Where marketing media lives. With MEDIA_BUCKET set (production), files go to that Google Cloud
// Storage bucket: the browser uploads straight to a resumable upload session, so large videos never
// pass through Cloud Run (32 MB request limit). Otherwise they're written to MEDIA_DIR (./data/media),
// uploaded in chunks through this app. Either way the browser sends the same chunked PUTs.

export const CHUNK = 8 * 1024 * 1024; // multiple of 256 KiB, as GCS requires
export const MAX_SIZE = 2 * 1024 ** 3; // 2 GB

const BUCKET = () => process.env.MEDIA_BUCKET?.trim() || "";
const DIR = () => path.resolve(process.env.MEDIA_DIR || "./data/media");

export const storageReady = () => !!BUCKET() || process.env.NODE_ENV !== "production";

// ---------- Google Cloud Storage (JSON API with the Cloud Run service account's token) ----------

let token: { value: string; until: number } | null = null;

async function gcsToken(): Promise<string> {
  if (token && token.until > Date.now() + 60_000) return token.value;
  const res = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token", {
    headers: { "Metadata-Flavor": "Google" },
  });
  if (!res.ok) throw new Error(`Metadata token: ${res.status}`);
  const t = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: t.access_token, until: Date.now() + t.expires_in * 1000 };
  return t.access_token;
}

const objectUrl = (key: string) => `https://storage.googleapis.com/storage/v1/b/${BUCKET()}/o/${encodeURIComponent(key)}`;

// ---------- Public API ----------

/**
 * Starts an upload. Returns the URL the browser PUTs chunks to (with Content-Range):
 * a GCS resumable session, or this app's chunk endpoint.
 */
export async function startUpload(key: string, mime: string, size: number, origin: string | null, localUrl: string): Promise<string> {
  if (!BUCKET()) {
    await mkdir(path.dirname(path.join(DIR(), key)), { recursive: true });
    await (await open(path.join(DIR(), key), "w")).close();
    return localUrl;
  }
  const res = await fetch(
    `https://storage.googleapis.com/upload/storage/v1/b/${BUCKET()}/o?uploadType=resumable&name=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await gcsToken()}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Type": mime,
        "X-Upload-Content-Length": String(size),
        // The session accepts browser PUTs from this origin (CORS).
        ...(origin ? { Origin: origin } : {}),
      },
      body: JSON.stringify({ name: key, contentType: mime }),
    },
  );
  const session = res.headers.get("location");
  if (!res.ok || !session) throw new Error(`GCS upload session: ${res.status} ${await res.text()}`);
  return session;
}

/** Local mode: writes one chunk at its offset. */
export async function writeChunk(key: string, offset: number, data: Uint8Array) {
  const f = await open(path.join(DIR(), key), "r+");
  try {
    await f.write(data, 0, data.length, offset);
  } finally {
    await f.close();
  }
}

/** Size of the stored file, or null when it's missing. */
export async function storedSize(key: string): Promise<number | null> {
  if (!BUCKET()) return stat(path.join(DIR(), key)).then((s) => s.size, () => null);
  const res = await fetch(`${objectUrl(key)}?fields=size`, { headers: { Authorization: `Bearer ${await gcsToken()}` } });
  if (!res.ok) return null;
  return Number(((await res.json()) as { size: string }).size);
}

export async function removeMedia(key: string) {
  if (!BUCKET()) return rm(path.join(DIR(), key), { force: true });
  const res = await fetch(objectUrl(key), { method: "DELETE", headers: { Authorization: `Bearer ${await gcsToken()}` } });
  if (!res.ok && res.status !== 404) throw new Error(`GCS delete: ${res.status}`);
}

/** Streams the file, honouring a single "bytes=a-b" Range so videos can seek. */
export async function mediaResponse(key: string, mime: string, size: number, range: string | null): Promise<Response> {
  const m = range?.match(/^bytes=(\d*)-(\d*)$/);
  let start = 0, end = size - 1;
  if (m && (m[1] || m[2])) {
    if (m[1]) {
      start = Number(m[1]);
      end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
    } else {
      start = Math.max(size - Number(m[2]), 0); // suffix range: last N bytes
    }
    if (start > end || start >= size) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }
  const partial = !!m && (start !== 0 || end !== size - 1);
  const headers: Record<string, string> = {
    "Content-Type": mime,
    "Content-Length": String(end - start + 1),
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
    ...(partial ? { "Content-Range": `bytes ${start}-${end}/${size}` } : {}),
  };

  let body: ReadableStream;
  if (!BUCKET()) {
    body = Readable.toWeb(createReadStream(path.join(DIR(), key), { start, end })) as ReadableStream;
  } else {
    const res = await fetch(`${objectUrl(key)}?alt=media`, {
      headers: { Authorization: `Bearer ${await gcsToken()}`, Range: `bytes=${start}-${end}` },
    });
    if (!res.ok || !res.body) return new Response("Not found", { status: 404 });
    body = res.body;
  }
  return new Response(body, { status: partial ? 206 : 200, headers });
}

/** Stores a small file in one go (screenshots and the like). */
export async function putMedia(key: string, mime: string, data: Uint8Array) {
  if (!BUCKET()) {
    const file = path.join(DIR(), key);
    await mkdir(path.dirname(file), { recursive: true });
    const f = await open(file, "w");
    try {
      await f.write(data);
    } finally {
      await f.close();
    }
    return;
  }
  const res = await fetch(`https://storage.googleapis.com/upload/storage/v1/b/${BUCKET()}/o?uploadType=media&name=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await gcsToken()}`, "Content-Type": mime },
    body: new Blob([data as Uint8Array<ArrayBuffer>], { type: mime }),
  });
  if (!res.ok) throw new Error(`GCS upload: ${res.status} ${await res.text()}`);
}
