import type { Metadata } from "next";

export const SITE_URL = "https://devkit.dakshraman.in";
export const SITE_NAME = "DevKit";
export const SITE_DESCRIPTION =
  "All-in-one developer productivity toolkit — formatters, encoders, generators, analyzers and references that run 100% in your browser.";

interface SeoOptions {
  title?: string;
  description: string;
  path: string;
  keywords?: string[];
  noindex?: boolean;
}

export function buildMetadata({
  title,
  description,
  path,
  keywords,
  noindex = false,
}: SeoOptions): Metadata {
  const url = `${SITE_URL}${path}`;
  const resolvedTitle = title ?? `${SITE_NAME} — All-in-one developer toolkit`;
  return {
    title: resolvedTitle,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title: resolvedTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
