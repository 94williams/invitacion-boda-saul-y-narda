export type GiftRegistrySettings = {
  giftRegistryName: string;
  giftRegistryUrl: string;
  giftRegistryName2: string;
  giftRegistryUrl2: string;
};

// GitHub Pages: reemplaza los nombres y pega los enlaces HTTPS aquí; luego compila el preview.
// En el sitio con backend, estas opciones se administran desde el panel de anfitriones.
export const giftRegistryConfig: GiftRegistrySettings = {
  giftRegistryName: "Mesa de regalos",
  giftRegistryUrl: "",
  giftRegistryName2: "Mesa de regalos 2",
  giftRegistryUrl2: "",
};

export function giftRegistryEntries(settings: GiftRegistrySettings) {
  let url = "";
  try {
    const parsed = new URL(settings.giftRegistryUrl);
    if (parsed.protocol === "https:" && !parsed.username && !parsed.password) url = parsed.href;
  } catch { /* Los botones pendientes no enlazan a un destino ficticio. */ }
  return [{ name: settings.giftRegistryName.trim() || "Mesa de regalos", url }];
}
