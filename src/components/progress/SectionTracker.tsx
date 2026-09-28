"use client";

import { useCVStore } from "@/store/cv-store";
import { SectionBadge } from "./SectionBadge";

export function SectionTracker() {
  const { sections } = useCVStore();
  const doneCount = sections.filter((s) => s.status === "done").length;
  const progress = Math.round((doneCount / sections.length) * 100);

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col gap-1 p-6 h-full">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Progreso
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              {doneCount}/{sections.length}
            </span>
          </div>
          <div className="h-1 w-full bg-white/[0.08] rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300 rounded-full" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          {sections.map((section, i) => (
            <SectionBadge key={section.id} section={section} index={i} />
          ))}
        </div>

        {doneCount === sections.length && (
          <div className="mt-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
            <p className="text-xs text-emerald-400 font-medium font-sans">
              ¡Todas las secciones completadas! Revisa tu CV arriba.
            </p>
          </div>
        )}
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden px-4 pt-3 pb-2.5 bg-zinc-950 border-b border-white/[0.08]">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-medium text-zinc-200">
            Construyendo tu CV
          </p>
          <p className="text-xs font-mono text-zinc-400">
            {doneCount}/{sections.length}
          </p>
        </div>
        <div className="h-1 w-full bg-white/[0.08] rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-300 rounded-full" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
    </>
  );
}
