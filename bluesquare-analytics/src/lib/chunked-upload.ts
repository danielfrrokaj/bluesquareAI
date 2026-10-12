// Browser side of the media-store protocol: start an upload, PUT the file in chunks (to Cloud
// Storage or to this app), then confirm. Used by the Archive uploader.

export async function uploadInChunks(
  file: File, start: { url: string; body: Record<string, unknown> }, completeUrl: (id: string) => string, onProgress: (pct: number) => void,
): Promise<string> {
  const res = await fetch(start.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, mime: file.type, size: file.size, ...start.body }),
  });
  const init = (await res.json().catch(() => ({}))) as { id?: string; uploadUrl?: string; chunk?: number; error?: string };
  if (!res.ok || !init.id || !init.uploadUrl || !init.chunk) throw new Error(init.error ?? "Couldn't start the upload.");

  for (let from = 0; from < file.size; from += init.chunk) {
    const to = Math.min(from + init.chunk, file.size);
    let put: Response | null = null;
    // Cloud Storage answers 308 until the last chunk; the local store answers 204. Retry blips.
    for (let attempt = 0; attempt < 3 && !(put && (put.ok || put.status === 308)); attempt++) {
      put = await fetch(init.uploadUrl, { method: "PUT", headers: { "Content-Range": `bytes ${from}-${to - 1}/${file.size}` }, body: file.slice(from, to) }).catch(() => null);
    }
    if (!put || !(put.ok || put.status === 308)) throw new Error("The upload was interrupted. Check your connection and try again.");
    onProgress(Math.round((to / file.size) * 100));
  }

  const done = await fetch(completeUrl(init.id), { method: "POST" });
  if (!done.ok) throw new Error(((await done.json().catch(() => ({}))) as { error?: string }).error ?? "Couldn't finish the upload.");
  return init.id;
}
