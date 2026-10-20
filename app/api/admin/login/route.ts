import { sessionCookie, validPassword, clearSessionCookie } from "@/app/lib/auth";
import { ApiError, assertSameOrigin, bodyJson, database, handleApi, json, limitAttempts, requestFingerprint } from "@/app/lib/server";
export const dynamic = "force-dynamic";
export async function POST(request: Request) { return handleApi(async () => {
  assertSameOrigin(request);
  const body = await bodyJson(request, 2000);
  const fingerprint = await requestFingerprint(request, "login");
  await limitAttempts(fingerprint, 8, 900);
  if (typeof body.password !== "string" || body.password.length > 500 || !await validPassword(body.password)) throw new ApiError(401, "La clave no es correcta. Revisa e inténtalo de nuevo.");
  await database().prepare("DELETE FROM login_attempts WHERE key = ?").bind(fingerprint).run();
  return json({ ok: true }, 200, { "Set-Cookie": await sessionCookie(request) });
}); }
export async function DELETE(request: Request) { return handleApi(async () => {
  assertSameOrigin(request);
  return json({ ok: true }, 200, { "Set-Cookie": clearSessionCookie(request) });
}); }
