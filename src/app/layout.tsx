import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nusa Arts Fest Control Center",
  description:
    "Live scoreboard, admin controls, and jury tools for the college arts fest.",
  metadataBase: new URL("https://artsfest.local"),
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950`}
      >
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#3b0764,_#020617_55%)]">
          {children}
        </div>
      </body>
    </html>
  );
}
