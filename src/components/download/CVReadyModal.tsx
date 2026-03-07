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
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isGenerating && setShowModal(false)}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            <div className="mx-4 rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                    <FileText className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-100">
                      Your CV is ready
                    </h2>
                    <p className="text-xs text-slate-500">ATS-optimized .docx</p>
                  </div>
                </div>
                {!isGenerating && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-slate-300"
                    onClick={() => setShowModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                  <p className="text-sm text-slate-400">
                    Generating your .docx file...
                  </p>
                </div>
              ) : downloadUrl ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>File generated successfully</span>
                  </div>

                  <DownloadButton url={downloadUrl} />

                  <div className="rounded-lg bg-slate-800 p-3 space-y-1.5">
                    <p className="text-xs font-medium text-slate-400">
                      Next steps:
                    </p>
                    <ul className="text-xs text-slate-500 space-y-1">
                      <li>1. Open in Word or Google Docs to review</li>
                      <li>2. Export to PDF if the posting requires it</li>
                      <li>3. Tailor the summary for each application</li>
                      <li>4. Check your ATS score on jobscan.co</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-red-400">
                  Failed to generate file. Please try again.
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
