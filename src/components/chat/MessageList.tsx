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
      .replace(/<CV_READY>[\s\S]*/g, "")
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
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="max-w-[85%] rounded-xl bg-zinc-950/70 px-4 py-3.5 text-sm text-zinc-100 leading-relaxed font-sans border border-white/[0.08] shadow-sm">
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
                  <li className="text-zinc-300">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-white tracking-tight">
                    {children}
                  </strong>
                ),
              }}
            >
              {cleanStreaming(streamingContent)}
            </ReactMarkdown>
            <span className="inline-block h-4 w-0.5 bg-white animate-pulse ml-1 align-text-bottom" />
          </div>
        </motion.div>
      )}

      {/* Typing indicator (before first token arrives) */}
      {isStreaming && !streamingContent && (
        <div className="flex justify-start">
          <div className="rounded-xl bg-zinc-950/70 border border-white/[0.08] px-4 py-3">
            <div className="flex gap-1.5 items-center h-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-zinc-400"
                  animate={{ y: [0, -3, 0] }}
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
