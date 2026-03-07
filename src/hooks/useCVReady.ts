"use client";

import { useEffect, useRef } from "react";
import { useCVStore } from "@/store/cv-store";
import { CVData } from "@/types/cv";

export function useCVReady() {
  const {
    streamingContent,
    messages,
    setCVData,
    setIsGenerating,
    setDownloadUrl,
    setShowModal,
  } = useCVStore();

  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;

    // Scan all committed messages for CV_READY
    const allContent = messages
      .filter((m) => m.role === "assistant")
      .map((m) => m.content)
      .join("\n");

    const match = allContent.match(/<CV_READY>([\s\S]*?)<\/CV_READY>/);
    if (!match) return;

    processedRef.current = true;

    try {
      const cvData: CVData = JSON.parse(match[1].trim());
      setCVData(cvData);

      // Generate filename from contact name
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
        .then((r) => r.json())
        .then((data) => {
          setIsGenerating(false);
          if (data.downloadUrl) {
            setDownloadUrl(data.downloadUrl);
          }
        })
        .catch(() => {
          setIsGenerating(false);
        });
    } catch {
      // JSON parse failed — not ready yet
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Also watch streaming content for real-time detection
  useEffect(() => {
    if (processedRef.current) return;

    const openTag = "<CV_READY>";
    const closeTag = "</CV_READY>";
    const startIdx = streamingContent.indexOf(openTag);
    const endIdx = streamingContent.indexOf(closeTag);

    if (startIdx !== -1 && endIdx !== -1) {
      const jsonStr = streamingContent.slice(
        startIdx + openTag.length,
        endIdx
      );
      try {
        JSON.parse(jsonStr.trim()); // validate
        // Will be handled when message is committed
      } catch {
        // not valid yet
      }
    }
  }, [streamingContent]);
}
