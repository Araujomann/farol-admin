import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    clearAdminCookies,
    proxyAdminRequest,
    requestBackend,
    setAdminCookies,
} from "@/lib/backend";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/session-tokens";
import { API_URL, fetchCall, jsonResponse, mockFetch, tokens } from "../helpers";
import { cookieStore, requestState } from "../next-headers-mock";

vi.mock("next/headers", async () => (await import("../next-headers-mock")).nextHeadersMock);

beforeEach(() => {
    vi.stubEnv("CRASHMAP_API_URL", API_URL);
    requestState.reset();
    vi.clearAllMocks();
});

describe("requestBackend", () => {
    it("manda o token, o IP do navegador e o corpo", async () => {
        requestState.headers = new Headers({ "x-forwarded-for": "1.1.1.1, 8.8.8.8" });
        const fetchMock = mockFetch(jsonResponse({}));

        await requestBackend("/admin/settings", "PATCH", "tok", JSON.stringify({ a: 1 }));

        const call = fetchCall(fetchMock);
        expect(call.url).toBe(`${API_URL}/admin/settings`);
        expect(call.init.method).toBe("PATCH");
        expect(call.headers).toEqual({
            Authorization: "Bearer tok",
            "Content-Type": "application/json",
            "X-Forwarded-For": "8.8.8.8",
        });
        expect(call.body).toEqual({ a: 1 });
    });

    it("não manda Content-Type nem corpo em GET", async () => {
        const fetchMock = mockFetch(jsonResponse({}));
        await requestBackend("/auth/me", "GET", "tok");

        expect(fetchCall(fetchMock).headers).toEqual({ Authorization: "Bearer tok" });
        expect(fetchCall(fetchMock).init.body).toBeUndefined();
    });
});

describe("proxyAdminRequest", () => {
    it("repassa status, corpo e content-type da API", async () => {
        requestState.cookies.set(ACCESS_COOKIE, "access");
        mockFetch(jsonResponse({ data: [1, 2] }, 200));

        const response = await proxyAdminRequest("/admin/users", "GET");

        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toBe("application/json");
        await expect(response.json()).resolves.toEqual({ data: [1, 2] });
    });

    it("responde 401 sem chamar a API quando não há tokens", async () => {
        const fetchMock = mockFetch();

        const response = await proxyAdminRequest("/admin/users", "GET");

        expect(response.status).toBe(401);
        expect((await response.json()).error.code).toBe("AUTH_REQUIRED");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("renova a sessão quando falta o access token", async () => {
        requestState.cookies.set(REFRESH_COOKIE, "refresh");
        const fetchMock = mockFetch(
            jsonResponse({ data: { tokens } }),
            jsonResponse({ data: "ok" }),
        );

        const response = await proxyAdminRequest("/admin/users", "GET");

        expect(response.status).toBe(200);
        expect(fetchCall(fetchMock, 0).url).toBe(`${API_URL}/auth/refresh`);
        expect(fetchCall(fetchMock, 1).headers.Authorization).toBe("Bearer new-access");
        expect(requestState.cookies.get(ACCESS_COOKIE)).toBe("new-access");
        expect(requestState.cookies.get(REFRESH_COOKIE)).toBe("new-refresh");
    });

    it("renova e repete a chamada uma vez quando a API responde 401", async () => {
        requestState.cookies.set(ACCESS_COOKIE, "expired");
        requestState.cookies.set(REFRESH_COOKIE, "refresh");
        const fetchMock = mockFetch(
            jsonResponse({}, 401),
            jsonResponse({ data: { tokens } }),
            jsonResponse({ data: "ok" }),
        );

        const response = await proxyAdminRequest(
            "/admin/settings",
            "PATCH",
            JSON.stringify({ x: 1 }),
        );

        expect(response.status).toBe(200);
        expect(fetchMock).toHaveBeenCalledTimes(3);
        const retry = fetchCall(fetchMock, 2);
        expect(retry.headers.Authorization).toBe("Bearer new-access");
        expect(retry.body).toEqual({ x: 1 });
    });

    it("apaga os cookies e responde 401 quando a renovação é recusada", async () => {
        requestState.cookies.set(ACCESS_COOKIE, "expired");
        requestState.cookies.set(REFRESH_COOKIE, "revoked");
        mockFetch(jsonResponse({}, 401), jsonResponse({}, 401));

        const response = await proxyAdminRequest("/admin/users", "GET");

        expect(response.status).toBe(401);
        expect(cookieStore.delete).toHaveBeenCalledWith(ACCESS_COOKIE);
        expect(cookieStore.delete).toHaveBeenCalledWith(REFRESH_COOKIE);
        expect(requestState.cookies.size).toBe(0);
    });

    it("não repete quando a API responde 403", async () => {
        requestState.cookies.set(ACCESS_COOKIE, "access");
        requestState.cookies.set(REFRESH_COOKIE, "refresh");
        const fetchMock = mockFetch(
            jsonResponse({ error: { code: "AUTH_FORBIDDEN" } }, 403),
        );

        const response = await proxyAdminRequest("/admin/users", "GET");

        expect(response.status).toBe(403);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("responde 503 sem CRASHMAP_API_URL e 502 com a API fora do ar", async () => {
        requestState.cookies.set(ACCESS_COOKIE, "access");

        vi.stubEnv("CRASHMAP_API_URL", "");
        const notConfigured = await proxyAdminRequest("/admin/users", "GET");
        expect(notConfigured.status).toBe(503);
        expect((await notConfigured.json()).error.code).toBe("API_NOT_CONFIGURED");

        vi.stubEnv("CRASHMAP_API_URL", API_URL);
        mockFetch(new TypeError("fetch failed"));
        const unavailable = await proxyAdminRequest("/admin/users", "GET");
        expect(unavailable.status).toBe(502);
        expect((await unavailable.json()).error.code).toBe("API_UNAVAILABLE");
    });

    it("propaga erros inesperados", async () => {
        requestState.cookies.set(ACCESS_COOKIE, "access");
        mockFetch(new RangeError("bug"));
        await expect(proxyAdminRequest("/admin/users", "GET")).rejects.toThrow(RangeError);
    });
});

describe("cookies de sessão", () => {
    it("setAdminCookies grava os dois tokens como httpOnly", () => {
        const response = setAdminCookies(NextResponse.json({}), tokens);

        const access = response.cookies.get(ACCESS_COOKIE);
        expect(access?.value).toBe("new-access");
        expect(access?.httpOnly).toBe(true);
        expect(access?.maxAge).toBe(3600);
        expect(response.cookies.get(REFRESH_COOKIE)?.maxAge).toBe(60 * 60 * 24 * 30);
    });

    it("clearAdminCookies esvazia e expira os dois", () => {
        const response = clearAdminCookies(NextResponse.json({}));

        for (const name of [ACCESS_COOKIE, REFRESH_COOKIE]) {
            expect(response.cookies.get(name)?.value).toBe("");
            expect(response.cookies.get(name)?.maxAge).toBe(0);
        }
    });
});
