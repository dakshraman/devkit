import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/app/providers";
import { PwaRegister } from "@/components/pwa-register";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Local-First Developer Utilities (54+ Tools)`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "DevKit Contributors", url: SITE_URL }],
  creator: "DevKit",
  publisher: "DevKit",
  category: "technology",
  keywords: [
    "developer tools",
    "devkit",
    "client-side dev tools",
    "local-first tools",
    "json formatter",
    "base64 encoder",
    "uuid generator",
    "hash generator",
    "jwt decoder",
    "regex tester",
    "markdown editor",
    "sql formatter",
    "cron builder",
    "pdf merge",
    "pdf split",
    "image to pdf",
    "image resizer",
    "image watermark",
    "ast explorer",
    "wasm explorer",
    "online developer tools",
    "pwa developer tools",
    "zero egress dev tools",
  ],
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Local-First Developer Utilities (54+ Tools)`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Local-First Developer Utilities`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Local-First Developer Utilities (54+ Tools)`,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/twitter-image`],
    creator: "@devkit",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#f7f7f8" },
  ],
  colorScheme: "dark light",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "en",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/tools?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const s=localStorage.getItem("devkit:settings");const theme=s?JSON.parse(s)?.theme:localStorage.getItem("devkit:theme")||"dark";document.documentElement.classList.toggle("dark",theme==="dark");document.documentElement.style.colorScheme=theme}catch(e){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}`,
          }}
        />
        <Providers>{children}</Providers>
        <PwaRegister />
      </body>
    </html>
  );
}
