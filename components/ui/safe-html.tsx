import { useMemo, type ElementType, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SafeHtmlProps extends HTMLAttributes<HTMLElement> {
  html: string;
  config?: Record<string, unknown>;
  as?: ElementType;
}

function sanitize(html: string, config?: Record<string, unknown>): string {
  if (typeof window === "undefined") return html;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DOMPurify = require("dompurify");
  const instance = DOMPurify(window ?? globalThis);
  return instance.sanitize(html, config);
}

export function SafeHtml({
  html,
  config,
  as: Tag = "div",
  className,
  ...props
}: SafeHtmlProps) {
  const sanitized = useMemo(
    () => sanitize(html, config),
    [html, config],
  );

  return (
    <Tag
      className={cn(className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
      {...props}
    />
  );
}
