import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/landing-page";
import { buildMetadata, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import { TOOLS } from "@/data/tools";

export const metadata: Metadata = buildMetadata({
  title: `${SITE_NAME} — Local-First Developer Utilities (54+ Tools)`,
  description: SITE_DESCRIPTION,
  path: "/",
  keywords: [
    "developer tools",
    "devkit",
    "client-side dev tools",
    "local-first tools",
    "json formatter",
    "jwt decoder",
    "uuid generator",
    "base64 encoder",
    "hash generator",
    "ast explorer",
    "wasm explorer",
    "api tester",
    "websocket tester",
    "pdf merge",
    "pdf split",
    "image to pdf",
    "image resizer",
    "image watermark",
    "offline dev tools",
    "pwa dev tools",
  ],
});

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "All (Web Browser, Chrome, Firefox, Safari, Edge)",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  softwareVersion: "2.4.0",
  isAccessibleForFree: true,
  browserRequirements: "Requires JavaScript. Runs 100% in-browser.",
  screenshot: `${SITE_URL}/opengraph-image`,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: TOOLS.map((t) => t.name),
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does DevKit ensure zero server transmissions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every tool executes strictly inside your browser tab using native JavaScript, WebAssembly, HTML5 Canvas, and the WebCrypto API. Network requests are never initiated to process payloads, files, keys, or tokens.",
      },
    },
    {
      "@type": "Question",
      name: "Does DevKit function completely offline?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. DevKit registers a Service Worker and manifest file as a Progressive Web App (PWA). Once loaded in your browser, all 54 utilities remain operational without an internet connection.",
      },
    },
    {
      "@type": "Question",
      name: "Where are user settings and transformation histories stored?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "User preferences, pinned favorites, and recent executions are saved solely in your browser's private localStorage. Data is never synchronized to a cloud backend and can be purged at any time from the History view.",
      },
    },
    {
      "@type": "Question",
      name: "Are there any usage quotas, account requirements, or fees?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. DevKit is completely free and open source under the MIT License. There are no subscriptions, API rate limits, paywalls, or accounts.",
      },
    },
    {
      "@type": "Question",
      name: "How are PDF documents and images manipulated without a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PDF processing is handled in-memory using pdf-lib and jszip compiled for the browser. Image resizing, format conversion, and watermarking use the native HTML5 Canvas 2D context.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <LandingPage />
    </>
  );
}
