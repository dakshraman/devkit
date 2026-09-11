"use client";

import dynamic from "next/dynamic";
import { EditorSkeleton, Panel, Shell } from "@/features/tools/tool-layout";
import { ExtraToolView } from "@/features/tools/extra-tools";
import { EXTRA_SLUGS } from "@/features/tools/tool-helpers";
import { TOOLS } from "@/data/tools";
import type { Tool } from "@/types";

const loading = () => <Shell tool={{ slug: "", name: "Loading...", description: "", category: "developer", icon: "lucide:sparkles", keywords: [], accent: "#64748b" }}><Panel title="Loading..."><EditorSkeleton /></Panel></Shell>;

const JsonFormatterTool = dynamic(() => import("@/features/tools/views/json-formatter"), { loading });
const JwtDecoderTool = dynamic(() => import("@/features/tools/views/jwt-decoder"), { loading });
const Base64Tool = dynamic(() => import("@/features/tools/views/base64"), { loading });
const UuidTool = dynamic(() => import("@/features/tools/views/uuid"), { loading });
const HashTool = dynamic(() => import("@/features/tools/views/hash"), { loading });
const TimestampTool = dynamic(() => import("@/features/tools/views/timestamp"), { loading });
const RegexTool = dynamic(() => import("@/features/tools/views/regex"), { loading });
const MarkdownTool = dynamic(() => import("@/features/tools/views/markdown"), { loading });
const ColorTool = dynamic(() => import("@/features/tools/views/color"), { loading });
const ApiTesterTool = dynamic(() => import("@/features/tools/views/api-tester"), { loading });
const SnippetsTool = dynamic(() => import("@/features/tools/views/snippets"), { loading });
const UrlTool = dynamic(() => import("@/features/tools/views/url"), { loading });
const QrTool = dynamic(() => import("@/features/tools/views/qr"), { loading });
const PasswordTool = dynamic(() => import("@/features/tools/views/password"), { loading });
const LoremTool = dynamic(() => import("@/features/tools/views/lorem"), { loading });
const CaseTool = dynamic(() => import("@/features/tools/views/case-converter"), { loading });
const DiffTool = dynamic(() => import("@/features/tools/views/diff"), { loading });
const ImageToBase64Tool = dynamic(() => import("@/features/tools/views/image-base64"), { loading });
const GitHubTool = dynamic(() => import("@/features/tools/views/github"), { loading });
const NpmTool = dynamic(() => import("@/features/tools/views/npm"), { loading });

const VIEW_MAP: Record<string, React.ComponentType<{ tool: Tool }>> = {
  "json-formatter": JsonFormatterTool,
  "jwt-decoder": JwtDecoderTool,
  "base64": Base64Tool,
  "uuid-generator": UuidTool,
  "hash-generator": HashTool,
  "timestamp-converter": TimestampTool,
  "regex-playground": RegexTool,
  "markdown-editor": MarkdownTool,
  "color-toolkit": ColorTool,
  "api-tester": ApiTesterTool,
  "snippets": SnippetsTool,
  "url-encoder": UrlTool,
  "qr-generator": QrTool,
  "password-generator": PasswordTool,
  "lorem-ipsum": LoremTool,
  "case-converter": CaseTool,
  "diff-checker": DiffTool,
  "image-to-base64": ImageToBase64Tool,
  "github-analyzer": GitHubTool,
  "npm-explorer": NpmTool,
};

export function ToolView({ slug }: { slug: string }) {
  const tool = TOOLS.find((item) => item.slug === slug);
  if (!tool) {
    return (
      <Shell tool={{ slug, name: "Tool not found", description: "The requested tool could not be resolved.", category: "developer", icon: "lucide:sparkles", keywords: [], accent: "#64748b" }}>
        <Panel title="Unavailable">
          <p className="text-sm text-muted-foreground">The requested tool could not be found.</p>
        </Panel>
      </Shell>
    );
  }
  if ((EXTRA_SLUGS as readonly string[]).includes(tool.slug)) {
    return <ExtraToolView slug={tool.slug} tool={tool} />;
  }
  const View = VIEW_MAP[tool.slug];
  if (View) return <View tool={tool} />;
  return (
    <Shell tool={tool}>
      <Panel title="Tool unavailable">
        <p className="text-sm text-muted-foreground">This tool has not been wired yet.</p>
      </Panel>
    </Shell>
  );
}
