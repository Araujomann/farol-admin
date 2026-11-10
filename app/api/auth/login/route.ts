import { NextRequest, NextResponse } from "next/server";
import {
    ApiConfigurationError,
    apiBaseUrl,
    setAdminCookies,
} from "@/lib/backend";

interface LoginResult {
    data: {
        user: {
            id: string;
            name: string;
            email: string;
            role: "user" | "moderator" | "admin";
            is_email_verified: boolean;
        };
        tokens: { accessToken: string; refreshToken: string };
    };
}

export async function POST(request: NextRequest) {
    let credentials: { email?: string; password?: string };
    try {
        credentials = await request.json();
    } catch {
        return NextResponse.json(
            { error: { code: "INVALID_BODY", message: "Dados de acesso inválidos." } },
            { status: 400 },
        );
    }

    if (!credentials.email || !credentials.password) {
        return NextResponse.json(
            {
                error: {
                    code: "INVALID_CREDENTIALS",
                    message: "Informe e-mail e senha.",
                },
            },
            { status: 400 },
        );
    }

    try {
        const backendResponse = await fetch(`${apiBaseUrl()}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
            cache: "no-store",
        });
        const result = (await backendResponse.json()) as
            | LoginResult
            | { error?: { code?: string; message?: string } };

        if (!backendResponse.ok) {
            return NextResponse.json(result, { status: backendResponse.status });
        }

        if (!("data" in result)) {
            return NextResponse.json(
                { error: { code: "INVALID_API_RESPONSE", message: "Resposta inesperada da API." } },
                { status: 502 },
            );
        }

        const { user, tokens } = result.data;
        if (
            (user.role !== "moderator" && user.role !== "admin") ||
            !user.is_email_verified
        ) {
            return NextResponse.json(
                {
                    error: {
                        code: "ADMIN_ACCESS_REQUIRED",
                        message:
                            "Acesso permitido somente a moderadores ou administradores com e-mail verificado.",
                    },
                },
                { status: 403 },
            );
        }

        const response = NextResponse.json({ data: { user } });
        return setAdminCookies(response, tokens);
    } catch (error) {
        if (error instanceof ApiConfigurationError) {
            return NextResponse.json(
                {
                    error: {
                        code: "API_NOT_CONFIGURED",
                        message:
                            "O painel ainda não está conectado à Crash Map API. Configure CRASHMAP_API_URL.",
                    },
                },
                { status: 503 },
            );
        }
        if (error instanceof TypeError) {
            return NextResponse.json(
                {
                    error: {
                        code: "API_UNAVAILABLE",
                        message:
                            "Não foi possível conectar à Crash Map API. Verifique a configuração e tente novamente.",
                    },
                },
                { status: 502 },
            );
        }
        throw error;
    }
}
