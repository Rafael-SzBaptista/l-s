import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono, Pinyon_Script } from "next/font/google";
import Script from "next/script";
import { Cursor } from "@/components/motion/cursor";
import { FooterReveal } from "@/components/motion/footer-reveal";
import { Intro } from "@/components/motion/intro";
import { INTRO_SCRIPT } from "@/components/motion/intro-script";
import { Providers } from "@/components/motion/providers";
import { BagDrawer } from "@/components/store/bag";
import { FloatingActions } from "@/components/store/floating-actions";
import { Footer } from "@/components/store/footer";
import { SiteTop } from "@/components/store/site-top";
import { ACCENT, readableOn } from "@/lib/utils";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
  weight: "variable",
  axes: ["wdth"],
});

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

const script = Pinyon_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pinyon",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Lés by Sabongi",
    template: "%s · Lés",
  },
  description:
    "Nada por acaso. Cada detalhe pensado para o seu passo. Papetes, rasteirinhas, sandálias, scarpins e tênis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${archivo.variable} ${geist.variable} ${mono.variable} ${script.variable}`}
    >
      <body
        style={
          {
            "--accent": ACCENT,
            "--accent-fg": readableOn(ACCENT),
          } as CSSProperties
        }
        className="bg-surface font-sans text-ink antialiased"
      >
        <Script id="les-intro" strategy="beforeInteractive">
          {INTRO_SCRIPT}
        </Script>
        <Providers>
          <div className="grain" aria-hidden />
          <SiteTop />
          <Cursor />
          <FooterReveal footer={<Footer />}>{children}</FooterReveal>
          <FloatingActions />
          <Intro />
          <BagDrawer />
        </Providers>
      </body>
    </html>
  );
}
