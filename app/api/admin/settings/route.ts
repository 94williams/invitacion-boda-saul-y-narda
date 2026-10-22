import { requireAdmin } from "@/app/lib/auth";
import { assertSameOrigin, bodyJson, database, handleApi, json } from "@/app/lib/server";
import { publicSettings, validateSettings } from "@/app/lib/settings";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { return handleApi(async () => { await requireAdmin(request); return json(await publicSettings()); }); }
export async function PUT(request: Request) { return handleApi(async () => {
  assertSameOrigin(request); await requireAdmin(request);
  const body = await bodyJson(request);
  const data = validateSettings(body);
  await database().prepare(`INSERT INTO settings (id, event_date, civil_time, ceremony_time, reception_time, venue_name, address, maps_url, gift_registry_name, gift_registry_url, gift_registry_name_2, gift_registry_url_2) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET event_date=excluded.event_date, civil_time=excluded.civil_time, ceremony_time=excluded.ceremony_time, reception_time=excluded.reception_time, venue_name=excluded.venue_name, address=excluded.address, maps_url=excluded.maps_url, gift_registry_name=excluded.gift_registry_name, gift_registry_url=excluded.gift_registry_url,
    gift_registry_name_2=CASE WHEN ? THEN excluded.gift_registry_name_2 ELSE settings.gift_registry_name_2 END,
    gift_registry_url_2=CASE WHEN ? THEN excluded.gift_registry_url_2 ELSE settings.gift_registry_url_2 END`)
    .bind(data.eventDate, data.civilTime, data.ceremonyTime, data.receptionTime, data.venueName, data.address, data.mapsUrl, data.giftRegistryName, data.giftRegistryUrl, data.giftRegistryName2, data.giftRegistryUrl2,
      Object.hasOwn(body, "giftRegistryName2") ? 1 : 0, Object.hasOwn(body, "giftRegistryUrl2") ? 1 : 0).run();
  return json(await publicSettings());
}); }
