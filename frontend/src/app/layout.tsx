import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "PhishLens — AI Phishing Detection & Threat Intelligence",
  description:
    "See the threat behind the link. Professional AI-powered phishing detection and threat intelligence platform.",
  keywords: [
    "phishing detection",
    "threat intelligence",
    "cybersecurity",
    "URL scanner",
    "email analysis",
    "SSRF protection",
    "zero-fetch",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-slate-main antialiased flex flex-col selection:bg-primary/30 selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
