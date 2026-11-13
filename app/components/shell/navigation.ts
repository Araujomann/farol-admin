import type { IconName } from "@/app/components/ui-icon";
import type { Permission } from "@/lib/permissions";

export interface NavigationItem {
    href: string;
    label: string;
    icon: IconName;
    permission: Permission;
}

// Cada item só aparece para quem tem a permissão correspondente.
export const navigation: NavigationItem[] = [
    { href: "/", label: "Visão geral", icon: "dashboard", permission: "stats:read" },
    { href: "/reports", label: "Relatos", icon: "reports", permission: "reports:read" },
    {
        href: "/moderation-history",
        label: "Histórico de moderação",
        icon: "clock",
        permission: "moderation_history:read",
    },
    { href: "/notices", label: "Avisos à comunidade", icon: "bell", permission: "notices:publish" },
    { href: "/team", label: "Equipe e convites", icon: "users", permission: "invites:manage" },
    { href: "/users", label: "Usuários", icon: "user", permission: "users:manage" },
    { href: "/audit", label: "Auditoria", icon: "shield", permission: "audit:read" },
    { href: "/settings", label: "Configurações", icon: "settings", permission: "settings:manage" },
];

// Título do topo por prefixo de rota; o primeiro que casar vale.
const pageTitles: Array<[prefix: string, title: string]> = [
    ["/reports/", "Análise do relato"],
    ["/reports", "Relatos"],
    ["/moderation-history", "Histórico de moderação"],
    ["/notices", "Avisos à comunidade"],
    ["/team", "Equipe e convites"],
    ["/users", "Usuários"],
    ["/audit", "Auditoria"],
    ["/settings", "Configurações"],
];

export function pageTitleFor(pathname: string) {
    return (
        pageTitles.find(([prefix]) => pathname.startsWith(prefix))?.[1] ??
        "Painel de Controle"
    );
}
