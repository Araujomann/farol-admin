import { vi } from "vitest";

export const API_URL = "http://api.test";

/** JWT sem assinatura válida, só com o `exp` (segundos a partir de agora). */
export function jwt(expiresInSeconds: number) {
    const encode = (value: object) =>
        Buffer.from(JSON.stringify(value)).toString("base64url");
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: "u1", exp })}.signature`;
}

export function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
    });
}

/**
 * Substitui o `fetch` global. Cada item responde a uma chamada, na ordem; um
 * `Error` é lançado em vez de respondido.
 */
export function mockFetch(...responses: Array<Response | Error>) {
    const fetchMock = vi.fn(async () => {
        const next = responses.shift();
        if (!next) throw new Error("fetch chamado mais vezes que o esperado");
        if (next instanceof Error) throw next;
        return next;
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

/** URL e corpo (já convertido de JSON) da chamada `index` ao `fetch`. */
export function fetchCall(fetchMock: ReturnType<typeof mockFetch>, index = 0) {
    const [url, init] = fetchMock.mock.calls[index] as unknown as [string, RequestInit];
    return {
        url,
        init,
        headers: (init.headers ?? {}) as Record<string, string>,
        body: init.body ? JSON.parse(init.body as string) : undefined,
    };
}

export const tokens = { accessToken: "new-access", refreshToken: "new-refresh" };
