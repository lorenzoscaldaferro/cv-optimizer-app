"use client";

import { useEffect, useRef } from "react";
import { useCVStore } from "@/store/cv-store";

export function useCVReady() {
  const { cvData, setIsGenerating, setDownloadUrl, setShowModal } =
    useCVStore();

  const processedRef = useRef(false);

  useEffect(() => {
    if (!cvData || processedRef.current) return;
    processedRef.current = true;

    const name = cvData.contact?.name
      ?.replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "");
    const filename = `CV_${name || "output"}.docx`;

    setIsGenerating(true);
    setShowModal(true);

    fetch("/api/generate-docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvJson: cvData, filename }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Generation failed");
        return r.arrayBuffer();
      })
      .then((buffer) => {
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        setDownloadUrl(URL.createObjectURL(blob));
        setIsGenerating(false);
      })
      .catch(() => {
        setIsGenerating(false);
      });
  }, [cvData, setIsGenerating, setDownloadUrl, setShowModal]);
}
