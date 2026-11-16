import { unstable_doesMiddlewareMatch, getRedirectUrl } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { config, proxy } from "@/proxy";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/session-tokens";
import { API_URL, fetchCall, jsonResponse, jwt, mockFetch, tokens } from "./helpers";

function request(path: string, cookies: Record<string, string> = {}, headers: Record<string, string> = {}) {
    const cookie = Object.entries(cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");
    return new NextRequest(`https://painel.test${path}`, {
        headers: { ...headers, ...(cookie ? { cookie } : {}) },
    });
}

/** `NextResponse.next()`: a página segue sem redirecionar. */
function continues(response: Response) {
    return response.headers.get("x-middleware-next") === "1";
}

beforeEach(() => {
    vi.stubEnv("CRASHMAP_API_URL", API_URL);
});

describe("proxy", () => {
    it("deixa passar com access token válido, sem chamar a API", async () => {
        const fetchMock = mockFetch();

        const response = await proxy(request("/reports", { [ACCESS_COOKIE]: jwt(600) }));

        expect(continues(response)).toBe(true);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("manda para o login guardando a página pedida", async () => {
        const response = await proxy(request("/reports?status=PENDING"));

        expect(getRedirectUrl(response)).toBe(
            "https://painel.test/login?next=%2Freports%3Fstatus%3DPENDING",
        );
        expect(response.cookies.get(ACCESS_COOKIE)?.maxAge).toBe(0);
        expect(response.cookies.get(REFRESH_COOKIE)?.maxAge).toBe(0);
    });

    it("não acrescenta next quando a página pedida é a inicial", async () => {
        const response = await proxy(request("/"));
        expect(getRedirectUrl(response)).toBe("https://painel.test/login");
    });

    it("renova o token vencido e grava os cookies na requisição e no navegador", async () => {
        const fetchMock = mockFetch(jsonResponse({ data: { tokens } }));

        const response = await proxy(
            request(
                "/users",
                { [ACCESS_COOKIE]: jwt(-60), [REFRESH_COOKIE]: "old-refresh" },
                { "x-forwarded-for": "7.7.7.7" },
            ),
        );

        expect(continues(response)).toBe(true);
        const call = fetchCall(fetchMock);
        expect(call.body).toEqual({ refreshToken: "old-refresh" });
        expect(call.headers["X-Forwarded-For"]).toBe("7.7.7.7");

        // Navegador: cookies novos, httpOnly e com validade.
        expect(response.cookies.get(ACCESS_COOKIE)).toMatchObject({
            value: "new-access",
            httpOnly: true,
            maxAge: 3600,
        });
        expect(response.cookies.get(REFRESH_COOKIE)?.value).toBe("new-refresh");

        // Renderização atual: o Next recebe o cookie novo no cabeçalho da requisição.
        expect(response.headers.get("x-middleware-request-cookie")).toContain(
            `${ACCESS_COOKIE}=new-access`,
        );
    });

    it("manda para o login quando a API recusa o refresh token", async () => {
        mockFetch(jsonResponse({}, 401));

        const response = await proxy(request("/users", { [REFRESH_COOKIE]: "revoked" }));

        expect(getRedirectUrl(response)).toBe("https://painel.test/login?next=%2Fusers");
    });

    it("não derruba a sessão quando a API está fora do ar", async () => {
        mockFetch(new TypeError("fetch failed"));

        const response = await proxy(request("/users", { [REFRESH_COOKIE]: "refresh" }));

        expect(continues(response)).toBe(true);
        expect(response.cookies.get(REFRESH_COOKIE)).toBeUndefined();
    });
});

describe("matcher do proxy", () => {
    const matches = (url: string) => unstable_doesMiddlewareMatch({ config, url });

    it.each(["/", "/reports", "/reports/abc", "/team", "/settings"])("roda em %s", (url) => {
        expect(matches(url)).toBe(true);
    });

    it.each([
        "/login",
        "/invite",
        "/invite/abc",
        "/sem-permissao",
        "/api/admin/users",
        "/api/auth/login",
        "/_next/static/chunk.js",
        "/favicon.ico",
        "/icon.png",
    ])("não roda em %s", (url) => {
        expect(matches(url)).toBe(false);
    });
});
