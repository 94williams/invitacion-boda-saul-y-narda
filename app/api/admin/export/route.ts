import { requireAdmin } from "@/app/lib/auth";
import { database, handleApi } from "@/app/lib/server";
export const dynamic = "force-dynamic";
function csvCell(value: unknown) {
  let text = String(value ?? "");
  // Prevent spreadsheet formula execution, including formulas hidden behind whitespace/control characters.
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
export async function GET(request: Request) { return handleApi(async () => {
  await requireAdmin(request);
  const rows = await database().prepare("SELECT name, attendance, guests, notes, created_at AS createdAt, updated_at AS updatedAt FROM guests ORDER BY name COLLATE NOCASE").all<{ name: string; attendance: string; guests: number; notes: string; createdAt: string; updatedAt: string }>();
  const lines = [["Nombre", "Asistencia", "Personas (incluye titular)", "Notas", "Fecha de registro", "Última actualización"].map(csvCell).join(",")];
  for (const row of rows.results) lines.push([row.name, row.attendance === "yes" ? "Confirmado" : "No asistirá", row.guests, row.notes, row.createdAt, row.updatedAt].map(csvCell).join(","));
  return new Response(`\uFEFF${lines.join("\r\n")}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="confirmados-narda-saul.csv"', "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}); }
