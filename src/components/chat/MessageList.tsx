"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCVStore } from "@/store/cv-store";
import { MessageBubble } from "./MessageBubble";

export function MessageList() {
  const { messages, isStreaming, streamingContent } = useCVStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Clean streaming content for display
  function cleanStreaming(content: string): string {
    return content
      .replace(/<CV_READY>[\s\S]*?<\/CV_READY>/g, "")
      .replace(/<SECTION_COMPLETE>[\w]+<\/SECTION_COMPLETE>/g, "")
      .trim();
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* Streaming message */}
      {isStreaming && streamingContent && (
        <motion.div
          className="flex justify-start"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-card px-4 py-3 text-sm text-foreground leading-relaxed font-sans shadow-sm border border-white/5">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-2 list-disc pl-4 space-y-0.5">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-2 list-decimal pl-4 space-y-0.5">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-muted-foreground">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-heading font-semibold text-foreground tracking-wide">
                    {children}
                  </strong>
                ),
              }}
            >
              {cleanStreaming(streamingContent)}
            </ReactMarkdown>
            <span className="inline-block h-4 w-0.5 bg-primary animate-pulse ml-0.5 align-text-bottom drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          </div>
        </motion.div>
      )}

      {/* Typing indicator (before first token arrives) */}
      {isStreaming && !streamingContent && (
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-sm bg-card border border-white/5 shadow-sm px-4 py-3">
            <div className="flex gap-1 items-center h-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-primary/60"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
