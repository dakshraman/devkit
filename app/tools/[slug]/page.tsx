import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { TOOLS } from "@/data/tools";
import { ToolView } from "@/features/tools/tool-views";

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOLS.find((item) => item.slug === slug);
  if (!tool) {
    return { title: "Tool Not Found" };
  }
  return {
    title: tool.name,
    description: tool.description,
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!TOOLS.find((item) => item.slug === slug)) notFound();
  return (
    <AppShell>
      <ToolView slug={slug} />
    </AppShell>
  );
}
