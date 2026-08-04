"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { TOOLS } from "@/data/tools";
import { useCommandPalette } from "@/context/command-palette-context";
import { useHistory } from "@/context/history-context";
import { useSettings } from "@/context/settings-context";
import { useHotkeys } from "@/hooks/useHotkeys";
import { cn } from "@/lib/utils";
import { ToolIcon } from "@/components/ui/tool-icon";

interface PaletteItem {
  id: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  action: () => void;
}

export function CommandPalette() {
  const { isOpen, close, toggle } = useCommandPalette();
  const router = useRouter();
  const { toggleTheme, theme } = useSettings();
  const { recentTools, favorites } = useHistory();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useHotkeys("ctrl+k", toggle);

  const items = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase();
    const tools = TOOLS.filter((t) =>
      q
        ? [t.name, t.description, ...t.keywords].join(" ").toLowerCase().includes(q)
        : true
    )
      .slice(0, 12)
      .map((tool) => ({
        id: `tool-${tool.slug}`,
        label: tool.name,
        hint: tool.category,
        icon: (
          <ToolIcon icon={tool.icon} accent={tool.accent} className="size-7" />
        ),
        action: () => {
          router.push(`/tools/${tool.slug}`);
          close();
        },
      }));

    const actions: PaletteItem[] = [
      {
        id: "toggle-theme",
        label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        hint: "t",
        icon: theme === "dark" ? <Icon icon="lucide:sun" className="size-4" /> : <Icon icon="lucide:moon" className="size-4" />,
        action: () => toggleTheme(),
      },
      {
        id: "copy-history",
        label: "Open Copy History",
        hint: "Ctrl Shift C",
        icon: <Icon icon="lucide:clipboard-list" className="size-4" />,
        action: () => {
          router.push("/history");
          close();
        },
      },
      {
        id: "docs",
        label: "Documentation",
        icon: <Icon icon="lucide:book-open" className="size-4" />,
        action: () => {
          router.push("/docs");
          close();
        },
      },
    ];

    if (q) {
      return [...tools, ...actions];
    }

    const recents = recentTools.slice(0, 4).map((r) => {
      const tool = TOOLS.find((t) => t.slug === r.toolSlug);
      if (!tool) return null;
      return {
        id: `recent-${tool.slug}`,
        label: tool.name,
        hint: "recent",
        icon: <Icon icon="lucide:star" className="size-4 text-amber-400" />,
        action: () => {
          router.push(`/tools/${tool.slug}`);
          close();
        },
      };
    });

    const favs = favorites.slice(0, 4).map((slug) => {
      const tool = TOOLS.find((t) => t.slug === slug);
      if (!tool) return null;
      return {
        id: `fav-${slug}`,
        label: tool.name,
        hint: "favorite",
        icon: <Icon icon="lucide:star" className="size-4 text-amber-400" />,
        action: () => {
          router.push(`/tools/${slug}`);
          close();
        },
      };
    });

    return [...recents, ...favs].filter(Boolean) as PaletteItem[];
  }, [query, router, close, recentTools, favorites, theme, toggleTheme]);

  useEffect(() => {
    setIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${index}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      items[index]?.action();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Command palette"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Icon icon="lucide:search" className="size-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search tools, actions…"
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Search command palette"
              />
              <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="max-h-80 overflow-y-auto p-2 cmd-scroll">
              {items.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No results for “{query}”
                </p>
              )}
              {items.map((item, i) => (
                <button
                  key={item.id}
                  data-idx={i}
                  onClick={item.action}
                  onMouseEnter={() => setIndex(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    i === index ? "bg-accent" : "hover:bg-accent/60"
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center text-muted-foreground">
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.hint && (
                    <span className="text-[11px] capitalize text-muted-foreground">
                      {item.hint}
                    </span>
                  )}
                  {i === index && (
                    <Icon icon="lucide:corner-down-left" className="size-3.5 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:corner-down-left" className="size-3" /> select
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-border px-1 font-mono">↑↓</kbd>
                navigate
              </span>
              <span className="ml-auto flex items-center gap-1.5">
                <Icon icon="lucide:zap" className="size-3" />
                {TOOLS.length} tools available
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
