import { ApiError, assertSameOrigin, bodyJson, cleanText, database, digest, handleApi, json, limitAttempts, requestFingerprint } from "@/app/lib/server";
export const dynamic = "force-dynamic";
export async function POST(request: Request) { return handleApi(async () => {
  assertSameOrigin(request);
  const body = await bodyJson(request);
  const name = cleanText(body.name, 100, true);
  const notes = cleanText(body.notes, 600);
  if (body.attendance !== "yes" && body.attendance !== "no") throw new ApiError(400, "Selecciona si podrás acompañarnos.");
  if (typeof body.token !== "string" || !/^[A-Za-z0-9_-]{32,160}$/.test(body.token)) throw new ApiError(400, "Recarga la invitación para confirmar tu asistencia.");
  if (body.attendance === "yes" && (typeof body.guests !== "number" || !Number.isInteger(body.guests) || body.guests < 1 || body.guests > 8)) throw new ApiError(400, "Selecciona entre 1 y 8 personas, incluyéndote.");
  await limitAttempts(await requestFingerprint(request, "rsvp"), 40, 3600);
  const now = new Date().toISOString();
  await database().prepare(`INSERT INTO guests (token_hash, name, attendance, guests, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(token_hash) DO UPDATE SET name=excluded.name, attendance=excluded.attendance, guests=excluded.guests, notes=excluded.notes, updated_at=excluded.updated_at`)
    .bind(await digest(body.token), name, body.attendance, body.attendance === "yes" ? body.guests : 0, notes, now, now).run();
  return json({ ok: true });
}); }
