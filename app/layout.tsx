import type { Metadata } from "next";
import "./globals.css";
import "./gifts.css";
import "./motion.css";

export const metadata: Metadata = {
  title: "Narda & Saúl · Nuestra boda",
  description: "Nos casamos y queremos compartir esta alegría contigo. Consulta la fecha, la ubicación y los detalles de nuestra boda.",
  openGraph: { title: "Narda & Saúl · Nuestra boda", description: "Nos casamos y queremos celebrarlo contigo.", type: "website", locale: "es_MX", images: ["/images/wedding-florals.png"] },
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
