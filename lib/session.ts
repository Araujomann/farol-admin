import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { requestBackend } from "@/lib/backend";
import type { Permission, SessionUser } from "@/lib/permissions";
import { ACCESS_COOKIE } from "@/lib/session-tokens";

// Camada de acesso à sessão (somente servidor). A renovação do access token
// acontece em `proxy.ts`, porque Server Components não podem gravar cookies.

/** Usuário da sessão atual, consultado na API uma vez por requisição. */
export const getSession = cache(async (): Promise<SessionUser | null> => {
    const token = (await cookies()).get(ACCESS_COOKIE)?.value;
    if (!token) return null;

    try {
        const response = await requestBackend("/auth/me", "GET", token);
        if (!response.ok) return null;

        const { data } = (await response.json()) as { data: SessionUser };
        return {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            permissions: data.permissions ?? [],
        };
    } catch {
        return null;
    }
});

/**
 * Garante sessão com acesso ao painel e com a permissão pedida. Usar no topo
 * das páginas; a autorização efetiva continua sendo da API.
 */
export async function requirePagePermission(
    permission?: Permission,
): Promise<SessionUser> {
    const session = await getSession();
    if (!session) redirect("/login");

    if (
        !session.permissions.includes("panel:access") ||
        (permission && !session.permissions.includes(permission))
    ) {
        redirect("/sem-permissao");
    }

    return session;
}
