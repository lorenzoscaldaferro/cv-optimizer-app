"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, Globe, Cpu } from "lucide-react";
import { AIEngine } from "@/types/chat";
import { useCVStore } from "@/store/cv-store";

interface AIEngineSelectorProps {
    onSelect: (engine: AIEngine) => void;
}

export function AIEngineSelector({ onSelect }: AIEngineSelectorProps) {
    const { aiEngine } = useCVStore();

    const engines = [
        {
            id: "gemini" as const,
            name: "Google Gemini",
            description: "Gemini 2.5 Flash, 3.1 Pro y Flash Lite vía Google AI Studio.",
            icon: Zap,
            badge: "BYOK",
            costBadge: "GRATIS" as const,
        },
        {
            id: "chatgpt" as const,
            name: "OpenAI",
            description: "GPT-4o, GPT-4o Mini, o3-mini y o1 vía OpenAI API.",
            icon: ShieldCheck,
            badge: "BYOK",
            costBadge: "PAGO" as const,
        },
        {
            id: "openrouter" as const,
            name: "OpenRouter",
            description: "Accede a Claude 3.5, Gemini, Llama 3.3 con una sola key.",
            icon: Globe,
            badge: "BYOK",
            costBadge: "FLEXIBLE" as const,
        },
        {
            id: "groq" as const,
            name: "Groq",
            description: "Llama 3.3 70B y 8B Instant con velocidad de inferencia extrema.",
            icon: Cpu,
            badge: "BYOK",
            costBadge: "GRATIS" as const,
        },
    ];

    return (
        <div className="grid gap-3 w-full">
            {engines.map((engine) => {
                const Icon = engine.icon;
                const isSelected = aiEngine === engine.id;

                return (
                    <button
                        key={engine.id}
                        onClick={() => onSelect(engine.id)}
                        className={`
              group relative flex items-start gap-3.5 p-4 rounded-xl text-left transition-all duration-150
              border ${isSelected
                                ? "bg-zinc-900/80 border-white/40 ring-1 ring-white/20 shadow-sm"
                                : "bg-zinc-950/40 border-white/[0.08] hover:border-white/[0.18] hover:bg-zinc-900/40"
                            }
            `}
                    >
                        <div className={`
              flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors border
              ${isSelected ? "bg-white text-black border-white" : "bg-white/[0.04] text-zinc-300 border-white/[0.08] group-hover:text-white"}
            `}>
                            <Icon className="h-5 w-5" strokeWidth={1.5} />
                        </div>

                        <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-sans font-medium text-sm text-zinc-100">
                                    {engine.name}
                                </h3>
                                {engine.badge && (
                                    <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 border border-white/[0.08]">
                                        {engine.badge}
                                    </span>
                                )}
                                {engine.costBadge && (
                                    <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                        engine.costBadge === "GRATIS" 
                                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                          : "bg-white/[0.04] text-zinc-400 border-white/[0.08]"
                                    }`}>
                                        {engine.costBadge}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                                {engine.description}
                            </p>
                        </div>

                        {isSelected && (
                            <motion.div
                                layoutId="engine-check"
                                className="absolute top-4 right-4 h-4 w-4 rounded-full bg-white flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                            >
                                <div className="h-1.5 w-1.5 rounded-full bg-black" />
                            </motion.div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
