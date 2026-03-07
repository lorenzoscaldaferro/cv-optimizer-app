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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed font-sans shadow-sm border border-white/5
          ${isUser
            ? "bg-foreground text-background rounded-br-sm"
            : "bg-card text-foreground rounded-bl-sm"
          }
        `}
      >
        {isUser ? (
          <p>{displayContent}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed font-sans">{children}</p>,
              ul: ({ children }) => (
                <ul className="mb-2 list-disc pl-4 space-y-0.5">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-2 list-decimal pl-4 space-y-0.5">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground tracking-wide">
                  {children}
                </strong>
              ),
              h2: ({ children }) => (
                <h2 className="text-base font-heading font-semibold text-foreground mt-3 mb-1">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-heading font-semibold text-foreground mt-2 mb-1">
                  {children}
                </h3>
              ),
              code: ({ children }) => (
                <code className="rounded bg-secondary/50 px-1 py-0.5 text-xs font-mono text-primary border border-white/5">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="overflow-x-auto rounded-lg bg-secondary p-3 text-xs font-mono text-muted-foreground my-2 border border-white/5 shadow-inner">
                  {children}
                </pre>
              ),
              hr: () => <hr className="border-border/50 my-3" />,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-primary pl-3 text-muted-foreground italic my-2">
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
