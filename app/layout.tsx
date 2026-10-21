import type { Metadata } from "next";
import "./globals.css";
import "./gifts.css";
import "./motion.css";

export const metadata: Metadata = {
  title: "Narda & Saúl · Nuestra boda",
  description: "Con gran ilusión, te invitamos a celebrar nuestra boda. Conoce la fecha, la ubicación y los detalles de nuestra celebración.",
  openGraph: { title: "Narda & Saúl · Nuestra boda", description: "Cinco años de amor, una vida por compartir. Celebra con nosotros el 31 de octubre de 2026.", type: "website", locale: "es_MX", images: [{ url: "https://94williams.github.io/invitacion-boda-saul-y-narda/images/portada-boda.png", width: 1200, height: 630, alt: "Invitación de boda de Narda y Saúl. 31 de octubre de 2026." }] },
  twitter: { card: "summary_large_image", title: "Narda & Saúl · Nuestra boda", description: "Cinco años de amor, una vida por compartir. 31 de octubre de 2026.", images: ["https://94williams.github.io/invitacion-boda-saul-y-narda/images/portada-boda.png"] },
  icons: {
    icon: "/monogram.svg",
    shortcut: "/monogram.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
