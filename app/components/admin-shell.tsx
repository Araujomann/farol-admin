"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
    usePermissions,
    useSessionUser,
} from "@/app/components/permissions-provider";
import { Icon, type IconName } from "@/app/components/ui-icon";
import { formatRole, type Permission } from "@/lib/permissions";

interface NavigationItem {
    href: string;
    label: string;
    icon: IconName;
    permission: Permission;
}

// Cada item só aparece para quem tem a permissão correspondente.
const navigation: NavigationItem[] = [
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
];

export function AdminShell({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [globalSearch, setGlobalSearch] = useState("");
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [logoutPending, setLogoutPending] = useState(false);
    const user = useSessionUser();
    const can = usePermissions();
    const visibleNavigation = navigation.filter((item) => can(item.permission));
    const canSearchReports = can("reports:read");
    const pageTitle = pathname.startsWith("/reports/")
        ? "Análise do relato"
        : pathname.startsWith("/reports")
          ? "Relatos"
          : pathname.startsWith("/moderation-history")
            ? "Histórico de moderação"
            : pathname.startsWith("/notices")
              ? "Avisos à comunidade"
              : pathname.startsWith("/team")
                ? "Equipe e convites"
                : "Painel de Controle";

    function searchReports(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const query = globalSearch.trim();
        router.push(query ? `/reports?search=${encodeURIComponent(query)}` : "/reports");
    }

    async function confirmLogout() {
        setLogoutPending(true);
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });
            if (!response.ok) {
                const result = await response.json().catch(() => null);
                window.alert(
                    result?.error?.message ??
                        "Não foi possível encerrar a sessão corretamente.",
                );
            }
            setLogoutDialogOpen(false);
            router.replace("/login");
        } catch {
            window.alert("Não foi possível encerrar a sessão corretamente.");
        } finally {
            setLogoutPending(false);
        }
    }

    useEffect(() => {
        const handleUnauthorized = () => router.replace("/login");
        // A API recusou por permissão: as permissões podem ter mudado (por
        // exemplo, o moderador foi removido). Recarrega a sessão no servidor;
        // se o acesso ao painel caiu, as páginas redirecionam.
        const handleForbidden = () => router.refresh();
        window.addEventListener("farol:unauthorized", handleUnauthorized);
        window.addEventListener("farol:forbidden", handleForbidden);
        return () => {
            window.removeEventListener("farol:unauthorized", handleUnauthorized);
            window.removeEventListener("farol:forbidden", handleForbidden);
        };
    }, [router]);

    useEffect(() => {
        if (!logoutDialogOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !logoutPending) {
                setLogoutDialogOpen(false);
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [logoutDialogOpen, logoutPending]);

    return (
        <div className="app-frame">
            <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
                <Link
                    className="brand"
                    href="/"
                    onClick={() => setMenuOpen(false)}
                >
                    <Image
                        alt=""
                        className="brand-logo"
                        height={52}
                        src="/farol-logo.png"
                        width={52}
                    />
                    <span>
                        <strong>Farol</strong>
                        <small>ADMINISTRAÇÃO</small>
                    </span>
                </Link>
                <div className="sidebar-label">NAVEGAÇÃO PRINCIPAL</div>
                <nav aria-label="Navegação principal" className="side-nav">
                    {visibleNavigation.map((item) => {
                        const active =
                            item.href === "/"
                                ? pathname === "/"
                                : pathname.startsWith(item.href);
                        return (
                            <Link
                                aria-current={active ? "page" : undefined}
                                className={`nav-link ${active ? "nav-link-active" : ""}`}
                                href={item.href}
                                key={item.href}
                                onClick={() => setMenuOpen(false)}
                            >
                                <Icon name={item.icon} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="sidebar-bottom">
                    <div className="security-note">
                        <span className="security-dot" />
                        <span>
                            <strong>Status Operacional</strong>
                            <small>Central ativa</small>
                        </span>
                        <Icon name="lock" />
                    </div>
                    <button
                        className="nav-link logout-link"
                        onClick={() => setLogoutDialogOpen(true)}
                        type="button"
                    >
                        <Icon name="logout" />
                        <span>Sair da conta</span>
                    </button>
                </div>
            </aside>
            <div className="main-column">
                <header className="topbar">
                    <button
                        aria-label="Abrir menu"
                        className="mobile-menu"
                        onClick={() => setMenuOpen((open) => !open)}
                        type="button"
                    >
                        <Icon name="menu" />
                    </button>
                    <div aria-label={`Farol ADM, ${pageTitle}`} className="topbar-breadcrumb">
                        <span aria-hidden="true" className="topbar-status-dot" />
                   
                        <Icon name="chevron" />
                        <strong>{pageTitle}</strong>
                    </div>
                    {canSearchReports && (
                        <form className="topbar-search" onSubmit={searchReports} role="search">
                            <Icon name="search" />
                            <input
                                aria-label="Buscar relatos"
                                onChange={(event) => setGlobalSearch(event.target.value)}
                                placeholder="Buscar ocorrência, placa, protocolo"
                                value={globalSearch}
                            />
                        </form>
                    )}
                    <div className="topbar-account">
                        <span className="role-pill">
                            <Icon name="lock" />
                            Acesso seguro
                        </span>
                        <span className="account-divider" />
                        <span className="account-copy">
                            <strong>{user ? formatRole(user.role) : "Equipe"}</strong>
                            {user && <small title={user.email}>{user.name}</small>}
                        </span>
                        <span aria-hidden="true" className="account-avatar">
                            {user?.name.trim().charAt(0).toUpperCase() || "?"}
                        </span>
                    </div>
                </header>
                <main className="main-content">{children}</main>
            </div>
            {menuOpen && (
                <button
                    aria-label="Fechar menu"
                    className="sidebar-backdrop"
                    onClick={() => setMenuOpen(false)}
                    type="button"
                />
            )}
            {logoutDialogOpen && (
                <div
                    className="logout-dialog-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !logoutPending) {
                            setLogoutDialogOpen(false);
                        }
                    }}
                >
                    <section
                        aria-describedby="logout-dialog-description"
                        aria-labelledby="logout-dialog-title"
                        aria-modal="true"
                        className="logout-dialog"
                        role="dialog"
                    >
                        <div className="logout-dialog-icon">
                            <Icon name="logout" />
                        </div>
                        <h2 id="logout-dialog-title">Sair da sua conta?</h2>
                        <p id="logout-dialog-description">
                            Você precisará entrar novamente para acessar o painel.
                        </p>
                        <div className="logout-dialog-actions">
                            <button
                                autoFocus
                                className="button button-outline"
                                disabled={logoutPending}
                                onClick={() => setLogoutDialogOpen(false)}
                                type="button"
                            >
                                Continuar conectado
                            </button>
                            <button
                                className="button button-danger"
                                disabled={logoutPending}
                                onClick={() => void confirmLogout()}
                                type="button"
                            >
                                {logoutPending ? "Saindo..." : "Sair da conta"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
