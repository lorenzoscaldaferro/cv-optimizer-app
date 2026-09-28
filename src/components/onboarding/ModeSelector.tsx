"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Upload, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCVStore } from "@/store/cv-store";
import { SessionMode } from "@/types/chat";
import { FileUploader } from "./FileUploader";

export function ModeSelector() {
  const [selected, setSelected] = useState<SessionMode | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const { setSessionMode } = useCVStore();
  const router = useRouter();

  function handleScratch() {
    setSessionMode("scratch");
    router.push("/build");
  }

  function handleUploadSelect() {
    setSelected("upload");
    setShowUploader(true);
  }

  function handleUploadComplete() {
    setSessionMode("upload");
    router.push("/build");
  }

  const modes = [
    {
      id: "scratch" as SessionMode,
      icon: <Sparkles className="h-6 w-6" />,
      title: "Crear desde Cero",
      description:
        "Te guiaré a través de una entrevista paso a paso para crear un CV pulido — no necesitas uno previo.",
      action: handleScratch,
      accent: "primary",
    },
    {
      id: "upload" as SessionMode,
      icon: <Upload className="h-6 w-6" />,
      title: "Subir Mi CV",
      description:
        "Auditaré tu CV actual, identificaré problemas y te ayudaré a reconstruirlo al más alto nivel.",
      action: handleUploadSelect,
      accent: "accent",
    },
  ];

  return (
    <div className="w-full max-w-lg space-y-4">
      <AnimatePresence mode="wait">
        {!showUploader ? (
          <motion.div
            key="modes"
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {modes.map((mode, i) => (
              <motion.button
                key={mode.id}
                onClick={mode.action}
                className={`w-full text-left rounded-xl border p-5 transition-all duration-150 relative group overflow-hidden
                  ${selected === mode.id
                    ? "border-white/30 bg-zinc-900/80 ring-1 ring-white/10"
                    : "border-white/[0.08] bg-zinc-950/40 hover:border-white/[0.18] hover:bg-zinc-900/40"
                  }
                `}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.2 }}
              >
                <div className="flex items-start gap-4 relative z-10">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300 group-hover:text-white group-hover:border-white/20 transition-all"
                  >
                    {mode.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-sans font-medium text-sm text-zinc-100 tracking-tight">{mode.title}</p>
                      <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 shrink-0 transition-all" />
                    </div>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-sans">
                      {mode.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-4 flex items-center gap-2">
              <button
                onClick={() => setShowUploader(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                title="Volver"
              >
                ← Volver
              </button>
            </div>
            <FileUploader onComplete={handleUploadComplete} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
