import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { connection } from "next/server";
import "./globals.css";
import { siteUrl } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "CollabShield — HTTP Security Header Scanner",
  description: "Scan any public website for missing or unsafe HTTP security headers and receive an actionable security grade.",
  metadataBase: siteUrl(),
  openGraph: { title: "CollabShield", description: "Know what protects your website.", type: "website" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await connection();
  return <html lang="en"><body className={`${inter.variable} ${mono.variable}`}>{children}</body></html>;
}
