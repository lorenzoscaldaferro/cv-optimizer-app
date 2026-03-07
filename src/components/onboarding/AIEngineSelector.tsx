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
            description: "Ingresá tu API Key para usar Gemini.",
            icon: Zap,
            badge: "BYOK",
            costBadge: "FREE" as const,
        },
        {
            id: "chatgpt" as const,
            name: "OpenAI",
            description: "Ingresá tu API Key para usar GPT-4.",
            icon: ShieldCheck,
            badge: "BYOK",
            costBadge: "PAGO" as const,
        },
        {
            id: "openrouter" as const,
            name: "OpenRouter",
            description: "Accedé a múltiples modelos con una sola API Key.",
            icon: Globe,
            badge: "BYOK",
            costBadge: "FREE" as const,
        },
        {
            id: "groq" as const,
            name: "Groq",
            description: "Ingresá tu API Key para inferencia ultrarrápida.",
            icon: Cpu,
            badge: "BYOK",
            costBadge: "FREE" as const,
        },
    ];

    return (
        <div className="grid gap-4 w-full">
            {engines.map((engine) => {
                const Icon = engine.icon;
                const isSelected = aiEngine === engine.id;

                return (
                    <button
                        key={engine.id}
                        onClick={() => onSelect(engine.id)}
                        className={`
              group relative flex items-start gap-4 p-5 rounded-2xl text-left transition-all duration-300
              border-2 ${isSelected
                                ? "bg-card border-primary/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                                : "bg-card/50 border-white/5 hover:border-white/10 hover:bg-card shadow-sm"
                            }
            `}
                    >
                        <div className={`
              flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors
              ${isSelected ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground group-hover:text-foreground"}
            `}>
                            <Icon className="h-6 w-6" strokeWidth={1.5} />
                        </div>

                        <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-semibold transition-colors ${isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                                    {engine.name}
                                </h3>
                                {engine.badge && (
                                    <span className={`
                    text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm
                    ${isSelected ? "bg-primary/20 text-primary" : "bg-white/10 text-muted-foreground"}
                  `}>
                                        {engine.badge}
                                    </span>
                                )}
                                {engine.costBadge && (
                                    <span className={`
                    text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm
                    ${engine.costBadge === "FREE" ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}
                  `}>
                                        {engine.costBadge}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {engine.description}
                            </p>
                        </div>

                        {isSelected && (
                            <motion.div
                                layoutId="engine-check"
                                className="absolute top-5 right-5 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-lg"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                            >
                                <div className="h-2 w-2 rounded-full bg-black" />
                            </motion.div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
