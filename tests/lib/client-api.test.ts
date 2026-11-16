import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminFetch } from "@/lib/client-api";
import { fetchCall, jsonResponse, mockFetch } from "../helpers";

let events: string[];

beforeEach(() => {
    events = [];
    vi.stubGlobal("window", {
        dispatchEvent: (event: Event) => events.push(event.type),
    });
});

describe("adminFetch", () => {
    it("devolve o JSON e só manda Content-Type quando há corpo", async () => {
        const fetchMock = mockFetch(jsonResponse({ data: 1 }), jsonResponse({ data: 2 }));

        await expect(adminFetch("/api/admin/settings")).resolves.toEqual({ data: 1 });
        await adminFetch("/api/admin/settings", { method: "PATCH", body: "{}" });

        expect(fetchCall(fetchMock, 0).headers).toEqual({});
        expect(fetchCall(fetchMock, 0).init.cache).toBe("no-store");
        expect(fetchCall(fetchMock, 1).headers["Content-Type"]).toBe("application/json");
    });

    it("lança a mensagem da API e avisa a sessão em 401", async () => {
        mockFetch(jsonResponse({ error: { code: "AUTH_REQUIRED", message: "Sessão expirou." } }, 401));

        await expect(adminFetch("/api/admin/users")).rejects.toThrow("Sessão expirou.");
        expect(events).toEqual(["farol:unauthorized"]);
    });

    it("avisa sobre permissão só em 403 com código AUTH_", async () => {
        mockFetch(
            jsonResponse({ error: { code: "AUTH_FORBIDDEN", message: "Sem permissão." } }, 403),
            jsonResponse({ error: { code: "REPORT_LOCKED", message: "Bloqueado." } }, 403),
        );

        await expect(adminFetch("/a")).rejects.toThrow("Sem permissão.");
        await expect(adminFetch("/b")).rejects.toThrow("Bloqueado.");
        expect(events).toEqual(["farol:forbidden"]);
    });

    it("usa mensagem genérica quando o erro não é JSON", async () => {
        mockFetch(new Response("<html>", { status: 500 }));
        await expect(adminFetch("/a")).rejects.toThrow(
            "Não foi possível concluir a solicitação (500).",
        );
    });
});
