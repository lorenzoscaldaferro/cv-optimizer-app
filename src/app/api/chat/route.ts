import { NextRequest } from "next/server";
import { LlmRouter } from "@/lib/llm/LlmRouter";
import { buildSystemPrompt } from "@/lib/skill-prompt";

/**
 * POST /api/chat
 * Endpoint unificado de chat que utiliza el LlmRouter para 
 * enrutar de forma segura hacia Gemini, OpenAI, OpenRouter o Groq.
 */
export async function POST(req: NextRequest) {
  try {
    const { messages, parsedCVText, aiEngine, userId: reqUserId, apiKey, model } = await req.json();

    // ID de usuario (Default: anonymous para testing local)
    const userId = reqUserId || "anonymous";
    const systemPrompt = buildSystemPrompt(parsedCVText);
    const encoder = new TextEncoder();

    // Map AI engine to provider
    const providerMap: Record<string, string> = {
        gemini: "gemini",
        chatgpt: "openai",
        openrouter: "openrouter",
        groq: "groq"
    };
    
    const provider = providerMap[aiEngine] || "gemini";
    const adapter = await LlmRouter.resolveAdapter(userId, provider as "gemini" | "openai" | "openrouter" | "groq", apiKey, model);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const fullMessages: Array<{role: string; content: string}> = [
            { role: "system", content: systemPrompt },
            ...messages.map((m: {role: string; content: string}) => ({ role: m.role, content: m.content })),
          ];

          // Stream del Adaptador
          await adapter.stream(fullMessages, (text) => {
            const data = `data: ${JSON.stringify({ text })}\n\n`;
            controller.enqueue(encoder.encode(data));
          });

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err: unknown) {
          console.error("Stream Runtime Error:", err);
          const message = err instanceof Error ? err.message : "Unknown error";
          const data = `data: ${JSON.stringify({ error: message })}\n\n`;
          controller.enqueue(encoder.encode(data));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

  } catch (err: unknown) {
    console.error("Chat API Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}
