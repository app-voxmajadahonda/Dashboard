import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Grupo Municipal",
  description: "Portal interno de seguimiento documental, político y operativo para grupos municipales."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
