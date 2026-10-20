import { ApiError, handleApi, runtimeEnv } from "@/app/lib/server";
import { settingsRow } from "@/app/lib/settings";
export const dynamic = "force-dynamic";

function requestedBytes(value: string, size: number): { offset: number; length: number } | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
  if (!match || (!match[1] && !match[2]) || size === 0) return null;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix < 1) return null;
    const length = Math.min(suffix, size);
    return { offset: size - length, length };
  }
  const offset = Number(match[1]);
  const requestedEnd = match[2] ? Number(match[2]) : size - 1;
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(requestedEnd) || offset >= size || requestedEnd < offset) return null;
  return { offset, length: Math.min(requestedEnd, size - 1) - offset + 1 };
}

export async function GET(request: Request) { return handleApi(async () => {
  const settings = await settingsRow();
  if (!settings?.audioKey || !runtimeEnv.BUCKET) throw new ApiError(404, "Aún no se ha agregado una canción.");
  let range: { offset: number; length: number } | undefined;
  const rangeHeader = request.headers.get("range");
  if (rangeHeader !== null) {
    const metadata = await runtimeEnv.BUCKET.head(settings.audioKey);
    if (!metadata) throw new ApiError(404, "El archivo de audio no está disponible.");
    const parsed = requestedBytes(rangeHeader, metadata.size);
    if (!parsed) return Response.json({ error: "El rango de audio solicitado no está disponible." }, {
      status: 416,
      headers: { "Content-Range": `bytes */${metadata.size}`, "Accept-Ranges": "bytes", "Cache-Control": "no-store" },
    });
    range = parsed;
  }
  const object = await runtimeEnv.BUCKET.get(settings.audioKey, range ? { range } : undefined);
  if (!object) throw new ApiError(404, "El archivo de audio no está disponible.");
  const headers = new Headers({ "Content-Type": settings.audioType || "audio/mpeg", "Accept-Ranges": "bytes", "Cache-Control": "public, max-age=300", "X-Content-Type-Options": "nosniff", "ETag": object.httpEtag });
  // R2 may attach range metadata even for a complete object; only a client Range request is partial.
  if (range) {
    headers.set("Content-Range", `bytes ${range.offset}-${range.offset + range.length - 1}/${object.size}`);
    headers.set("Content-Length", String(range.length));
    return new Response(object.body, { status: 206, headers });
  }
  headers.set("Content-Length", String(object.size));
  return new Response(object.body, { headers });
}); }
