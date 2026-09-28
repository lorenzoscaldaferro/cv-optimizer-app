"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Key, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { AIEngine } from "@/types/chat";
import { useCVStore } from "@/store/cv-store";

interface KeyConfigStepProps {
    engine: AIEngine;
    onSuccess: () => void;
    onBack: () => void;
}

const providerConfig: Record<AIEngine, { name: string; keyUrl: string; placeholder: string; defaultModel: string; modelOptions: { value: string; label: string }[] }> = {
    gemini: {
        name: "Google Gemini",
        keyUrl: "https://aistudio.google.com/app/apikey",
        placeholder: "AIza...",
        defaultModel: "gemini-3.8-flash",
        modelOptions: [
            { value: "gemini-3.8-flash", label: "Gemini 3.8 Flash (Última Generación — Recomendado)" },
            { value: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview (Máximo Razonamiento)" },
            { value: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite (Baja Latencia)" },
            { value: "gemini-3.5-flash", label: "Gemini 3.5 Flash" },
            { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Alta Cuota Gratuita / Estable)" },
            { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
            { value: "gemini-flash-latest", label: "Gemini Flash Latest" },
            { value: "gemini-pro-latest", label: "Gemini Pro Latest" },
            { value: "custom", label: "Personalizado" },
        ]
    },
    chatgpt: {
        name: "OpenAI",
        keyUrl: "https://platform.openai.com/api-keys",
        placeholder: "sk-...",
        defaultModel: "gpt-6-sol",
        modelOptions: [
            { value: "gpt-6-sol", label: "GPT-6 Sol (Recomendado — Flagship 2026)" },
            { value: "gpt-6-luna", label: "GPT-6 Luna (Rápido y Eficiente)" },
            { value: "gpt-6-astra", label: "GPT-6 Astra (Máximo Razonamiento)" },
            { value: "gpt-5.6-sol", label: "GPT-5.6 Sol" },
            { value: "gpt-4o", label: "GPT-4o (Legacy)" },
            { value: "gpt-4o-mini", label: "GPT-4o Mini (Económico)" },
            { value: "o3-mini", label: "o3-mini (Razonamiento Lógico)" },
            { value: "o1", label: "o1 (Razonamiento Completo)" },
            { value: "custom", label: "Personalizado" },
        ]
    },
    openrouter: {
        name: "OpenRouter",
        keyUrl: "https://openrouter.ai/keys",
        placeholder: "sk-or-...",
        defaultModel: "google/gemini-3.8-flash",
        modelOptions: [
            { value: "google/gemini-3.8-flash", label: "Gemini 3.8 Flash (Recomendado)" },
            { value: "openai/gpt-6-luna", label: "GPT-6 Luna" },
            { value: "anthropic/claude-opus-5.5", label: "Claude Opus 5.5 (Alta Capacidad)" },
            { value: "anthropic/claude-sonnet-5.5", label: "Claude Sonnet 5.5" },
            { value: "deepseek/deepseek-v4.1-flash", label: "DeepSeek V4.1 Flash (Ultra Rápido)" },
            { value: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
            { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
            { value: "auto", label: "Auto (Mejor balance automático)" },
            { value: "custom", label: "Personalizado" },
        ]
    },
    groq: {
        name: "Groq",
        keyUrl: "https://console.groq.com/keys",
        placeholder: "gsk_...",
        defaultModel: "llama-3.3-70b-versatile",
        modelOptions: [
            { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (Recomendado)" },
            { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant (Ultra-rápido)" },
            { value: "openai/gpt-oss-120b", label: "GPT-OSS 120B" },
            { value: "openai/gpt-oss-20b", label: "GPT-OSS 20B" },
            { value: "custom", label: "Personalizado" },
        ]
    }
};

export function KeyConfigStep({ engine, onSuccess, onBack }: KeyConfigStepProps) {
    const [key, setKey] = useState("");
    const [model, setModel] = useState(providerConfig[engine].defaultModel);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setEngineConfigured, setApiKey, setModel: saveModel, userId } = useCVStore();

    const config = providerConfig[engine];

    // Derive select value: if model matches a known option, use it; otherwise "custom"
    const knownValues = config.modelOptions.map(o => o.value).filter(v => v !== "custom");
    const selectValue = knownValues.includes(model) ? model : "custom";
    const isCustomModel = selectValue === "custom";

    async function handleSave() {
        if (!key.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const providerMap: Record<AIEngine, string> = {
                gemini: "gemini",
                chatgpt: "openai",
                openrouter: "openrouter",
                groq: "groq"
            };

            const response = await fetch("/api/settings/provider", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: providerMap[engine],
                    apiKey: key.trim(),
                    model,
                    userId
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al validar la clave");
            }

            setEngineConfigured(engine, true);
            setApiKey(engine, key.trim());
            saveModel(engine, model);
            onSuccess();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error desconocido";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full space-y-6">
            <div className="bg-zinc-950/60 border border-white/[0.08] rounded-xl p-6 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-5">
                    <div className="h-9 w-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-200">
                        <Key className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="font-sans font-medium text-sm text-zinc-100">Configurar {config.name}</h3>
                        <p className="text-xs text-zinc-400">Tu clave se valida en tiempo real y se mantiene segura en tu sesión.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5 block">
                            API Key
                        </label>
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder={config.placeholder}
                            className="w-full bg-zinc-900/60 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5 block">
                            Modelo
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={selectValue}
                                onChange={(e) => {
                                    if (e.target.value === "custom") setModel("");
                                    else setModel(e.target.value);
                                }}
                                className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-white/30 transition-all flex-1"
                            >
                                {config.modelOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {isCustomModel && (
                                <input
                                    type="text"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    placeholder="ej: nombre-del-modelo"
                                    className="flex-1 bg-zinc-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-white/30 transition-all"
                                />
                            )}
                        </div>
                        <p className="text-[11px] font-mono text-zinc-500 mt-1.5">
                            {model ? `Activo: ${model}` : "Ingresá el identificador del modelo"}
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                        >
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <div className="flex flex-col gap-2 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={isLoading || !key.trim()}
                            className="w-full py-2.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-all disabled:opacity-40 flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Validando conexión...</span>
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>Validar y Continuar</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={onBack}
                            disabled={isLoading}
                            className="w-full py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                            Volver a selección
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-center text-xs text-zinc-500">
                ¿No tenés una API Key? Conseguila en el{" "}
                <a href={config.keyUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:underline">
                    Portal de {config.name}
                </a>.
            </p>
        </div>
    );
}
