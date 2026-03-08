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

const defaultModels: Record<string, string> = {
    gemini: "gemini-2.5-flash",
    chatgpt: "gpt-4o",
    openrouter: "auto",
    groq: "llama-3.1-70b-versatile"
};

export function ChatInterface() {
  const { sessionMode, messages, aiEngine, openrouterModel, downloadUrl, setShowModal } = useCVStore();
  const { sendMessage } = useStreamingChat();

  // Register side-effect hooks
  useCVReady();

  // Get display name for engine
  const engineName = aiEngine ? engineNames[aiEngine] : "Google Gemini";
  const modelDisplay = aiEngine === "openrouter" && openrouterModel && openrouterModel !== "auto" 
      ? openrouterModel 
      : (aiEngine ? defaultModels[aiEngine] : defaultModels.gemini);

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
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-card/30">
        <span className="text-xs text-muted-foreground">Usando:</span>
        <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                {engineName}
            </span>
            {aiEngine === "openrouter" && openrouterModel && openrouterModel !== "auto" && (
                <span className="text-[10px] text-muted-foreground">
                    • {modelDisplay}
                </span>
            )}
            {downloadUrl && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                <Download className="h-3 w-3" />
                CV listo
              </button>
            )}
        </div>
      </div>
      
      <MessageList />
      <InputBar onSend={sendMessage} suggestions={suggestions} />
    </div>
  );
}
