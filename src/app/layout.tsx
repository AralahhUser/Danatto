import type { Metadata } from "next";
import { PixelBoot } from "@/components/site/pixel-boot";
import { RootShell } from "@/components/site/root-shell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Danatto | Ropa americana seleccionada",
    template: "%s | Danatto"
  },
  description:
    "Ropa americana seleccionada: prendas unicas de marcas reconocidas, revisadas y listas para una nueva historia.",
  openGraph: {
    title: "Danatto | Ropa americana seleccionada",
    description: "Prendas unicas, estilo autentico y calidad de marca.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <PixelBoot />
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
