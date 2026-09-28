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
    <div className="border-t border-white/[0.08] bg-black/80 backdrop-blur-md px-4 py-3 relative">
      <AnimatePresence>
        {suggestions.length > 0 && !value && (
          <motion.div
            className="absolute bottom-[calc(100%+12px)] left-0 right-0 px-4 flex flex-wrap justify-center gap-1.5 pointer-events-none"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
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
                className="pointer-events-auto flex items-center px-3 py-1.5 rounded-full bg-zinc-900/90 backdrop-blur-md border border-white/[0.08] text-xs font-sans text-zinc-300 hover:text-white hover:border-white/25 hover:bg-zinc-800/90 transition-all duration-150 shadow-sm"
                whileTap={{ scale: 0.98 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 rounded-xl bg-zinc-950/80 border border-white/[0.1] px-3.5 py-2.5 focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20 transition-all shadow-sm relative z-10">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={
            isStreaming ? "Generando respuesta..." : "Escribe un mensaje... (Enter para enviar)"
          }
          disabled={isStreaming}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-zinc-100 font-sans placeholder:text-zinc-500 focus:outline-none disabled:opacity-50 max-h-36 leading-relaxed"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!value.trim() || isStreaming}
          className="h-8 w-8 shrink-0 bg-white text-black hover:bg-neutral-200 disabled:opacity-20 disabled:hover:bg-white transition-all rounded-lg cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
      <p className="mt-1.5 text-center text-[11px] font-mono text-zinc-500 tracking-normal">
        Enter para enviar • Shift+Enter para nueva línea
      </p>
    </div>
  );
}
