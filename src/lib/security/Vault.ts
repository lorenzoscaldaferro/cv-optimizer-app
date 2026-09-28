import crypto from "crypto";

/**
 * Secure Vault for encrypting/decrypting API keys using AES-256-GCM.
 * This ensures that even if the database is compromised, the keys remain encrypted
 * without the MASTER_ENCRYPTION_KEY.
 */
export class Vault {
    private static readonly ALGORITHM = "aes-256-gcm";
    private static readonly IV_LENGTH = 12;
    private static readonly AUTH_TAG_LENGTH = 16;

    static isConfigured(): boolean {
        const key = process.env.SECRET_ENCRYPTION_KEY;
        return typeof key === "string" && key.trim().length > 0;
    }

    private static getEncryptionKey(): Buffer {
        const key = process.env.SECRET_ENCRYPTION_KEY;
        if (!key) {
            throw new Error("SECRET_ENCRYPTION_KEY is not defined in environment variables");
        }
        const buf = Buffer.from(key, "base64");
        if (buf.length === 32) return buf;
        return crypto.createHash("sha256").update(key).digest();
    }

    /**
     * Encrypts a plain text string.
     * Output format: iv:authTag:encryptedContent (all Base64)
     */
    static encrypt(text: string): string {
        const iv = crypto.randomBytes(this.IV_LENGTH);
        const key = this.getEncryptionKey();
        const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

        let encrypted = cipher.update(text, "utf8", "base64");
        encrypted += cipher.final("base64");

        const authTag = cipher.getAuthTag().toString("base64");

        return `${iv.toString("base64")}:${authTag}:${encrypted}`;
    }

    /**
     * Decrypts an encrypted string.
     * Input format: iv:authTag:encryptedContent
     */
    static decrypt(encryptedData: string): string {
        const [ivBase64, authTagBase64, encryptedContent] = encryptedData.split(":");

        if (!ivBase64 || !authTagBase64 || !encryptedContent) {
            throw new Error("Invalid encrypted data format");
        }

        const iv = Buffer.from(ivBase64, "base64");
        const authTag = Buffer.from(authTagBase64, "base64");
        const key = this.getEncryptionKey();

        const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedContent, "base64", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    }

    /**
     * Simple format validation for common LLM provider keys
     */
    static isValidKeyFormat(provider: string, key: string): boolean {
        if (!key || key.length < 10) return false;

        if (provider === "openai") {
            return key.startsWith("sk-");
        }

        if (provider === "gemini") {
            return key.startsWith("AIza");
        }

        if (provider === "openrouter") {
            return key.startsWith("sk-or-");
        }

        if (provider === "groq") {
            return key.startsWith("gsk_");
        }

        return true;
    }
}
