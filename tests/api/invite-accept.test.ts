import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as accept } from "@/app/api/invites/accept/route";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/session-tokens";
import { API_URL, fetchCall, jsonResponse, mockFetch, tokens } from "../helpers";

const body = { token: "invite-token", email: "novo@farol.test", password: "segredo" };

const moderator = {
    id: "u2",
    name: "Novo",
    email: "novo@farol.test",
    role: "moderator",
    permissions: ["panel:access"],
};

function acceptRequest(payload: unknown) {
    return new NextRequest("https://painel.test/api/invites/accept", {
        method: "POST",
        headers: { "x-forwarded-for": "4.4.4.4" },
        body: typeof payload === "string" ? payload : JSON.stringify(payload),
    });
}

const loginOk = () => jsonResponse({ data: { user: { ...moderator, role: "user" }, tokens } });

beforeEach(() => {
    vi.stubEnv("CRASHMAP_API_URL", API_URL);
});

describe("POST /api/invites/accept", () => {
    it("entra, aceita o convite com o access token e só então grava os cookies", async () => {
        const fetchMock = mockFetch(loginOk(), jsonResponse({ data: moderator }));

        const response = await accept(acceptRequest(body));

        expect(response.status).toBe(200);
        expect((await response.json()).data.user.role).toBe("moderator");
        expect(response.cookies.get(ACCESS_COOKIE)?.value).toBe("new-access");
        expect(response.cookies.get(REFRESH_COOKIE)?.value).toBe("new-refresh");

        const loginCall = fetchCall(fetchMock, 0);
        expect(loginCall.url).toBe(`${API_URL}/auth/login`);
        expect(loginCall.body).toEqual({ email: body.email, password: body.password });

        const acceptCall = fetchCall(fetchMock, 1);
        expect(acceptCall.url).toBe(`${API_URL}/moderator-invites/accept`);
        expect(acceptCall.headers.Authorization).toBe("Bearer new-access");
        expect(acceptCall.headers["X-Forwarded-For"]).toBe("4.4.4.4");
        expect(acceptCall.body).toEqual({ token: "invite-token" });
    });

    it.each([
        ["corpo que não é JSON", "{", "INVALID_BODY"],
        ["sem token", { ...body, token: "" }, "INVITE_INVALID"],
        ["token que não é texto", { ...body, token: 123 }, "INVITE_INVALID"],
        ["sem senha", { ...body, password: "" }, "INVALID_CREDENTIALS"],
    ])("recusa %s sem chamar a API", async (_, payload, code) => {
        const fetchMock = mockFetch();

        const response = await accept(acceptRequest(payload));

        expect(response.status).toBe(400);
        expect((await response.json()).error.code).toBe(code);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("traduz a falha de login e não tenta aceitar", async () => {
        const fetchMock = mockFetch(
            jsonResponse({ error: { code: "AUTH_INVALID_CREDENTIALS", message: "Invalid" } }, 401),
        );

        const response = await accept(acceptRequest(body));

        expect(response.status).toBe(401);
        expect((await response.json()).error.message).toBe("E-mail ou senha incorretos.");
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("revoga a sessão recém-criada e não grava cookies quando o aceite falha", async () => {
        const fetchMock = mockFetch(
            loginOk(),
            jsonResponse({ error: { code: "INVITE_EMAIL_MISMATCH", message: "mismatch" } }, 403),
            jsonResponse({}),
        );

        const response = await accept(acceptRequest(body));

        expect(response.status).toBe(403);
        const { error } = await response.json();
        expect(error.code).toBe("INVITE_EMAIL_MISMATCH");
        expect(error.message).toContain("outro e-mail");
        expect(response.cookies.get(ACCESS_COOKIE)).toBeUndefined();

        const revoke = fetchCall(fetchMock, 2);
        expect(revoke.url).toBe(`${API_URL}/auth/logout`);
        expect(revoke.body).toEqual({ refreshToken: "new-refresh" });
    });

    it("usa a mensagem da API para códigos sem tradução", async () => {
        mockFetch(
            loginOk(),
            jsonResponse({ error: { code: "RATE_LIMITED", message: "Muitas tentativas." } }, 429),
            jsonResponse({}),
        );

        const response = await accept(acceptRequest(body));

        expect(response.status).toBe(429);
        expect((await response.json()).error.message).toBe("Muitas tentativas.");
    });

    it("responde 502 quando a API devolve 200 sem data, mesmo se a revogação falhar", async () => {
        mockFetch(loginOk(), jsonResponse({}), new TypeError("fetch failed"));

        const response = await accept(acceptRequest(body));

        expect(response.status).toBe(502);
        expect((await response.json()).error.code).toBe("INVITE_INVALID");
        expect(response.cookies.get(ACCESS_COOKIE)).toBeUndefined();
    });

    it("responde 503 sem configuração e 502 com a API fora do ar", async () => {
        mockFetch(new TypeError("fetch failed"));
        expect((await accept(acceptRequest(body))).status).toBe(502);

        vi.stubEnv("CRASHMAP_API_URL", "");
        expect((await accept(acceptRequest(body))).status).toBe(503);
    });
});
