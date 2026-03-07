"use client";

import { useEffect } from "react";
import { useCVStore } from "@/store/cv-store";

const SECTION_IDS = [
  "contact",
  "summary",
  "education",
  "projects",
  "skills",
  "extracurricular",
  "certifications",
];

export function useSectionProgress() {
  const { messages, streamingContent, markSectionComplete, sections } =
    useCVStore();

  useEffect(() => {
    // Scan all messages + current streaming content for SECTION_COMPLETE tags
    const allContent =
      messages
        .filter((m) => m.role === "assistant")
        .map((m) => m.content)
        .join("\n") +
      "\n" +
      streamingContent;

    const regex = /<SECTION_COMPLETE>([\w]+)<\/SECTION_COMPLETE>/g;
    let match;
    const foundIds = new Set<string>();

    while ((match = regex.exec(allContent)) !== null) {
      foundIds.add(match[1].toLowerCase());
    }

    // Mark sections complete if found in content but not yet marked
    for (const id of Array.from(foundIds)) {
      if (SECTION_IDS.includes(id)) {
        const section = sections.find((s) => s.id === id);
        if (section && section.status !== "done") {
          markSectionComplete(id);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, streamingContent]);
}
