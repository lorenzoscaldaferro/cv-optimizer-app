import { NextResponse } from "next/server";

export async function GET() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return NextResponse.json({
        resource: appUrl,
        authorization_servers: [
            appUrl // In this Apps SDK model, our app acts as the Auth server for its resources
        ],
        scopes_supported: ["chat:write", "chat:read"]
    });
}
