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
        defaultModel: "gemini-2.5-flash",
        modelOptions: [
            { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Recomendado)" },
            { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
            { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
            { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
            { value: "custom", label: "Personalizado" },
        ]
    },
    chatgpt: {
        name: "OpenAI",
        keyUrl: "https://platform.openai.com/api-keys",
        placeholder: "sk-...",
        defaultModel: "gpt-4o",
        modelOptions: [
            { value: "gpt-4o", label: "GPT-4o (Recomendado)" },
            { value: "gpt-4o-mini", label: "GPT-4o Mini" },
            { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
            { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
            { value: "custom", label: "Personalizado" },
        ]
    },
    openrouter: {
        name: "OpenRouter",
        keyUrl: "https://openrouter.ai/keys",
        placeholder: "sk-or-...",
        defaultModel: "openai/gpt-4o-mini",
        modelOptions: [
            { value: "openai/gpt-4o-mini", label: "GPT-4o Mini (Recomendado)" },
            { value: "openai/gpt-4o", label: "GPT-4o" },
            { value: "auto", label: "Auto" },
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
            { value: "llama-3.1-70b-versatile", label: "Llama 3.1 70B" },
            { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
            { value: "gemma2-9b-it", label: "Gemma 2 9B" },
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
            <div className="bg-card/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Key className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Configurar {config.name}</h3>
                        <p className="text-xs text-muted-foreground">Tu llave se cifrará de forma segura en el servidor.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                            API Key
                        </label>
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder={config.placeholder}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                            Modelo
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={selectValue}
                                onChange={(e) => {
                                    if (e.target.value === "custom") setModel("");
                                    else setModel(e.target.value);
                                }}
                                className="bg-background border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
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
                                    className="flex-1 bg-background border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {model ? `Usando: ${model}` : "Ingresá el nombre del modelo"}
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs"
                        >
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={isLoading || !key.trim()}
                            className="w-full py-3 rounded-xl bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Validando...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="h-4 w-4" />
                                    Validar y Continuar
                                </>
                            )}
                        </button>

                        <button
                            onClick={onBack}
                            disabled={isLoading}
                            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Volver a selección
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
                ¿No tenés una llave? Conseguila en el{" "}
                <a href={config.keyUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Portal de Desarrolladores de {config.name}
                </a>.
            </p>
        </div>
    );
}
