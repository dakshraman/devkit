import type { Metadata } from "next";

export const SITE_URL = "https://devkit.dakshraman.in";
export const SITE_NAME = "DevKit";
export const SITE_DESCRIPTION =
  "All-in-one local-first developer productivity toolkit with 54+ utilities. Format JSON, decode JWTs, generate UUIDs, merge PDFs, resize images, inspect ASTs, and test APIs entirely in your browser with zero server egress.";

interface SeoOptions {
  title?: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  noindex?: boolean;
}

export function buildMetadata({
  title,
  description,
  path,
  keywords,
  image,
  noindex = false,
}: SeoOptions): Metadata {
  const url = `${SITE_URL}${path}`;
  const resolvedTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — Local-First Developer Utilities (54+ Tools)`;
  const ogImage = image ?? `${SITE_URL}/opengraph-image`;
  const twitterImage = image ?? `${SITE_URL}/twitter-image`;

  return {
    metadataBase: new URL(SITE_URL),
    title: resolvedTitle,
    description,
    keywords: keywords ?? [
      "developer tools",
      "devkit",
      "client-side dev tools",
      "offline tools",
      "json formatter",
      "jwt decoder",
      "uuid generator",
      "pdf merge",
      "image resizer",
      "hash generator",
      "ast explorer",
      "wasm explorer",
    ],
    authors: [{ name: "DevKit Contributors", url: SITE_URL }],
    creator: "DevKit",
    publisher: "DevKit",
    category: "technology",
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title: resolvedTitle,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${resolvedTitle} — ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [twitterImage],
      creator: "@devkit",
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          nocache: false,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}
