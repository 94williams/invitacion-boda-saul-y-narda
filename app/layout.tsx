import type { Metadata } from "next";
import "./globals.css";
import "./gifts.css";
import "./motion.css";

export const metadata: Metadata = {
  title: "Narda & Saúl · Nuestra boda",
  description: "Elegimos para siempre. Y queremos celebrarlo contigo. Descubre nuestra invitación y confirma tu asistencia.",
  openGraph: { title: "Narda & Saúl · Nuestra boda", description: "Una historia. Un sí. Toda una vida.", type: "website", locale: "es_MX", images: ["/images/wedding-florals.png"] },
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
