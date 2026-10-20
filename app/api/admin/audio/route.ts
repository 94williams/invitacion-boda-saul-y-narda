import { requireAdmin } from "@/app/lib/auth";
import { ApiError, assertSameOrigin, database, handleApi, json, runtimeEnv } from "@/app/lib/server";
import { publicSettings, settingsRow } from "@/app/lib/settings";
export const dynamic = "force-dynamic";
const MAX_SIZE = 12 * 1024 * 1024;

function audioFormat(bytes: Uint8Array): { extension: string; type: string } | null {
  const ascii = (start: number, length: number) => String.fromCharCode(...bytes.slice(start, start + length));
  if (ascii(0, 3) === "ID3" || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) return { extension: "mp3", type: "audio/mpeg" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WAVE") return { extension: "wav", type: "audio/wav" };
  if (ascii(0, 4) === "OggS") return { extension: "ogg", type: "audio/ogg" };
  if (ascii(4, 4) === "ftyp" && ["M4A ", "M4B ", "isom", "mp42", "mp41"].includes(ascii(8, 4))) return { extension: "m4a", type: "audio/mp4" };
  return null;
}

export async function POST(request: Request) { return handleApi(async () => {
  assertSameOrigin(request); await requireAdmin(request);
  if (!runtimeEnv.BUCKET) throw new ApiError(503, "El almacenamiento de audio aún no está disponible.");
  if (Number(request.headers.get("content-length")) > MAX_SIZE + 20_000) throw new ApiError(413, "El audio debe pesar hasta 12 MB.");
  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string" || !("arrayBuffer" in file) || file.size < 12 || file.size > MAX_SIZE) throw new ApiError(400, "Selecciona un archivo de audio de hasta 12 MB.");
  if (!/\.(mp3|m4a|wav|ogg)$/i.test(file.name)) throw new ApiError(400, "Usa un archivo MP3, M4A, WAV u OGG.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const format = audioFormat(bytes);
  if (!format) throw new ApiError(400, "No pudimos reconocer ese archivo de audio.");
  const old = await settingsRow();
  const key = `wedding-audio/${crypto.randomUUID()}.${format.extension}`;
  await runtimeEnv.BUCKET.put(key, bytes, { httpMetadata: { contentType: format.type, cacheControl: "public, max-age=3600" } });
  try {
    await database().prepare(`INSERT INTO settings (id, audio_key, audio_type, audio_updated_at) VALUES (1, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET audio_key=excluded.audio_key, audio_type=excluded.audio_type, audio_updated_at=excluded.audio_updated_at`)
      .bind(key, format.type, new Date().toISOString()).run();
  } catch (error) { await runtimeEnv.BUCKET.delete(key); throw error; }
  if (old?.audioKey) await runtimeEnv.BUCKET.delete(old.audioKey).catch(() => {});
  return json(await publicSettings());
}); }

export async function DELETE(request: Request) { return handleApi(async () => {
  assertSameOrigin(request); await requireAdmin(request);
  const old = await settingsRow();
  await database().prepare("UPDATE settings SET audio_key = '', audio_type = '', audio_updated_at = '' WHERE id = 1").run();
  if (old?.audioKey && runtimeEnv.BUCKET) await runtimeEnv.BUCKET.delete(old.audioKey).catch(() => {});
  return json(await publicSettings());
}); }
