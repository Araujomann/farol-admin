import { NextRequest, NextResponse } from "next/server";
import {
    ApiConfigurationError,
    apiBaseUrl,
    setAdminCookies,
} from "@/lib/backend";
import type { SessionUser } from "@/lib/permissions";
import { clientIpFrom, forwardedForHeader } from "@/lib/session-tokens";

type ApiErrorBody = { error?: { code?: string; message?: string } };

interface LoginResult {
    data: {
        user: SessionUser;
        tokens: { accessToken: string; refreshToken: string };
    };
}

function errorResponse(status: number, code: string, message: string) {
    return NextResponse.json({ error: { code, message } }, { status });
}

// Mensagens em português para os códigos que a API devolve no aceite.
const ACCEPT_MESSAGES: Record<string, string> = {
    INVITE_INVALID:
        "Este convite é inválido, expirou ou já foi usado. Peça um novo convite a um administrador.",
    // Código colado incompleto (a API recusa pelo formato).
    VALIDATION_ERROR:
        "Código de convite incompleto. Copie o código inteiro do e-mail e tente de novo.",
    INVITE_EMAIL_MISMATCH:
        "Este convite foi enviado para outro e-mail. Entre com a conta do e-mail convidado.",
    AUTH_EMAIL_NOT_VERIFIED:
        "Verifique o seu e-mail no aplicativo Farol antes de aceitar o convite.",
    AUTH_INVALID_CREDENTIALS: "E-mail ou senha incorretos.",
};

async function revokeSession(refreshToken: string) {
    await fetch(`${apiBaseUrl()}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
    }).catch(() => undefined);
}

/**
 * Aceite do convite de moderador. O convidado ainda é `user`, então o login
 * normal do painel o recusaria: aqui o BFF faz o login na API, aceita o convite
 * com o access token e só então grava os cookies de sessão. Se o aceite falhar,
 * o refresh token recém-criado é revogado e nenhum cookie é gravado.
 */
export async function POST(request: NextRequest) {
    let body: { token?: unknown; email?: unknown; password?: unknown };
    try {
        body = await request.json();
    } catch {
        return errorResponse(400, "INVALID_BODY", "Dados inválidos.");
    }

    const { token, email, password } = body;
    if (typeof token !== "string" || !token) {
        return errorResponse(400, "INVITE_INVALID", ACCEPT_MESSAGES.INVITE_INVALID);
    }
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
        return errorResponse(400, "INVALID_CREDENTIALS", "Informe e-mail e senha.");
    }

    const ipHeader = forwardedForHeader(clientIpFrom(request.headers));

    try {
        const loginResponse = await fetch(`${apiBaseUrl()}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...ipHeader },
            body: JSON.stringify({ email, password }),
            cache: "no-store",
        });
        const login = (await loginResponse.json().catch(() => ({}))) as
            | LoginResult
            | ApiErrorBody;

        if (!loginResponse.ok || !("data" in login)) {
            const loginError = "error" in login ? login.error : undefined;
            const code = loginError?.code || "LOGIN_FAILED";
            return errorResponse(
                loginResponse.ok ? 502 : loginResponse.status,
                code,
                ACCEPT_MESSAGES[code] ??
                    loginError?.message ??
                    "Não foi possível entrar com essa conta.",
            );
        }

        const { tokens } = login.data;
        const acceptResponse = await fetch(`${apiBaseUrl()}/moderator-invites/accept`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
                "Content-Type": "application/json",
                ...ipHeader,
            },
            body: JSON.stringify({ token }),
            cache: "no-store",
        });
        const accepted = (await acceptResponse.json().catch(() => ({}))) as
            | { data: SessionUser }
            | ApiErrorBody;

        if (!acceptResponse.ok || !("data" in accepted)) {
            await revokeSession(tokens.refreshToken);
            const apiError = "error" in accepted ? accepted.error : undefined;
            const code = apiError?.code || "INVITE_INVALID";
            return errorResponse(
                acceptResponse.ok ? 502 : acceptResponse.status,
                code,
                ACCEPT_MESSAGES[code] ??
                    apiError?.message ??
                    "Não foi possível aceitar o convite.",
            );
        }

        const user = accepted.data;
        const response = NextResponse.json({
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    permissions: user.permissions,
                },
            },
        });
        return setAdminCookies(response, tokens);
    } catch (error) {
        if (error instanceof ApiConfigurationError) {
            return errorResponse(
                503,
                "API_NOT_CONFIGURED",
                "O painel ainda não está conectado à Crash Map API.",
            );
        }
        if (error instanceof TypeError) {
            return errorResponse(
                502,
                "API_UNAVAILABLE",
                "Não foi possível conectar à Crash Map API. Tente novamente.",
            );
        }
        throw error;
    }
}
