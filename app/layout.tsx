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

/* Runs before the first paint. The theme is a saved choice, and applying it
   from an effect meant every page load flashed the default first. Dark is what
   you get without a choice, and the stylesheet already renders that way, so
   this only has to stamp the classes for an explicit one. */
const THEME_BOOT = `try{var l=localStorage.getItem("gov.in.theme")==="light";document.documentElement.classList.toggle("light",l);document.documentElement.classList.toggle("dark",!l)}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
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
