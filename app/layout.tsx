import type { Metadata } from "next";
import "./globals.css";
import "./gifts.css";
import "./motion.css";

export const metadata: Metadata = {
  title: "Narda & Saúl · Nuestra boda",
  description: "Con gran ilusión, te invitamos a celebrar nuestra boda. Conoce la fecha, la ubicación y los detalles de nuestra celebración.",
  openGraph: { title: "Narda & Saúl · Nuestra boda", description: "Con gran ilusión, te invitamos a celebrar nuestra boda.", type: "website", locale: "es_MX", images: ["/images/wedding-florals.png"] },
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
