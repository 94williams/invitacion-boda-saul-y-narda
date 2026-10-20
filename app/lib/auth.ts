import { ApiError, digest, runtimeEnv } from "./server";

const COOKIE = "narda_saul_admin";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  if (!runtimeEnv.ADMIN_KEY || runtimeEnv.ADMIN_KEY.length < 16) throw new ApiError(503, "El acceso privado aún no está configurado.");
  return runtimeEnv.ADMIN_KEY;
}

async function hmacKey() {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function base64url(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function unbase64url(value: string) { return Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0)); }

export async function validPassword(input: string) {
  const [provided, expected] = await Promise.all([digest(input), digest(secret())]);
  let difference = 0;
  for (let i = 0; i < provided.length; i++) difference |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  return difference === 0;
}

export async function sessionCookie(request: Request) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `${expires}.${crypto.randomUUID()}`;
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(), new TextEncoder().encode(payload));
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE}=${payload}.${base64url(new Uint8Array(signature))}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_SECONDS}${secure}`;
}

export function clearSessionCookie(request: Request) {
  return `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}

export async function requireAdmin(request: Request) {
  secret();
  const token = (request.headers.get("cookie") || "").split(";").map(c => c.trim()).find(c => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1) || "";
  const pieces = token.split(".");
  if (pieces.length !== 3 || !/^\d+$/.test(pieces[0]) || Number(pieces[0]) <= Math.floor(Date.now() / 1000) || Number(pieces[0]) > Math.floor(Date.now() / 1000) + SESSION_SECONDS + 60) throw new ApiError(401, "Inicia sesión para entrar a tu panel.");
  try {
    const valid = await crypto.subtle.verify("HMAC", await hmacKey(), unbase64url(pieces[2]), new TextEncoder().encode(`${pieces[0]}.${pieces[1]}`));
    if (!valid) throw new Error();
  } catch { throw new ApiError(401, "Tu sesión terminó. Vuelve a iniciar sesión."); }
}
