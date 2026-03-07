"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  onComplete: () => void;
}

export function FileUploader({ onComplete }: FileUploaderProps) {
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [manualText, setManualText] = useState("");
  const [showManual, setShowManual] = useState(false);
  const { setParsedCVText } = useCVStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setStatus("uploading");
      setErrorMsg("");

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/parse-cv", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || "Error al analizar el archivo");
        }

        setParsedCVText(data.text, data.filename);
        setStatus("success");

        setTimeout(() => {
          onComplete();
        }, 800);
      } catch (err) {
        setStatus("error");
        setErrorMsg((err as Error).message);
      }
    },
    [setParsedCVText, onComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    disabled: status === "uploading" || status === "success",
  });

  function handleManualSubmit() {
    if (!manualText.trim()) return;
    setParsedCVText(manualText, "manual-paste.txt");
    onComplete();
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {!showManual ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              {...getRootProps()}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300 cursor-pointer
                ${isDragActive ? "border-muted bg-card" : "border-border/50 hover:border-white/10 bg-card/50 hover:bg-card"}
                ${status === "success" ? "border-emerald-500/50 bg-emerald-500/5" : ""}
                ${status === "error" ? "border-red-500/50 bg-red-500/5" : ""}
              `}
            >
              <input {...getInputProps()} />

              {status === "uploading" && (
                <motion.div
                  className="flex flex-col items-center gap-2"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <FileText className="h-8 w-8 text-primary" />
                  <p className="text-sm text-muted-foreground font-sans">Analizando tu CV...</p>
                </motion.div>
              )}

              {status === "success" && (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  <p className="text-sm text-emerald-400 font-medium font-sans">¡CV analizado con éxito!</p>
                </div>
              )}

              {status === "idle" && (
                <>
                  <Upload className={`h-8 w-8 transition-colors ${isDragActive ? "text-foreground" : "text-muted-foreground"}`} strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-medium text-foreground tracking-wide">
                      {isDragActive ? "Suelta tu CV aquí" : "Arrastra y suelta tu CV"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                      PDF o DOCX — hasta 10MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-secondary mt-2 transition-all duration-300"
                  >
                    Buscar archivos
                  </Button>
                </>
              )}

              {status === "error" && (
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                  <p className="text-xs text-red-400">{errorMsg}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatus("idle");
                    }}
                  >
                    Intentar de nuevo
                  </Button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowManual(true)}
              className="mt-3 w-full text-xs text-muted-foreground hover:text-primary transition-colors font-sans"
            >
              O pega el texto de tu CV manualmente
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="manual"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground tracking-wide font-medium">Pega el texto de tu CV</p>
              <button onClick={() => setShowManual(false)}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            </div>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Pega el contenido de tu CV aquí..."
              className="input h-40 resize-none font-sans"
            />
            <Button
              onClick={handleManualSubmit}
              disabled={!manualText.trim()}
              className="w-full btn-primary"
            >
              Continuar con este CV
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
