import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ACCESS_COOKIE = "farol_admin_access";
const REFRESH_COOKIE = "farol_admin_refresh";

export class ApiConfigurationError extends Error {
    constructor() {
        super("CRASHMAP_API_URL não está configurada.");
        this.name = "ApiConfigurationError";
    }
}

function apiBaseUrl() {
    const value = process.env.CRASHMAP_API_URL;
    if (!value) {
        throw new ApiConfigurationError();
    }

    return value.replace(/\/+$/, "");
}

function cookieOptions(maxAge: number) {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge,
    };
}

async function refreshAccessToken(store: Awaited<ReturnType<typeof cookies>>) {
    const refreshToken = store.get(REFRESH_COOKIE)?.value;
    if (!refreshToken) return null;

    const response = await fetch(`${apiBaseUrl()}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
    });

    if (!response.ok) {
        store.delete(ACCESS_COOKIE);
        store.delete(REFRESH_COOKIE);
        return null;
    }

    const result = (await response.json()) as {
        data: { tokens: { accessToken: string; refreshToken: string } };
    };
    store.set(ACCESS_COOKIE, result.data.tokens.accessToken, cookieOptions(3600));
    store.set(
        REFRESH_COOKIE,
        result.data.tokens.refreshToken,
        cookieOptions(60 * 60 * 24 * 30),
    );

    return result.data.tokens.accessToken;
}

async function requestBackend(
    path: string,
    method: string,
    token: string,
    body?: string,
) {
    return fetch(`${apiBaseUrl()}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(body ? { "Content-Type": "application/json" } : {}),
        },
        ...(body ? { body } : {}),
        cache: "no-store",
    });
}

function apiUnavailable() {
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

export async function proxyAdminRequest(
    path: string,
    method: "GET" | "POST" | "PATCH",
    body?: string,
) {
    const store = await cookies();

    try {
        let token = store.get(ACCESS_COOKIE)?.value;
        if (!token) token = (await refreshAccessToken(store)) ?? undefined;
        if (!token) {
            return NextResponse.json(
                {
                    error: {
                        code: "AUTH_REQUIRED",
                        message: "Sua sessão expirou. Entre novamente.",
                    },
                },
                { status: 401 },
            );
        }

        let response = await requestBackend(path, method, token, body);
        if (response.status === 401) {
            token = (await refreshAccessToken(store)) ?? undefined;
            if (!token) {
                return NextResponse.json(
                    {
                        error: {
                            code: "AUTH_REQUIRED",
                            message: "Sua sessão expirou. Entre novamente.",
                        },
                    },
                    { status: 401 },
                );
            }
            response = await requestBackend(path, method, token, body);
        }

        const headers = new Headers();
        const contentType = response.headers.get("content-type");
        if (contentType) headers.set("content-type", contentType);
        return new NextResponse(await response.text(), {
            status: response.status,
            headers,
        });
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
        if (error instanceof TypeError) return apiUnavailable();
        throw error;
    }
}

export function clearAdminCookies(response: NextResponse) {
    response.cookies.set(ACCESS_COOKIE, "", cookieOptions(0));
    response.cookies.set(REFRESH_COOKIE, "", cookieOptions(0));
    return response;
}

export function setAdminCookies(
    response: NextResponse,
    tokens: { accessToken: string; refreshToken: string },
) {
    response.cookies.set(
        ACCESS_COOKIE,
        tokens.accessToken,
        cookieOptions(3600),
    );
    response.cookies.set(
        REFRESH_COOKIE,
        tokens.refreshToken,
        cookieOptions(60 * 60 * 24 * 30),
    );
    return response;
}

export { apiBaseUrl };
