import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/lib/state/store";

const sans = Inter({ variable: "--font-sans-stack", subsets: ["latin"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-mono-stack", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Gov.in — One government. One citizen experience.",
  description:
    "Shared citizen infrastructure for Indian public services. One identity, one front door, one case history — while departments keep owning their domains.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
