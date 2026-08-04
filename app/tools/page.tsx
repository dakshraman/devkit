import type { Metadata } from "next";
import { ToolsIndexPage } from "@/features/tools/tools-index-page";

export const metadata: Metadata = {
  title: "All Tools",
  description: "Browse the full DevKit catalog.",
};

export default function ToolsPage() {
  return <ToolsIndexPage />;
}
