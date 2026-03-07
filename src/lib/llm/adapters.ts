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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private model: any;

    constructor(apiKey: string, modelName: string = "gemini-2.5-flash") {
        this.client = new GoogleGenerativeAI(apiKey);
        this.model = this.client.getGenerativeModel({ model: modelName });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async stream(messages: any[], onChunk: (text: string) => void): Promise<LLMResponse> {
        // Convert messages to Gemini format
        const history = messages.slice(0, -1).map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
        }));

        const lastMessage = messages[messages.length - 1];

        const chat = this.model.startChat({ history });
        const result = await chat.sendMessageStream(lastMessage.content);

        let fullContent = "";
        for await (const chunk of result.stream) {
            const text = chunk.text();
            fullContent += text;
            onChunk(text);
        }

        return {
            content: fullContent,
            model: this.model.model
        };
    }

    async test(): Promise<boolean> {
        try {
            const result = await this.model.generateContent("test");
            return !!result.response.text();
        } catch (e) {
            console.error("Gemini test failed:", e);
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
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages,
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
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: "user", content: "test" }],
                    max_tokens: 5
                })
            });
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
