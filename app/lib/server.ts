import { env } from "cloudflare:workers";

export type WeddingEnv = Cloudflare.Env & { ADMIN_KEY?: string };
export const runtimeEnv = env as WeddingEnv;

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function json(data: unknown, status = 200, extraHeaders: HeadersInit = {}) {
  const headers = new Headers(extraHeaders);
  headers.set("Cache-Control", "no-store");
  return Response.json(data, { status, headers });
}

export async function handleApi(action: () => Promise<Response>): Promise<Response> {
  try { return await action(); }
  catch (error) {
    if (error instanceof ApiError) return json({ error: error.message }, error.status);
    return json({ error: "No fue posible completar la solicitud. Inténtalo de nuevo." }, 500);
  }
}

export function database() {
  if (!runtimeEnv.DB) throw new ApiError(503, "El servicio está preparándose. Inténtalo en unos minutos.");
  return runtimeEnv.DB;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new ApiError(403, "Solicitud no autorizada.");
  }
}

export async function bodyJson(request: Request, maxBytes = 12_000): Promise<Record<string, unknown>> {
  if (!(request.headers.get("content-type") || "").includes("application/json")) throw new ApiError(415, "Usa un formulario válido.");
  if (Number(request.headers.get("content-length")) > maxBytes) throw new ApiError(413, "La solicitud es demasiado grande.");
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (reader) {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) { await reader.cancel(); throw new ApiError(413, "La solicitud es demasiado grande."); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const text = new TextDecoder().decode(bytes);
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw new ApiError(400, "Revisa los datos del formulario."); }
}

export function cleanText(value: unknown, maxLength: number, required = false) {
  if (typeof value !== "string") {
    if (required) throw new ApiError(400, "Escribe tu nombre completo.");
    return "";
  }
  const text = value.normalize("NFC").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
  if (text.length > maxLength) throw new ApiError(400, `Un campo supera los ${maxLength} caracteres permitidos.`);
  if (required && text.length < 2) throw new ApiError(400, "Escribe tu nombre completo.");
  return text;
}

export async function digest(text: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
}

export async function limitAttempts(key: string, max: number, windowSeconds: number) {
  const now = Math.floor(Date.now() / 1000);
  const row = await database().prepare(`INSERT INTO login_attempts (key, attempts, window_start) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET attempts = CASE WHEN window_start <= ? THEN 1 ELSE attempts + 1 END,
    window_start = CASE WHEN window_start <= ? THEN excluded.window_start ELSE window_start END RETURNING attempts`)
    .bind(key, now, now - windowSeconds, now - windowSeconds).first<{ attempts: number }>();
  if (!row || row.attempts > max) throw new ApiError(429, "Se hicieron demasiados intentos. Espera unos minutos antes de volver a intentar.");
  if (Math.random() < 0.02) await database().prepare("DELETE FROM login_attempts WHERE window_start < ?").bind(now - 86400).run();
}

export async function requestFingerprint(request: Request, purpose: string) {
  const address = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || "local";
  return digest(`${purpose}:${address}:${runtimeEnv.ADMIN_KEY || "wedding-rate-limit"}`);
}
