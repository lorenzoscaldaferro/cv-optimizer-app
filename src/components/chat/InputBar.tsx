"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";

interface InputBarProps {
  onSend: (content: string) => void;
  suggestions?: string[];
}

export function InputBar({ onSend, suggestions = [] }: InputBarProps) {
  const [value, setValue] = useState("");
  const { isStreaming } = useCVStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <div className="border-t border-border bg-background px-4 py-3 relative">
      <AnimatePresence>
        {suggestions.length > 0 && !value && (
          <motion.div
            className="absolute bottom-[calc(100%+12px)] left-0 right-0 px-4 flex flex-wrap justify-center gap-2 pointer-events-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {suggestions.map((suggestion, idx) => (
              <motion.button
                key={idx}
                onClick={() => {
                  setValue(suggestion);
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
                className="pointer-events-auto flex items-center px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-white/5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-card hover:scale-[1.02] hover:shadow-sm transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 rounded-xl bg-card border border-white/5 px-3 py-2 focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10 transition-all shadow-sm relative z-10">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={
            isStreaming ? "La IA está escribiendo..." : "Escribe un mensaje... (Enter para enviar)"
          }
          disabled={isStreaming}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-foreground font-sans placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 max-h-40"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!value.trim() || isStreaming}
          className="h-8 w-8 shrink-0 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-30 disabled:hover:bg-foreground transition-colors rounded-lg"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
      <p className="mt-1.5 text-center text-xs text-muted-foreground font-sans tracking-wide">
        Shift+Enter para nueva línea
      </p>
    </div>
  );
}
