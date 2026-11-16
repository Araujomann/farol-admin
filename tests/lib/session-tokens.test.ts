import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    ApiConfigurationError,
    apiBaseUrl,
    clientIpFrom,
    cookieOptions,
    exchangeRefreshToken,
    forwardedForHeader,
    isAccessTokenFresh,
} from "@/lib/session-tokens";
import { API_URL, fetchCall, jsonResponse, jwt, mockFetch, tokens } from "../helpers";

beforeEach(() => {
    vi.stubEnv("CRASHMAP_API_URL", API_URL);
});

describe("apiBaseUrl", () => {
    it("remove barras do final", () => {
        vi.stubEnv("CRASHMAP_API_URL", "http://api.test///");
        expect(apiBaseUrl()).toBe("http://api.test");
    });

    it("falha com ApiConfigurationError sem a variável", () => {
        vi.stubEnv("CRASHMAP_API_URL", "");
        expect(() => apiBaseUrl()).toThrow(ApiConfigurationError);
    });
});

describe("cookieOptions", () => {
    it("só marca secure em produção", () => {
        vi.stubEnv("NODE_ENV", "development");
        expect(cookieOptions(10)).toEqual({
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            maxAge: 10,
        });

        vi.stubEnv("NODE_ENV", "production");
        expect(cookieOptions(10).secure).toBe(true);
    });
});

describe("clientIpFrom", () => {
    it("usa o último item de X-Forwarded-For, que o cliente não controla", () => {
        const headers = new Headers({ "x-forwarded-for": "6.6.6.6, 10.0.0.1 , 203.0.113.9" });
        expect(clientIpFrom(headers)).toBe("203.0.113.9");
    });

    it("ignora itens vazios", () => {
        expect(clientIpFrom(new Headers({ "x-forwarded-for": "1.1.1.1, " }))).toBe("1.1.1.1");
    });

    it("cai para X-Real-IP e depois para null", () => {
        expect(clientIpFrom(new Headers({ "x-real-ip": " 2.2.2.2 " }))).toBe("2.2.2.2");
        expect(clientIpFrom(new Headers())).toBeNull();
    });
});

describe("forwardedForHeader", () => {
    it("só gera o cabeçalho quando há IP", () => {
        expect(forwardedForHeader("1.2.3.4")).toEqual({ "X-Forwarded-For": "1.2.3.4" });
        expect(forwardedForHeader(null)).toEqual({});
    });
});

describe("isAccessTokenFresh", () => {
    it("aceita token que vence depois da margem", () => {
        expect(isAccessTokenFresh(jwt(120))).toBe(true);
    });

    it("recusa token vencido ou dentro da margem de 30s", () => {
        expect(isAccessTokenFresh(jwt(-10))).toBe(false);
        expect(isAccessTokenFresh(jwt(20))).toBe(false);
        expect(isAccessTokenFresh(jwt(20), 5)).toBe(true);
    });

    it("recusa token ausente ou malformado", () => {
        expect(isAccessTokenFresh(undefined)).toBe(false);
        expect(isAccessTokenFresh("")).toBe(false);
        expect(isAccessTokenFresh("sem-pontos")).toBe(false);
        expect(isAccessTokenFresh("a.não-é-base64.c")).toBe(false);
    });

    it("recusa payload sem exp numérico", () => {
        const payload = Buffer.from(JSON.stringify({ exp: "amanhã" })).toString("base64url");
        expect(isAccessTokenFresh(`h.${payload}.s`)).toBe(false);
    });
});

describe("exchangeRefreshToken", () => {
    it("envia o refresh token e o IP e devolve o novo par", async () => {
        const fetchMock = mockFetch(jsonResponse({ data: { tokens } }));

        await expect(exchangeRefreshToken("old-refresh", "9.9.9.9")).resolves.toEqual(tokens);

        const call = fetchCall(fetchMock);
        expect(call.url).toBe(`${API_URL}/auth/refresh`);
        expect(call.init.method).toBe("POST");
        expect(call.body).toEqual({ refreshToken: "old-refresh" });
        expect(call.headers["X-Forwarded-For"]).toBe("9.9.9.9");
    });

    it("devolve null quando a API recusa", async () => {
        mockFetch(jsonResponse({ error: { code: "AUTH_INVALID" } }, 401));
        await expect(exchangeRefreshToken("old-refresh")).resolves.toBeNull();
    });

    it("propaga falha de rede", async () => {
        mockFetch(new TypeError("fetch failed"));
        await expect(exchangeRefreshToken("old-refresh")).rejects.toThrow(TypeError);
    });
});
