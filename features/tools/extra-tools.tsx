"use client";

import dynamic from "next/dynamic";
import { Panel, Shell } from "@/features/tools/tool-layout";
import type { Tool } from "@/types";

const loading = () => <Shell tool={{ slug: "", name: "Loading...", description: "", category: "developer", icon: "lucide:sparkles", keywords: [], accent: "#64748b" }}><Panel title="Loading..."><p className="text-sm text-muted-foreground">Loading tool...</p></Panel></Shell>;

const HtmlCssTool = dynamic(() => import("@/features/tools/views/html-css"), { loading });
const SqlTool = dynamic(() => import("@/features/tools/views/sql"), { loading });
const CronTool = dynamic(() => import("@/features/tools/views/cron"), { loading });
const FileChecksumTool = dynamic(() => import("@/features/tools/views/file-checksum"), { loading });
const CsvJsonTool = dynamic(() => import("@/features/tools/views/csv-json"), { loading });
const JsonTsTool = dynamic(() => import("@/features/tools/views/json-typescript"), { loading });
const JwtSignerTool = dynamic(() => import("@/features/tools/views/jwt-signer"), { loading });
const BcryptTool = dynamic(() => import("@/features/tools/views/bcrypt"), { loading });
const TextStatsTool = dynamic(() => import("@/features/tools/views/text-stats"), { loading });
const UrlBuilderTool = dynamic(() => import("@/features/tools/views/url-builder"), { loading });
const UnicodeTool = dynamic(() => import("@/features/tools/views/unicode"), { loading });
const UnitConvertTool = dynamic(() => import("@/features/tools/views/unit-converter"), { loading });
const SvgTool = dynamic(() => import("@/features/tools/views/svg"), { loading });
const EnvTool = dynamic(() => import("@/features/tools/views/env"), { loading });
const HttpStatusTool = dynamic(() => import("@/features/tools/views/http-status"), { loading });
const RegexCheatsheetTool = dynamic(() => import("@/features/tools/views/regex-cheatsheet"), { loading });
const ImageConvertTool = dynamic(() => import("@/features/tools/views/image-converter"), { loading });
const ImageCompressTool = dynamic(() => import("@/features/tools/views/image-compressor"), { loading });
const BgRemoverTool = dynamic(() => import("@/features/tools/views/bg-remover"), { loading });
const TempMailTool = dynamic(() => import("@/features/tools/views/temp-mail"), { loading });
const JsonViewerTool = dynamic(() => import("@/features/tools/views/json-viewer"), { loading });
const ColorContrastTool = dynamic(() => import("@/features/tools/views/color-contrast"), { loading });
const IpDnsTool = dynamic(() => import("@/features/tools/views/ip-dns"), { loading });
const AsciiArtTool = dynamic(() => import("@/features/tools/views/ascii-art"), { loading });

const VIEW_MAP: Record<string, React.ComponentType<{ tool: Tool }>> = {
  "html-formatter": HtmlCssTool,
  "sql-formatter": SqlTool,
  "cron-builder": CronTool,
  "file-checksum": FileChecksumTool,
  "csv-json": CsvJsonTool,
  "json-to-typescript": JsonTsTool,
  "jwt-generator": JwtSignerTool,
  "bcrypt-generator": BcryptTool,
  "text-stats": TextStatsTool,
  "url-builder": UrlBuilderTool,
  "unicode-inspector": UnicodeTool,
  "unit-converter": UnitConvertTool,
  "svg-optimizer": SvgTool,
  "env-parser": EnvTool,
  "http-status": HttpStatusTool,
  "regex-cheatsheet": RegexCheatsheetTool,
  "image-converter": ImageConvertTool,
  "image-compressor": ImageCompressTool,
  "bg-remover": BgRemoverTool,
  "temp-mail": TempMailTool,
  "json-viewer": JsonViewerTool,
  "color-contrast": ColorContrastTool,
  "ip-dns": IpDnsTool,
  "ascii-art": AsciiArtTool,
};

export function ExtraToolView({ slug, tool }: { slug: string; tool: Tool }) {
  const View = VIEW_MAP[slug];
  if (View) return <View tool={tool} />;
  return null;
}
