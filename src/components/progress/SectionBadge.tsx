"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SectionState } from "@/types/chat";

interface SectionBadgeProps {
  section: SectionState;
  index: number;
}

export function SectionBadge({ section, index }: SectionBadgeProps) {
  const isDone = section.status === "done";
  const isActive = section.status === "active";

  return (
    <div className="flex items-center gap-3">
      <motion.div
        className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-mono font-medium transition-all
          ${isDone ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : ""}
          ${isActive ? "bg-white text-black font-semibold shadow-sm" : ""}
          ${!isDone && !isActive ? "bg-white/[0.04] text-zinc-500 border border-white/[0.08]" : ""}
        `}
      >
        {isDone ? (
          <Check className="h-3 w-3" strokeWidth={2.5} />
        ) : (
          <span>{index + 1}</span>
        )}
        {isActive && (
          <motion.div
            className="absolute -inset-0.5 rounded-full bg-white/20 -z-10"
            animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.div>

      <span
        className={`text-xs font-sans transition-colors
          ${isDone ? "text-zinc-300" : ""}
          ${isActive ? "text-white font-medium" : ""}
          ${!isDone && !isActive ? "text-zinc-500" : ""}
        `}
      >
        {section.label}
      </span>
    </div>
  );
}
