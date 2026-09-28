import { GoogleGenerativeAI } from "@google/generative-ai";

export interface LLMResponse {
    content: string;
    model: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface LLMAdapter {
    id: string;
    stream(messages: Array<{role: string; content: string}>, onChunk: (text: string) => void): Promise<LLMResponse>;
    test(): Promise<boolean>;
}

export class GeminiAdapter implements LLMAdapter {
    readonly id = "gemini";
    private client: GoogleGenerativeAI;
    private modelName: string;

    constructor(apiKey: string, modelName: string = "gemini-3.8-flash") {
        this.client = new GoogleGenerativeAI(apiKey);
        let normalized = modelName || "gemini-3.8-flash";
        // Migrate any deprecated 2.5, 2.0, or 1.5 models automatically
        if (normalized.includes("2.5") || normalized.includes("2.0") || normalized.includes("1.5")) {
            normalized = "gemini-3.8-flash";
        }
        this.modelName = normalized;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async stream(messages: any[], onChunk: (text: string) => void): Promise<LLMResponse> {
        // Separate system message from conversation messages
        const systemMsg = messages.find(m => m.role === "system");
        const conversationMessages = messages.filter(m => m.role !== "system");

        if (conversationMessages.length === 0) {
            throw new Error("No hay mensajes de conversación para procesar.");
        }

        // Gemini history MUST start with a 'user' turn and cannot contain 'system'
        const rawHistory = conversationMessages.slice(0, -1);
        const firstUserIdx = rawHistory.findIndex(m => m.role === "user");
        const validHistory = firstUserIdx >= 0 ? rawHistory.slice(firstUserIdx) : [];

        const history = validHistory.map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }]
        }));

        const lastMessage = conversationMessages[conversationMessages.length - 1];
        const lastContent = typeof lastMessage.content === "string" ? lastMessage.content : JSON.stringify(lastMessage.content);

        const candidateModels = Array.from(
            new Set([this.modelName, "gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"])
        );

        let lastErr: unknown;
        for (const targetModel of candidateModels) {
            try {
                const model = this.client.getGenerativeModel({
                    model: targetModel,
                    systemInstruction: systemMsg ? (typeof systemMsg.content === "string" ? systemMsg.content : JSON.stringify(systemMsg.content)) : undefined,
                });
                const chat = model.startChat({ history });
                const result = await chat.sendMessageStream(lastContent);

                let fullContent = "";
                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    fullContent += text;
                    onChunk(text);
                }

                return {
                    content: fullContent,
                    model: targetModel
                };
            } catch (err) {
                lastErr = err;
                const errStr = String(err);
                if (errStr.includes("503") || errStr.includes("404")) {
                    console.warn(`Model ${targetModel} unavailable (${errStr.slice(0, 80)}), trying fallback model...`);
                    await new Promise((r) => setTimeout(r, 500));
                    continue;
                }
                throw err;
            }
        }

        throw lastErr;
    }

    async test(): Promise<boolean> {
        try {
            const model = this.client.getGenerativeModel({ model: this.modelName });
            const result = await Promise.race([
                model.generateContent({
                    contents: [{ role: "user", parts: [{ text: "hi" }] }],
                    generationConfig: { maxOutputTokens: 2 }
                }),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout al validar modelo")), 8000)
                )
            ]);
            return !!result;
        } catch (e: unknown) {
            console.error("Gemini test failed:", e);
            const msg = e instanceof Error ? e.message : String(e);
            if (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID")) {
                return false;
            }
            // If 503 or 429, try gemini-3.5-flash to verify the key
            if (msg.includes("503") || msg.includes("429")) {
                try {
                    const fallback = this.client.getGenerativeModel({ model: "gemini-3.5-flash" });
                    await fallback.generateContent({
                        contents: [{ role: "user", parts: [{ text: "hi" }] }],
                        generationConfig: { maxOutputTokens: 2 }
                    });
                    return true;
                } catch (fallbackErr: unknown) {
                    const fMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
                    if (fMsg.includes("API key not valid") || fMsg.includes("API_KEY_INVALID")) {
                        return false;
                    }
                    return true;
                }
            }
            return false;
        }
    }
}

export class OpenAIAdapter implements LLMAdapter {
    readonly id = "openai";
    private apiKey: string;
    private model: string;

    constructor(apiKey: string, model: string = "gpt-4o") {
        this.apiKey = apiKey;
        this.model = model;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async stream(messages: any[], onChunk: (text: string) => void): Promise<LLMResponse> {
        const isReasoning = this.model.startsWith("o1") || this.model.startsWith("o3");
        const formattedMessages = messages.map(m => {
            if (isReasoning && m.role === "system") {
                return { role: "developer", content: m.content };
            }
            return m;
        });

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: formattedMessages,
                stream: true,
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "OpenAI API error");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        if (!reader) throw new Error("Could not get stream reader");

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (line.startsWith("data: ") && line !== "data: [DONE]") {
                    try {
                        const data = JSON.parse(line.slice(6));
                        const text = data.choices[0]?.delta?.content || "";
                        if (text) {
                            fullContent += text;
                            onChunk(text);
                        }
                    } catch {
                        // Ignore parse errors for incomplete chunks
                    }
                }
            }
        }

        return {
            content: fullContent,
            model: this.model
        };
    }

    async test(): Promise<boolean> {
        try {
            const isReasoning = this.model.startsWith("o1") || this.model.startsWith("o3") || this.model.includes("astra");
            const tokenParam = isReasoning
                ? { max_completion_tokens: 10 }
                : { max_tokens: 5 };

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: "user", content: "test" }],
                    ...tokenParam
                })
            });

            if (!response.ok && response.status === 400) {
                const fallbackResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        model: this.model,
                        messages: [{ role: "user", content: "test" }],
                        max_completion_tokens: 10
                    })
                });
                return fallbackResponse.ok;
            }

            return response.ok;
        } catch {
            return false;
        }
    }
}

export class OpenAICompatibleAdapter implements LLMAdapter {
    readonly id: string;
    private apiKey: string;
    private baseUrl: string;
    private model: string;

    constructor(apiKey: string, baseUrl: string, model: string = "gpt-4o", id: string = "openai-compatible") {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
        this.id = id;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async stream(messages: any[], onChunk: (text: string) => void): Promise<LLMResponse> {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`
        };

        // Add OpenRouter-specific headers
        if (this.id === "openrouter") {
            headers["HTTP-Referer"] = "https://cv-optimizer.app";
            headers["X-OpenRouter-Title"] = "CV Optimizer";
        }

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                model: this.model,
                messages,
                stream: true,
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "API error");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        if (!reader) throw new Error("Could not get stream reader");

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (line.startsWith("data: ") && line !== "data: [DONE]") {
                    try {
                        const data = JSON.parse(line.slice(6));
                        const text = data.choices[0]?.delta?.content || "";
                        if (text) {
                            fullContent += text;
                            onChunk(text);
                        }
                    } catch {
                        // Ignore parse errors for incomplete chunks
                    }
                }
            }
        }

        return {
            content: fullContent,
            model: this.model
        };
    }

    async test(): Promise<boolean> {
        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            };

            // Add OpenRouter-specific headers
            if (this.id === "openrouter") {
                headers["HTTP-Referer"] = "https://cv-optimizer.app";
                headers["X-OpenRouter-Title"] = "CV Optimizer";
            }

            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: "user", content: "Hi" }],
                    max_tokens: 10
                })
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}
