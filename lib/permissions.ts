// Espelho da union `Permission` de crashmap-api/src/modules/auth/permissions.ts.
// O painel só usa o tipo; quem decide o que cada papel pode fazer é a API, que
// devolve a lista pronta em `user.permissions`.
export type Permission =
    | "panel:access"
    | "reports:read"
    | "reports:moderate"
    | "moderation_history:read"
    | "stats:read"
    | "notices:publish"
    | "moderators:invite"
    | "moderators:revoke"
    | "invites:manage"
    | "users:manage"
    | "audit:read"
    | "settings:manage";

export type UserRole = "user" | "moderator" | "admin";

export interface SessionUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    permissions: Permission[];
}

export function formatRole(role: UserRole) {
    const labels: Record<UserRole, string> = {
        user: "Usuário",
        moderator: "Moderador",
        admin: "Administrador",
    };

    return labels[role] ?? role;
}
