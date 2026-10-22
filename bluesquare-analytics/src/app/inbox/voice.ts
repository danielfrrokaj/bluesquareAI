// Voice messages: recorded in the browser, then made into a file the channel accepts. WhatsApp takes Ogg/Opus (Firefox
// records that), AAC in MP4 (Safari) or MP3; Instagram takes AAC/MP4 or WAV; other channels take what was recorded.
// Chrome records WebM/Opus, so for WhatsApp and Instagram it's re-encoded here, in the browser.

import type { Channel } from "@/lib/chatwoot";

const PREFERRED = ["audio/ogg;codecs=opus", "audio/mp4;codecs=mp4a.40.2", "audio/mp4", "audio/webm;codecs=opus", "audio/webm"];

export type Recorder = { stop(): Promise<File>; cancel(): void; level(): number; seconds(): number };

/** Starts recording from the microphone (the browser asks for permission the first time). */
export async function record(channel: Channel): Promise<Recorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const mimeType = PREFERRED.find((t) => MediaRecorder.isTypeSupported(t));
  const rec = new MediaRecorder(stream, mimeType ? { mimeType, audioBitsPerSecond: 64_000 } : undefined);
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  // A level meter for the live waveform.
  const ctx = new AudioContext();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  ctx.createMediaStreamSource(stream).connect(analyser);
  const samples = new Uint8Array(analyser.fftSize);
  const started = performance.now();
  const release = () => {
    stream.getTracks().forEach((t) => t.stop());
    void ctx.close();
  };
  rec.start(250);
  return {
    seconds: () => (performance.now() - started) / 1000,
    level: () => {
      analyser.getByteTimeDomainData(samples);
      let peak = 0;
      for (const v of samples) peak = Math.max(peak, Math.abs(v - 128));
      return Math.min(1, peak / 64);
    },
    cancel: () => {
      rec.onstop = null;
      if (rec.state !== "inactive") rec.stop();
      release();
    },
    stop: () =>
      new Promise<File>((resolve, reject) => {
        rec.onstop = async () => {
          release();
          try {
            resolve(await toFile(new Blob(chunks, { type: rec.mimeType || mimeType || "audio/webm" }), channel));
          } catch (err) {
            reject(err);
          }
        };
        rec.stop();
      }),
  };
}

const stamp = () => new Date().toISOString().slice(0, 19).replace(/[-:]/g, "").replace("T", "-");

async function toFile(blob: Blob, channel: Channel): Promise<File> {
  const type = blob.type;
  const ogg = type.startsWith("audio/ogg");
  const aac = type.startsWith("audio/mp4") && !type.includes("opus");
  if (channel === "whatsapp" && !ogg && !aac) return new File([await encodeMp3(blob)], `voice-${stamp()}.mp3`, { type: "audio/mpeg" });
  if (channel === "instagram" && !aac) return new File([await encodeWav(blob)], `voice-${stamp()}.wav`, { type: "audio/wav" });
  const ext = ogg ? "ogg" : aac || type.startsWith("audio/mp4") ? "m4a" : "webm";
  return new File([blob], `voice-${stamp()}.${ext}`, { type: type.split(";")[0] });
}

/** The recording as mono 16-bit samples at 24 kHz: small, and plenty for speech. */
async function pcm(blob: Blob): Promise<{ samples: Int16Array; rate: number }> {
  const rate = 24_000;
  const decoded = await new AudioContext().decodeAudioData(await blob.arrayBuffer());
  const offline = new OfflineAudioContext(1, Math.max(1, Math.ceil(decoded.duration * rate)), rate);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const floats = (await offline.startRendering()).getChannelData(0);
  const samples = new Int16Array(floats.length);
  for (let i = 0; i < floats.length; i++) samples[i] = Math.max(-1, Math.min(1, floats[i])) * 0x7fff;
  return { samples, rate };
}

async function encodeMp3(blob: Blob): Promise<Blob> {
  const [{ Mp3Encoder }, { samples, rate }] = await Promise.all([import("@breezystack/lamejs"), pcm(blob)]);
  const encoder = new Mp3Encoder(1, rate, 64);
  const parts: Uint8Array[] = [];
  for (let i = 0; i < samples.length; i += 1152) parts.push(encoder.encodeBuffer(samples.subarray(i, i + 1152)));
  parts.push(encoder.flush());
  return new Blob(parts as BlobPart[], { type: "audio/mpeg" });
}

async function encodeWav(blob: Blob): Promise<Blob> {
  const { samples, rate } = await pcm(blob);
  const header = new DataView(new ArrayBuffer(44));
  const ascii = (at: number, s: string) => [...s].forEach((c, i) => header.setUint8(at + i, c.charCodeAt(0)));
  ascii(0, "RIFF");
  header.setUint32(4, 36 + samples.byteLength, true);
  ascii(8, "WAVEfmt ");
  header.setUint32(16, 16, true);
  header.setUint16(20, 1, true); // PCM
  header.setUint16(22, 1, true); // mono
  header.setUint32(24, rate, true);
  header.setUint32(28, rate * 2, true);
  header.setUint16(32, 2, true);
  header.setUint16(34, 16, true);
  ascii(36, "data");
  header.setUint32(40, samples.byteLength, true);
  return new Blob([header.buffer, samples.buffer as ArrayBuffer], { type: "audio/wav" });
}
