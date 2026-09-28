"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
}

function stripCVTags(content: string): string {
  // Remove <CV_READY>...</CV_READY> blocks — user sees human-readable text only
  return content.replace(/<CV_READY>[\s\S]*?<\/CV_READY>/g, "").trim();
}

function stripSectionTags(content: string): string {
  return content.replace(/<SECTION_COMPLETE>[\w]+<\/SECTION_COMPLETE>/g, "");
}

function cleanContent(content: string): string {
  return stripSectionTags(stripCVTags(content)).trim();
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const displayContent = cleanContent(message.content);

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div
        className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed font-sans shadow-sm
          ${isUser
            ? "bg-white text-black font-medium rounded-br-sm"
            : "bg-zinc-950/70 text-zinc-100 rounded-bl-sm border border-white/[0.08]"
          }
        `}
      >
        {isUser ? (
          <p>{displayContent}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed font-sans text-zinc-200">{children}</p>,
              ul: ({ children }) => (
                <ul className="mb-2 list-disc pl-4 space-y-0.5">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-2 list-decimal pl-4 space-y-0.5">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="text-zinc-300">{children}</li>,
              strong: ({ children }) => (
                <strong className="font-semibold text-white tracking-tight">
                  {children}
                </strong>
              ),
              h2: ({ children }) => (
                <h2 className="text-sm font-semibold text-white mt-3 mb-1 tracking-tight">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xs font-semibold text-zinc-200 mt-2 mb-1 uppercase tracking-wider">
                  {children}
                </h3>
              ),
              code: ({ children }) => (
                <code className="rounded bg-white/[0.05] px-1.5 py-0.5 text-xs font-mono text-zinc-200 border border-white/[0.08]">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="overflow-x-auto rounded-lg bg-black/60 p-3 text-xs font-mono text-zinc-300 my-2 border border-white/[0.08]">
                  {children}
                </pre>
              ),
              hr: () => <hr className="border-white/[0.08] my-3" />,
              blockquote: ({ children }) => (
                <blockquote className="border-l border-white/30 pl-3 text-zinc-400 italic my-2">
                  {children}
                </blockquote>
              ),
            }}
          >
            {displayContent}
          </ReactMarkdown>
        )}
      </div>
    </motion.div>
  );
}
