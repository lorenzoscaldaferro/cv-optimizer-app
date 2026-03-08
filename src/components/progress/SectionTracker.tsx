"use client";

import { useCVStore } from "@/store/cv-store";
import { SectionBadge } from "./SectionBadge";
import { Progress } from "@/components/ui/progress";

export function SectionTracker() {
  const { sections } = useCVStore();
  const doneCount = sections.filter((s) => s.status === "done").length;
  const progress = Math.round((doneCount / sections.length) * 100);

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col gap-1 p-6 h-full">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Progreso
          </p>
          <Progress value={progress} className="h-1.5 bg-white/10" />
          <p className="text-xs text-muted-foreground mt-1">
            {doneCount}/{sections.length} secciones
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {sections.map((section, i) => (
            <SectionBadge key={section.id} section={section} index={i} />
          ))}
        </div>

        {doneCount === sections.length && (
          <div className="mt-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
            <p className="text-xs text-emerald-400 font-medium">
              ¡Todas las secciones completadas! Revisa tu CV arriba.
            </p>
          </div>
        )}
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden px-4 pt-3 pb-2 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-medium text-foreground">
            Construyendo tu CV
          </p>
          <p className="text-xs text-muted-foreground">
            {doneCount}/{sections.length}
          </p>
        </div>
        <Progress value={progress} className="h-1 bg-white/10" />
      </div>
    </>
  );
}
