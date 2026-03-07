import { NextResponse } from "next/server";

export async function GET() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return NextResponse.json({
        issuer: appUrl,
        authorization_endpoint: `${appUrl}/api/auth/chatgpt/login`,
        token_endpoint: `${appUrl}/api/auth/chatgpt/callback`,
        registration_endpoint: `${appUrl}/api/auth/chatgpt/register`,
        code_challenge_methods_supported: ["S256"],
        scopes_supported: ["chat:write", "chat:read", "openid", "profile", "email"]
    });
}
