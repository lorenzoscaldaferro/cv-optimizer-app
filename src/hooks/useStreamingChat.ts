"use client";

import { useCallback } from "react";
import { useCVStore } from "@/store/cv-store";
import { Message } from "@/types/chat";

const SECTION_COMPLETE_RE = /<SECTION_COMPLETE>(\w+)<\/SECTION_COMPLETE>/g;
const CV_READY_RE = /<CV_READY>([\s\S]*?)<\/CV_READY>/;

function stripTags(text: string): string {
  return text
    .replace(/<SECTION_COMPLETE>\w+<\/SECTION_COMPLETE>/g, "")
    .replace(/<CV_READY>[\s\S]*?<\/CV_READY>/g, "");
}

export function useStreamingChat() {
  const {
    messages,
    parsedCVText,
    addMessage,
    setIsStreaming,
    setStreamingContent,
    markSectionComplete,
    setCVData,
    setIsGenerating,
    setShowModal,
    setDownloadUrl,
    aiEngine,
    geminiApiKey,
    openaiApiKey,
    openrouterApiKey,
    groqApiKey,
    openrouterModel,
  } = useCVStore();

  const sendMessage = useCallback(
    async (userContent: string) => {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: userContent,
        timestamp: new Date(),
      };

      addMessage(userMessage);
      setIsStreaming(true);
      setStreamingContent("");

      const allMessages = [
        ...messages,
        { role: "user", content: userContent },
      ];

      // Get the API key and model based on selected engine
      const selectedEngine = aiEngine || "gemini";
      
      const getApiKeyAndModel = () => {
        switch (selectedEngine) {
          case "gemini":
            return { apiKey: geminiApiKey, model: undefined };
          case "chatgpt":
            return { apiKey: openaiApiKey, model: undefined };
          case "openrouter":
            return { apiKey: openrouterApiKey, model: openrouterModel };
          case "groq":
            return { apiKey: groqApiKey, model: undefined };
          default:
            return { apiKey: geminiApiKey, model: undefined };
        }
      };
      
      const { apiKey, model } = getApiKeyAndModel();
      
      console.log("Sending message:", { 
        aiEngine: selectedEngine, 
        hasApiKey: !!apiKey,
        model: model || "default",
        hasParsedCVText: !!parsedCVText 
      });

      // Raw accumulated content (including tags) for end-of-stream processing
      let rawAccumulated = "";

      function processAndCommit() {
        // Detect and fire SECTION_COMPLETE tags
        SECTION_COMPLETE_RE.lastIndex = 0;
        let match;
        while ((match = SECTION_COMPLETE_RE.exec(rawAccumulated)) !== null) {
          markSectionComplete(match[1]);
        }

        // Commit clean message directly (bypasses streamingContent relay timing issue)
        const clean = stripTags(rawAccumulated).trim();
        if (clean) {
          addMessage({ id: crypto.randomUUID(), role: "assistant", content: clean, timestamp: new Date() });
        }
        setStreamingContent("");
        setIsStreaming(false);

        // Detect CV_READY and trigger generation inline (no useEffect chain)
        const cvReadyMatch = rawAccumulated.match(CV_READY_RE);
        if (cvReadyMatch) {
          let cvData: Record<string, unknown> | null = null;
          try {
            cvData = JSON.parse(cvReadyMatch[1]);
          } catch {
            console.error("Failed to parse CV_READY JSON");
          }
          if (cvData) {
            setCVData(cvData);
            const name = (cvData.contact as Record<string, string> | undefined)?.name
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
          }
        }
      }

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: allMessages,
            parsedCVText: parsedCVText || undefined,
            aiEngine: selectedEngine,
            apiKey: apiKey || undefined,
            model: model || undefined,
          }),
        });

        if (!res.ok || !res.body) {
          throw new Error("Failed to connect to chat API");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") {
                processAndCommit();
                return;
              }
              let parsed: { text?: string; error?: string };
              try {
                parsed = JSON.parse(data);
              } catch {
                continue; // skip malformed SSE lines
              }
              if (parsed.text) {
                rawAccumulated += parsed.text;
                // Re-derive display from full accumulator so complete tags are always stripped
                setStreamingContent(stripTags(rawAccumulated));
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            }
          }
        }

        processAndCommit();
      } catch (err) {
        setIsStreaming(false);
        setStreamingContent("");
        const error = err as Error;
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Sorry, there was an error: ${error.message}. Please try again.`,
          timestamp: new Date(),
        };
        addMessage(errorMessage);
      }
    },
    [
      messages,
      parsedCVText,
      addMessage,
      setIsStreaming,
      setStreamingContent,
      markSectionComplete,
      setCVData,
      setIsGenerating,
      setShowModal,
      setDownloadUrl,
      aiEngine,
      geminiApiKey,
      openaiApiKey,
      openrouterApiKey,
      groqApiKey,
      openrouterModel,
    ]
  );

  return { sendMessage };
}
