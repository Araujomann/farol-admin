import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/session-tokens";
import { API_URL, fetchCall, jsonResponse, mockFetch, tokens } from "../helpers";
import { requestState } from "../next-headers-mock";

vi.mock("next/headers", async () => (await import("../next-headers-mock")).nextHeadersMock);

const staff = {
    id: "u1",
    name: "Ana",
    email: "ana@farol.test",
    role: "moderator",
    permissions: ["panel:access", "reports:read"],
    is_email_verified: true,
};

function loginRequest(body: unknown, headers: Record<string, string> = {}) {
    return new NextRequest("https://painel.test/api/auth/login", {
        method: "POST",
        headers,
        body: typeof body === "string" ? body : JSON.stringify(body),
    });
}

const credentials = { email: "ana@farol.test", password: "segredo" };

beforeEach(() => {
    vi.stubEnv("CRASHMAP_API_URL", API_URL);
    requestState.reset();
});

describe("POST /api/auth/login", () => {
    it("entra, grava os cookies e devolve só os dados públicos do usuário", async () => {
        const fetchMock = mockFetch(jsonResponse({ data: { user: staff, tokens } }));

        const response = await login(loginRequest(credentials, { "x-forwarded-for": "5.5.5.5" }));

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            data: {
                user: {
                    id: "u1",
                    name: "Ana",
                    email: "ana@farol.test",
                    role: "moderator",
                    permissions: ["panel:access", "reports:read"],
                },
            },
        });
        expect(response.cookies.get(ACCESS_COOKIE)?.value).toBe("new-access");
        expect(response.cookies.get(REFRESH_COOKIE)?.value).toBe("new-refresh");

        const call = fetchCall(fetchMock);
        expect(call.url).toBe(`${API_URL}/auth/login`);
        expect(call.body).toEqual(credentials);
        expect(call.headers["X-Forwarded-For"]).toBe("5.5.5.5");
    });

    it("recusa corpo inválido ou incompleto sem chamar a API", async () => {
        const fetchMock = mockFetch();

        expect((await login(loginRequest("{não é json"))).status).toBe(400);
        const missing = await login(loginRequest({ email: "ana@farol.test" }));
        expect(missing.status).toBe(400);
        expect((await missing.json()).error.code).toBe("INVALID_CREDENTIALS");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("repassa o erro da API", async () => {
        mockFetch(jsonResponse({ error: { code: "AUTH_INVALID_CREDENTIALS", message: "x" } }, 401));

        const response = await login(loginRequest(credentials));

        expect(response.status).toBe(401);
        expect((await response.json()).error.code).toBe("AUTH_INVALID_CREDENTIALS");
        expect(response.cookies.get(ACCESS_COOKIE)).toBeUndefined();
    });

    it.each([
        ["sem panel:access", { ...staff, role: "user", permissions: [] }],
        ["com e-mail não verificado", { ...staff, is_email_verified: false }],
    ])("barra conta %s e não grava cookies", async (_, user) => {
        mockFetch(jsonResponse({ data: { user, tokens } }));

        const response = await login(loginRequest(credentials));

        expect(response.status).toBe(403);
        expect((await response.json()).error.code).toBe("ADMIN_ACCESS_REQUIRED");
        expect(response.cookies.get(ACCESS_COOKIE)).toBeUndefined();
    });

    it("responde 502 a resposta sem data, 503 sem configuração e 502 sem API", async () => {
        mockFetch(jsonResponse({}), new TypeError("fetch failed"));
        expect((await login(loginRequest(credentials))).status).toBe(502);
        expect((await login(loginRequest(credentials))).status).toBe(502);

        vi.stubEnv("CRASHMAP_API_URL", "");
        expect((await login(loginRequest(credentials))).status).toBe(503);
    });
});

describe("POST /api/auth/logout", () => {
    it("revoga o refresh token na API e apaga os cookies", async () => {
        requestState.cookies.set(REFRESH_COOKIE, "refresh");
        const fetchMock = mockFetch(jsonResponse({}));

        const response = await logout();

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ data: { loggedOut: true } });
        expect(fetchCall(fetchMock).url).toBe(`${API_URL}/auth/logout`);
        expect(fetchCall(fetchMock).body).toEqual({ refreshToken: "refresh" });
        expect(response.cookies.get(ACCESS_COOKIE)?.maxAge).toBe(0);
        expect(response.cookies.get(REFRESH_COOKIE)?.maxAge).toBe(0);
    });

    it("sem refresh token só apaga os cookies", async () => {
        const fetchMock = mockFetch();

        const response = await logout();

        expect(response.status).toBe(200);
        expect(fetchMock).not.toHaveBeenCalled();
        expect(response.cookies.get(REFRESH_COOKIE)?.maxAge).toBe(0);
    });

    it("apaga os cookies mesmo quando a revogação falha", async () => {
        requestState.cookies.set(REFRESH_COOKIE, "refresh");
        mockFetch(jsonResponse({}, 500), new TypeError("fetch failed"));

        for (let attempt = 0; attempt < 2; attempt++) {
            const response = await logout();
            expect(response.status).toBe(502);
            expect((await response.json()).error.code).toBe("LOGOUT_REVOCATION_FAILED");
            expect(response.cookies.get(ACCESS_COOKIE)?.maxAge).toBe(0);
        }
    });
});
