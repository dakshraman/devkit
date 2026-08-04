"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useCopy } from "@/hooks/useCopy";
import { downloadFile } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  value: string;
  toolSlug?: string;
  toolName?: string;
  label?: string;
  className?: string;
}

export function CopyButton({
  value,
  toolSlug = "",
  toolName = "",
  label = "Copied to clipboard",
  className,
}: CopyButtonProps) {
  const copy = useCopy();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-8 px-2.5 text-xs", className)}
      onClick={async () => {
        await copy(value, toolSlug, toolName, label);
        setCopied(true);
      }}
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Icon icon="lucide:check" className="size-3.5 text-emerald-500" />
      ) : (
        <Icon icon="lucide:copy" className="size-3.5" />
      )}
      <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}

export function DownloadButton({
  content,
  filename,
  mime = "text/plain",
  label = "Download",
}: {
  content: string;
  filename: string;
  mime?: string;
  label?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2.5 text-xs"
      onClick={() => downloadFile(content, filename, mime)}
      aria-label="Download file"
    >
      <Icon icon="lucide:download" className="size-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
