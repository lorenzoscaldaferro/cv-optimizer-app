import { GeminiAdapter, LLMAdapter, OpenAIAdapter, OpenAICompatibleAdapter } from "./adapters";
import { Vault } from "../security/Vault";
import { prisma } from "../prisma";

type Provider = "gemini" | "openai" | "openrouter" | "groq";

const providerBaseUrls: Record<Provider, string | null> = {
    gemini: null,
    openai: "https://api.openai.com/v1",
    openrouter: "https://openrouter.ai/api/v1",
    groq: "https://api.groq.com/openai/v1"
};

const defaultModels: Record<Provider, string> = {
    gemini: "gemini-2.5-flash",
    openai: "gpt-4o",
    openrouter: "openai/gpt-4o-mini",
    groq: "llama-3.3-70b-versatile"
};

export class LlmRouter {
    /**
     * Resolves the correct LLM adapter for a given user and provider.
     * Priority: 1) Provided API key, 2) DB (if available), 3) Environment variables
     */
    static async resolveAdapter(
        userId: string, 
        provider: Provider, 
        providedApiKey?: string | null,
        model?: string
    ): Promise<LLMAdapter> {
        // 1. Use provided API key if available (from client session)
        if (providedApiKey) {
            console.log(`Using provided API key for ${provider}`);
            return this.createAdapter(provider, providedApiKey, model);
        }

        // 2. Try to fetch setting from DB if available
        if (prisma) {
            try {
                const setting = await prisma.lLMProviderSettings.findFirst({
                    where: {
                        userId,
                        provider,
                        isActive: true
                    },
                    orderBy: {
                        updatedAt: "desc"
                    }
                });

                if (setting) {
                    // Decrypt the key
                    let apiKey: string;
                    try {
                        apiKey = Vault.decrypt(setting.encryptedApiKey);
                    } catch {
                        console.error("Failed to decrypt API Key for provider:", provider);
                        throw new Error("Error de seguridad: No se pudo recuperar la clave cifrada.");
                    }

                    return this.createAdapter(provider, apiKey, model);
                }
            } catch (dbError) {
                console.warn("Database unavailable, falling back to env keys:", dbError);
            }
        }

        // 3. Fallback to environment variable keys
        const envKey = this.getEnvKey(provider);
        if (envKey) {
            console.log(`Using ${provider.toUpperCase()}_API_KEY from environment`);
            return this.createAdapter(provider, envKey, model);
        }

        throw new Error(`No se encontró configuración para el proveedor ${provider}. Configura la variable de entorno o usa el Onboarding.`);
    }

    private static createAdapter(provider: Provider, apiKey: string, model?: string): LLMAdapter {
        const selectedModel = model || defaultModels[provider];
        
        switch (provider) {
            case "gemini":
                return new GeminiAdapter(apiKey, selectedModel);
            case "openai":
                return new OpenAIAdapter(apiKey, selectedModel);
            case "openrouter":
                return new OpenAICompatibleAdapter(
                    apiKey,
                    providerBaseUrls.openrouter!,
                    selectedModel,
                    "openrouter"
                );
            case "groq":
                return new OpenAICompatibleAdapter(
                    apiKey,
                    providerBaseUrls.groq!,
                    selectedModel,
                    "groq"
                );
            default:
                throw new Error(`Unknown provider: ${provider}`);
        }
    }

    private static getEnvKey(provider: Provider): string | null {
        const envVars: Record<Provider, string> = {
            gemini: "GEMINI_API_KEY",
            openai: "OPENAI_API_KEY",
            openrouter: "OPENROUTER_API_KEY",
            groq: "GROQ_API_KEY"
        };
        return process.env[envVars[provider]] || null;
    }

    /**
     * Validates a key for a given provider and optionally saves it.
     */
    static async validateAndSave(userId: string, provider: Provider, rawKey: string, model?: string) {
        console.log("validateAndSave called:", { provider, model, keyPrefix: rawKey.slice(0, 10) });
        
        // 1. Test connection with the adapter
        const adapter = this.createAdapter(provider, rawKey, model);
        console.log("Testing adapter:", adapter.id);
        
        const isValid = await adapter.test();
        console.log("Adapter test result:", isValid);

        if (!isValid) {
            const activeModel = model || defaultModels[provider];
            throw new Error(`No se pudo validar la conexión con ${provider} (modelo: ${activeModel}). Verifica que la API key sea correcta y que tu cuenta tenga acceso y cuota.`);
        }

        // 2. Try to save to DB if available and Vault is configured
        if (prisma && Vault.isConfigured()) {
            try {
                const encryptedKey = Vault.encrypt(rawKey);
                return await prisma.lLMProviderSettings.upsert({
                    where: { userId_provider: { userId, provider } },
                    update: {
                        encryptedApiKey: encryptedKey,
                        isActive: true,
                        version: { increment: 1 }
                    },
                    create: {
                        userId,
                        provider,
                        encryptedApiKey: encryptedKey,
                        isActive: true
                    }
                });
            } catch (dbError) {
                console.warn("Failed to persist provider settings to database (proceeding with BYOK):", dbError);
            }
        }

        // Return success even without DB save
        return { success: true, provider };
    }
}
