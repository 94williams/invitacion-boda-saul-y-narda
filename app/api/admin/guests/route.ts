import { requireAdmin } from "@/app/lib/auth";
import { ApiError, assertSameOrigin, bodyJson, database, handleApi, json } from "@/app/lib/server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { return handleApi(async () => {
  await requireAdmin(request);
  const rows = await database().prepare("SELECT id, name, attendance, guests, notes, created_at AS createdAt, updated_at AS updatedAt FROM guests ORDER BY updated_at DESC, id DESC").all();
  return json({ guests: rows.results });
}); }
export async function DELETE(request: Request) { return handleApi(async () => {
  assertSameOrigin(request); await requireAdmin(request);
  const body = await bodyJson(request);
  if (typeof body.id !== "number" || !Number.isSafeInteger(body.id) || body.id < 1) throw new ApiError(400, "Selecciona una confirmación válida.");
  await database().prepare("DELETE FROM guests WHERE id = ?").bind(body.id).run();
  return json({ ok: true });
}); }
