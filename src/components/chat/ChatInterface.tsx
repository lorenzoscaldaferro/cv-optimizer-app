"use client";

import { Download } from "lucide-react";
import { useCVStore } from "@/store/cv-store";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { useCVReady } from "@/hooks/useCVReady";
import { MessageList } from "./MessageList";
import { InputBar } from "./InputBar";

const engineNames: Record<string, string> = {
    gemini: "Google Gemini",
    chatgpt: "OpenAI",
    openrouter: "OpenRouter",
    groq: "Groq"
};

export function ChatInterface() {
  const { sessionMode, messages, aiEngine, geminiModel, openaiModel, openrouterModel, groqModel, downloadUrl, setShowModal } = useCVStore();
  const { sendMessage } = useStreamingChat();

  // Register side-effect hooks
  useCVReady();

  // Get display name for engine
  const engineName = aiEngine ? engineNames[aiEngine] : "Google Gemini";
  const modelByEngine: Record<string, string> = {
    gemini: geminiModel,
    chatgpt: openaiModel,
    openrouter: openrouterModel,
    groq: groqModel,
  };
  const modelDisplay = aiEngine ? modelByEngine[aiEngine] : geminiModel;

  // Define suggestion arrays for initial empty state
  const suggestions = messages.length === 0 && sessionMode
    ? sessionMode === "upload"
      ? [
        "Empieza a auditar mi CV actual.",
        "¿Cuáles son los problemas más críticos de mi CV?",
        "Ayúdame a mejorar el resumen profesional."
      ]
      : [
        "Quiero crear mi CV desde cero.",
        "¿Qué secciones son obligatorias en un buen CV?",
        "Ayúdame a redactar mi experiencia laboral."
      ]
    : [];

  return (
    <div className="flex flex-col h-full">
      {/* Engine indicator header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.08] bg-zinc-950/40 backdrop-blur-sm">
        <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Motor</span>
            <span className="text-xs font-sans font-medium px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-zinc-200">
                {engineName}
            </span>
            {modelDisplay && modelDisplay !== "auto" && (
                <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.06]">
                    {modelDisplay}
                </span>
            )}
        </div>
        <div className="flex items-center gap-2">
            {downloadUrl && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white text-black text-xs font-medium hover:bg-neutral-200 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Descargar .docx</span>
              </button>
            )}
        </div>
      </div>
      
      <MessageList />
      <InputBar onSend={sendMessage} suggestions={suggestions} />
    </div>
  );
}
