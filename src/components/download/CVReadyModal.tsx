"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, CheckCircle2, X } from "lucide-react";
import { useCVStore } from "@/store/cv-store";
import { DownloadButton } from "./DownloadButton";
import { Button } from "@/components/ui/button";

export function CVReadyModal() {
  const { showModal, isGenerating, downloadUrl, setShowModal } = useCVStore();

  return (
    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isGenerating && setShowModal(false)}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rounded-xl bg-zinc-950 border border-white/[0.12] p-6 shadow-2xl">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-sans font-medium text-sm text-zinc-100">
                      Tu CV está listo
                    </h2>
                    <p className="text-xs text-zinc-400">Optimizado para filtros ATS (.docx)</p>
                  </div>
                </div>
                {!isGenerating && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-md"
                    onClick={() => setShowModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                  <p className="text-xs text-zinc-400 font-sans">
                    Generando tu archivo .docx...
                  </p>
                </div>
              ) : downloadUrl ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Archivo .docx compilado con éxito</span>
                  </div>

                  <DownloadButton url={downloadUrl} />

                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3.5 space-y-1.5">
                    <p className="text-xs font-medium text-zinc-300">
                      Siguientes pasos recomendados:
                    </p>
                    <ul className="text-xs text-zinc-400 space-y-1 font-sans">
                      <li>• Abre en Word o Google Docs para dar tu revisión final.</li>
                      <li>• Exporta a PDF si la oferta lo solicita explícitamente.</li>
                      <li>• Ajusta palabras clave del resumen para cada postulación.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-red-400">
                  Error al generar el archivo. Por favor, inténtalo de nuevo.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
