"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";
import { useHistory } from "@/context/history-context";
import { copyToClipboard } from "@/lib/utils";

export function useCopy() {
  const { recordCopy } = useHistory();

  const copy = useCallback(
    async (text: string, toolSlug = "", toolName = "", label = "Copied") => {
      const ok = await copyToClipboard(text);
      if (ok) {
        toast.success(label, { icon: "📋", duration: 1500 });
        if (toolSlug) recordCopy(toolSlug, toolName, text);
      } else {
        toast.error("Copy failed");
      }
      return ok;
    },
    [recordCopy]
  );

  return copy;
}
