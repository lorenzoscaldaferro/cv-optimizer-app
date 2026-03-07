import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { route: string[] } }
) {
    const route = params.route[0];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (route === "login") {
        try {
            const clientId = process.env.CHATGPT_CLIENT_ID;
            const authBaseUrl = process.env.CHATGPT_AUTH_URL;

            const isSimulated = process.env.NEXT_PUBLIC_SIMULATE_OAUTH === "true";

            if (isSimulated && process.env.NODE_ENV === "development") {
                console.warn("OAuth: Usando modo simulación (NEXT_PUBLIC_SIMULATE_OAUTH=true)");
                const simUrl = new URL("/onboarding", appUrl);
                simUrl.searchParams.set("token", "SIMULATED_CODEX_TOKEN");
                return NextResponse.redirect(simUrl.toString());
            }

            if (!clientId || !authBaseUrl || clientId === "TU_CLIENT_ID_ACA") {
                return NextResponse.json({
                    error: "Credenciales de OpenAI no configuradas",
                    details: "Para hacer el login real, necesitás registrar tu App en OpenAI y poner el CLIENT_ID real en tu .env.local. Actualmente tenés puesto 'TU_CLIENT_ID_ACA'."
                }, { status: 400 });
            }

            const redirectUri = `${appUrl}/api/auth/chatgpt/callback`;
            const scope = "openid profile email chat:write chat:read";
            const state = crypto.randomUUID?.() || Math.random().toString(36).substring(7);

            const url = new URL(authBaseUrl);
            url.searchParams.set("response_type", "code");
            url.searchParams.set("client_id", clientId);
            url.searchParams.set("redirect_uri", redirectUri);
            url.searchParams.set("scope", scope);
            url.searchParams.set("state", state);

            return NextResponse.redirect(url.toString());
        } catch (error: unknown) {
            console.error("Login redirect error:", error);
            const message = error instanceof Error ? error.message : "Unknown error";
            return NextResponse.json({ error: "Error de redirección", details: message }, { status: 500 });
        }
    }

    if (route === "callback") {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");

        if (!code) {
            return NextResponse.json({ error: "No se recibió el código de autorización" }, { status: 400 });
        }

        try {
            const tokenUrl = process.env.CHATGPT_TOKEN_URL;
            if (!tokenUrl) {
                throw new Error("CHATGPT_TOKEN_URL no está configurada.");
            }

            const response = await fetch(tokenUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code,
                    client_id: process.env.CHATGPT_CLIENT_ID || "",
                    client_secret: process.env.CHATGPT_CLIENT_SECRET || "",
                    redirect_uri: `${appUrl}/api/auth/chatgpt/callback`,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error_description || data.error || "Fallo en el intercambio de tokens");
            }

            const redirectUrl = new URL("/onboarding", appUrl);
            redirectUrl.searchParams.set("token", data.access_token);

            return NextResponse.redirect(redirectUrl.toString());
        } catch (error: unknown) {
            console.error("Callback error:", error);
            const message = error instanceof Error ? error.message : "Unknown error";
            return NextResponse.json({ error: "Error en el callback de autenticación", details: message }, { status: 500 });
        }
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
}
