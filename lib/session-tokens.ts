// Utilidades de token sem dependência de `next/headers`, para poderem ser
// usadas tanto em Route Handlers quanto em `proxy.ts`.

export const ACCESS_COOKIE = "farol_admin_access";
export const REFRESH_COOKIE = "farol_admin_refresh";
export const ACCESS_COOKIE_MAX_AGE = 3600;
export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export class ApiConfigurationError extends Error {
    constructor() {
        super("CRASHMAP_API_URL não está configurada.");
        this.name = "ApiConfigurationError";
    }
}

export function apiBaseUrl() {
    const value = process.env.CRASHMAP_API_URL;
    if (!value) {
        throw new ApiConfigurationError();
    }

    return value.replace(/\/+$/, "");
}

export function cookieOptions(maxAge: number) {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge,
    };
}

export interface SessionTokens {
    accessToken: string;
    refreshToken: string;
}

/**
 * IP do navegador visto por este servidor. Usa o ÚLTIMO item de
 * X-Forwarded-For: é o que o proxy mais próximo acrescentou (ou o próprio
 * Next, a partir do socket); os primeiros itens podem ter sido enviados pelo
 * cliente. Em produção, o proxy da hospedagem deve acrescentar ou sobrescrever
 * esse cabeçalho.
 */
export function clientIpFrom(headers: Headers): string | null {
    const forwarded = headers.get("x-forwarded-for");
    const last = forwarded?.split(",").map((item) => item.trim()).filter(Boolean).pop();
    return last || headers.get("x-real-ip")?.trim() || null;
}

/** Repassa o IP do navegador para a API (auditoria e limites por IP). */
export function forwardedForHeader(clientIp: string | null): Record<string, string> {
    return clientIp ? { "X-Forwarded-For": clientIp } : {};
}

/** Troca o refresh token por um novo par. Retorna `null` se a API recusar. */
export async function exchangeRefreshToken(
    refreshToken: string,
    clientIp: string | null = null,
): Promise<SessionTokens | null> {
    const response = await fetch(`${apiBaseUrl()}/auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...forwardedForHeader(clientIp),
        },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
    });

    if (!response.ok) return null;

    const result = (await response.json()) as {
        data: { tokens: SessionTokens };
    };
    return result.data.tokens;
}

/**
 * Lê o `exp` do access token sem validar a assinatura. Serve só para decidir
 * se vale a pena renovar antes de chamar a API; quem valida é a API.
 */
export function isAccessTokenFresh(token: string | undefined, skewSeconds = 30) {
    if (!token) return false;

    const payload = token.split(".")[1];
    if (!payload) return false;

    try {
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const { exp } = JSON.parse(atob(base64)) as { exp?: unknown };
        return typeof exp === "number" && exp - skewSeconds > Date.now() / 1000;
    } catch {
        return false;
    }
}
