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
        className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold
          ${isDone ? "bg-accent text-accent-foreground" : ""}
          ${isActive ? "bg-primary text-primary-foreground" : ""}
          ${!isDone && !isActive ? "bg-white/5 text-muted-foreground border border-white/5" : ""}
        `}
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {isDone ? (
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        ) : (
          <span>{index + 1}</span>
        )}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/40"
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      <span
        className={`text-sm font-medium transition-colors font-sans
          ${isDone ? "text-accent" : ""}
          ${isActive ? "text-foreground font-semibold" : ""}
          ${!isDone && !isActive ? "text-muted-foreground" : ""}
        `}
      >
        {section.label}
      </span>
    </div>
  );
}
