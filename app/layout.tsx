import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans_Thai, Kanit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// ฟอนต์ทั้งสองรองรับอักษรไทยและละติน
const body = IBM_Plex_Sans_Thai({ subsets: ["thai", "latin"], weight: ["400", "500", "600"], display: "swap" });
const display = Kanit({
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-kanit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Service Hub",
  description: "ระบบจัดการงานซ่อมบำรุง",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body className={`${body.className} ${display.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
