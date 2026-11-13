import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
    ACCESS_COOKIE,
    ACCESS_COOKIE_MAX_AGE,
    ApiConfigurationError,
    REFRESH_COOKIE,
    REFRESH_COOKIE_MAX_AGE,
    apiBaseUrl,
    cookieOptions,
    exchangeRefreshToken,
    type SessionTokens,
} from "@/lib/session-tokens";

async function refreshAccessToken(store: Awaited<ReturnType<typeof cookies>>) {
    const refreshToken = store.get(REFRESH_COOKIE)?.value;
    if (!refreshToken) return null;

    const tokens = await exchangeRefreshToken(refreshToken);
    if (!tokens) {
        store.delete(ACCESS_COOKIE);
        store.delete(REFRESH_COOKIE);
        return null;
    }

    store.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions(ACCESS_COOKIE_MAX_AGE));
    store.set(
        REFRESH_COOKIE,
        tokens.refreshToken,
        cookieOptions(REFRESH_COOKIE_MAX_AGE),
    );

    return tokens.accessToken;
}

export async function requestBackend(
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

function authRequired() {
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

export async function proxyAdminRequest(
    path: string,
    method: "GET" | "POST" | "PATCH",
    body?: string,
) {
    const store = await cookies();

    try {
        let token = store.get(ACCESS_COOKIE)?.value;
        if (!token) token = (await refreshAccessToken(store)) ?? undefined;
        if (!token) return authRequired();

        let response = await requestBackend(path, method, token, body);
        if (response.status === 401) {
            token = (await refreshAccessToken(store)) ?? undefined;
            if (!token) return authRequired();
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

export function setAdminCookies(response: NextResponse, tokens: SessionTokens) {
    response.cookies.set(
        ACCESS_COOKIE,
        tokens.accessToken,
        cookieOptions(ACCESS_COOKIE_MAX_AGE),
    );
    response.cookies.set(
        REFRESH_COOKIE,
        tokens.refreshToken,
        cookieOptions(REFRESH_COOKIE_MAX_AGE),
    );
    return response;
}

export { ApiConfigurationError, apiBaseUrl };
