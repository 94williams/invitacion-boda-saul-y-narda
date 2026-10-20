import { handleApi, json } from "@/app/lib/server";
import { publicSettings } from "@/app/lib/settings";
export const dynamic = "force-dynamic";
export async function GET() { return handleApi(async () => json(await publicSettings())); }
