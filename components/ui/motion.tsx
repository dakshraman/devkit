"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;

/* ---------------- Page transitions ---------------- */

export function PageTransition({
  pathname,
  reduced,
  children,
}: {
  pathname: string;
  reduced?: boolean;
  children: ReactNode;
}) {
  if (reduced) {
    return <div key={pathname}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: EASE_SMOOTH }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------------- Scroll reveal ---------------- */

export function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: EASE_SMOOTH }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Stagger groups ---------------- */

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_SMOOTH },
  },
};

export function StaggerGroup({
  children,
  className,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

// StaggerItem is meant to be used inside StaggerGroup. With whileInView,
// items outside the viewport remain hidden until the group enters.
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

/* ---------------- Micro-interactions ---------------- */

export function HoverCard({
  children,
  className,
  lift = 4,
  scale = 1.01,
}: {
  children: ReactNode;
  className?: string;
  lift?: number;
  scale?: number;
}) {
  return (
    <motion.div
      className={cn("will-change-transform", className)}
      whileHover={{ y: -lift, scale }}
      transition={{ duration: 0.22, ease: EASE_SMOOTH }}
    >
      {children}
    </motion.div>
  );
}

export function Pressable({
  children,
  className,
  onTap,
}: {
  children: ReactNode;
  className?: string;
  onTap?: () => void;
}) {
  return (
    <motion.button
      className={cn("cursor-pointer select-none", className)}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      onClick={onTap}
    >
      {children}
    </motion.button>
  );
}