export type GiftRegistrySettings = {
  giftRegistryName: string;
  giftRegistryUrl: string;
  giftRegistryName2: string;
  giftRegistryUrl2: string;
};

// GitHub Pages: reemplaza los nombres y pega los enlaces HTTPS aquí; luego compila el preview.
// En el sitio con backend, estas opciones se administran desde el panel de anfitriones.
export const giftRegistryConfig: GiftRegistrySettings = {
  giftRegistryName: "Mesa de regalos 1",
  giftRegistryUrl: "",
  giftRegistryName2: "Mesa de regalos 2",
  giftRegistryUrl2: "",
};

export function giftRegistryEntries(settings: GiftRegistrySettings) {
  return [
    { name: settings.giftRegistryName, url: settings.giftRegistryUrl },
    { name: settings.giftRegistryName2, url: settings.giftRegistryUrl2 },
  ].map((registry, index) => {
    let url = "";
    try {
      const parsed = new URL(registry.url);
      if (parsed.protocol === "https:" && !parsed.username && !parsed.password) url = parsed.href;
    } catch { /* Los botones pendientes no enlazan a un destino ficticio. */ }
    return { name: registry.name.trim() || `Mesa de regalos ${index + 1}`, url };
  });
}
