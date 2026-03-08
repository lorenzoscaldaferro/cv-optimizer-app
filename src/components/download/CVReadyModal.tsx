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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            <div className="rounded-2xl bg-card border border-border p-6 shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Tu CV está listo
                    </h2>
                    <p className="text-xs text-muted-foreground">Optimizado para ATS (.docx)</p>
                  </div>
                </div>
                {!isGenerating && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    Generando tu archivo .docx...
                  </p>
                </div>
              ) : downloadUrl ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Archivo generado con éxito</span>
                  </div>

                  <DownloadButton url={downloadUrl} />

                  <div className="rounded-lg bg-muted/20 p-3 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Próximos pasos:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>1. Abre en Word o Google Docs para revisar</li>
                      <li>2. Exporta a PDF si la oferta lo requiere</li>
                      <li>3. Adapta el resumen para cada postulación</li>
                      <li>4. Revisa tu puntuación ATS en jobscan.co</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-red-400">
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
