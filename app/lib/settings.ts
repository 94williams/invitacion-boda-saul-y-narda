import { ApiError, cleanText, database } from "./server";
import { isValidEventDate } from "./event-date";

export type WeddingSettings = { eventDate: string; civilTime: string; ceremonyTime: string; receptionTime: string; venueName: string; address: string; mapsUrl: string; giftRegistryName: string; giftRegistryUrl: string; giftRegistryName2: string; giftRegistryUrl2: string; audioUrl: string };
export type SettingsRow = Omit<WeddingSettings, "audioUrl"> & { id: number; audioKey: string; audioType: string; audioUpdatedAt: string };
export const emptySettings: WeddingSettings = { eventDate: "", civilTime: "", ceremonyTime: "", receptionTime: "", venueName: "", address: "", mapsUrl: "", giftRegistryName: "", giftRegistryUrl: "", giftRegistryName2: "", giftRegistryUrl2: "", audioUrl: "" };

export async function settingsRow() {
  return database().prepare(`SELECT id, event_date AS eventDate, civil_time AS civilTime, ceremony_time AS ceremonyTime, reception_time AS receptionTime,
    venue_name AS venueName, address, maps_url AS mapsUrl, gift_registry_name AS giftRegistryName, gift_registry_url AS giftRegistryUrl, gift_registry_name_2 AS giftRegistryName2, gift_registry_url_2 AS giftRegistryUrl2, audio_key AS audioKey, audio_type AS audioType,
    audio_updated_at AS audioUpdatedAt FROM settings WHERE id = 1`).first<SettingsRow>();
}

export async function publicSettings(): Promise<WeddingSettings> {
  const row = await settingsRow();
  if (!row) return { ...emptySettings };
  return { eventDate: row.eventDate, civilTime: row.civilTime ?? "", ceremonyTime: row.ceremonyTime, receptionTime: row.receptionTime,
    venueName: row.venueName, address: row.address, mapsUrl: row.mapsUrl, giftRegistryName: row.giftRegistryName, giftRegistryUrl: row.giftRegistryUrl,
    giftRegistryName2: row.giftRegistryName2 ?? "", giftRegistryUrl2: row.giftRegistryUrl2 ?? "",
    audioUrl: row.audioKey ? `/api/audio?v=${encodeURIComponent(row.audioUpdatedAt)}` : "" };
}

export function validateSettings(body: Record<string, unknown>) {
  const data = { eventDate: cleanText(body.eventDate, 32), civilTime: cleanText(body.civilTime, 5), ceremonyTime: cleanText(body.ceremonyTime, 5), receptionTime: cleanText(body.receptionTime, 5),
    venueName: cleanText(body.venueName, 160), address: cleanText(body.address, 400), mapsUrl: cleanText(body.mapsUrl, 1000), giftRegistryName: cleanText(body.giftRegistryName, 120), giftRegistryUrl: cleanText(body.giftRegistryUrl, 1000),
    giftRegistryName2: cleanText(body.giftRegistryName2, 120), giftRegistryUrl2: cleanText(body.giftRegistryUrl2, 1000) };
  if (data.eventDate && !isValidEventDate(data.eventDate)) throw new ApiError(400, "Selecciona una fecha válida y, si la conoces, una hora válida.");
  for (const time of [data.civilTime, data.ceremonyTime, data.receptionTime]) if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new ApiError(400, "Selecciona una hora válida.");
  if (data.mapsUrl) {
    try {
      const url = new URL(data.mapsUrl);
      if (url.protocol !== "https:" || url.username || url.password) throw new Error();
    } catch { throw new ApiError(400, "El enlace del mapa debe comenzar con https://."); }
  }
  for (const registryUrl of [data.giftRegistryUrl, data.giftRegistryUrl2]) if (registryUrl) {
    try {
      const url = new URL(registryUrl);
      if (url.protocol !== "https:" || url.username || url.password) throw new Error();
    } catch { throw new ApiError(400, "El enlace de la mesa de regalos debe comenzar con https://."); }
  }
  return data;
}
