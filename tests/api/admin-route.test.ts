import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { proxyAdminRequest } from "@/lib/backend";
import { GET, PATCH, POST } from "@/app/api/admin/[...path]/route";

vi.mock("@/lib/backend", () => ({
    proxyAdminRequest: vi.fn(async () => NextResponse.json({ data: "ok" })),
}));

const proxied = vi.mocked(proxyAdminRequest);
const ID = "3f2b8c1e-9a4d-4c3b-8e2f-1a2b3c4d5e6f";

type Handler = typeof GET;

function methodOf(handler: Handler) {
    return handler === GET ? "GET" : handler === PATCH ? "PATCH" : "POST";
}

async function call(handler: Handler, route: string, init?: { body?: string; search?: string }) {
    const method = methodOf(handler);
    const request = new NextRequest(
        `https://painel.test/api/admin/${route}${init?.search ?? ""}`,
        { method, ...(init?.body ? { body: init.body } : {}) },
    );
    return handler(request, { params: Promise.resolve({ path: route.split("/") }) });
}

beforeEach(() => {
    proxied.mockClear();
});

describe("BFF /api/admin/[...path]", () => {
    it.each([
        [GET, "moderation/summary", "/accidents/moderation/summary"],
        [GET, "moderation", "/accidents/moderation"],
        [GET, `moderation/${ID}`, `/accidents/moderation/${ID}`],
        [PATCH, `moderation/${ID}`, `/accidents/moderation/${ID}`],
        [PATCH, `${ID}/moderation`, `/accidents/${ID}/moderation`],
        [GET, "moderation-history", "/admin/moderation-history"],
        [GET, "moderation-history/moderators", "/admin/moderation-history/moderators"],
        [GET, "moderator-invites", "/admin/moderator-invites"],
        [POST, "moderator-invites", "/admin/moderator-invites"],
        [POST, `moderator-invites/${ID}/resend`, `/admin/moderator-invites/${ID}/resend`],
        [POST, `moderator-invites/${ID}/revoke`, `/admin/moderator-invites/${ID}/revoke`],
        [GET, "moderators", "/admin/moderators"],
        [POST, `moderators/${ID}/revoke`, `/admin/moderators/${ID}/revoke`],
        [GET, "users", "/admin/users"],
        [GET, `users/${ID}`, `/admin/users/${ID}`],
        [POST, `users/${ID}/suspend`, `/admin/users/${ID}/suspend`],
        [POST, `users/${ID}/reactivate`, `/admin/users/${ID}/reactivate`],
        [POST, `users/${ID}/sessions/revoke`, `/admin/users/${ID}/sessions/revoke`],
        [GET, "audit-logs", "/admin/audit-logs"],
        [GET, "settings", "/admin/settings"],
        [PATCH, "settings", "/admin/settings"],
        [GET, "notifications/administrative-notices", "/notifications/administrative-notices"],
        [POST, "notifications/administrative-notices", "/notifications/administrative-notices"],
    ] as const)("%o %s → %s", async (handler, route, backend) => {
        const response = await call(handler, route);

        expect(response.status).toBe(200);
        expect(proxied).toHaveBeenCalledTimes(1);
        const [path, method] = proxied.mock.calls[0];
        expect(path).toBe(backend);
        expect(method).toBe(methodOf(handler));
    });

    it.each([
        [GET, "users/../settings"],
        [GET, "users/123"],
        [GET, `users/${ID}/suspend`],
        [POST, "users"],
        [PATCH, "moderation"],
        [POST, "settings"],
        [GET, "admin/users"],
        [GET, "moderationx"],
        [POST, `users/${ID}/delete`],
        [GET, "auth/me"],
    ] as const)("%o %s fica fora da lista e responde 404", async (handler, route) => {
        const response = await call(handler, route);

        expect(response.status).toBe(404);
        expect((await response.json()).error.code).toBe("NOT_FOUND");
        expect(proxied).not.toHaveBeenCalled();
    });

    it("repassa a query string e o método", async () => {
        await call(GET, "users", { search: "?page=2&q=ana" });
        expect(proxied).toHaveBeenCalledWith("/admin/users?page=2&q=ana", "GET", undefined);
    });

    it("repassa o corpo cru em POST e PATCH", async () => {
        const body = JSON.stringify({ reason: "spam" });
        await call(POST, `users/${ID}/suspend`, { body });
        expect(proxied).toHaveBeenCalledWith(`/admin/users/${ID}/suspend`, "POST", body);
    });
});
