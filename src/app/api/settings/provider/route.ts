import { NextRequest, NextResponse } from "next/server";
import { LlmRouter } from "@/lib/llm/LlmRouter";

/**
 * POST /api/settings/provider
 * Valida y guarda de forma segura una API Key para un proveedor de IA.
 * La clave se cifra en el servidor antes de guardarse en la base de datos.
 */
export async function POST(req: NextRequest) {
    try {
        const { provider, apiKey, userId: reqUserId, model } = await req.json();

        console.log("Provider validation request:", { provider, hasApiKey: !!apiKey, hasModel: !!model });

        // TODO: En una app con Auth real, el userId vendría de la sesión.
        // Implementamos un fallback o usamos el ID pasado para testing.
        const userId = reqUserId || "anonymous";

        if (!provider || !apiKey) {
            return NextResponse.json(
                { error: "Faltan datos obligatorios (provider, apiKey)" },
                { status: 400 }
            );
        }

        const supportedProviders = ["gemini", "openai", "openrouter", "groq"];
        if (!supportedProviders.includes(provider)) {
            return NextResponse.json(
                { error: "Proveedor no soportado" },
                { status: 400 }
            );
        }

        const providerNames: Record<string, string> = {
            gemini: "Google Gemini",
            openai: "OpenAI",
            openrouter: "OpenRouter",
            groq: "Groq"
        };

        // Validación y Guardado (Vía LlmRouter)
        // Esto prueba la conexión antes de guardar.
        console.log("Calling validateAndSave for:", provider);
        await LlmRouter.validateAndSave(userId, provider, apiKey, model);

        return NextResponse.json({
            success: true,
            message: `Conexión con ${providerNames[provider] || provider} exitosa y guardada.`
        });

    } catch (err: unknown) {
        console.error("Settings Error:", err);
        const message = err instanceof Error ? err.message : "Error al configurar el proveedor";
        return NextResponse.json(
            { error: message },
            { status: 400 }
        );
    }
}
