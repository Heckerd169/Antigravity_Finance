import type { Metadata } from "next";
import "@/styles/tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Antigravity Finance",
  description: "Sparraten-Steuerung",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
