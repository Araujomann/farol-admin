"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import { Icon } from "@/app/components/ui-icon";
import {
    clearAdminEmail,
    getAdminEmail,
    subscribeToAdminEmail,
} from "@/lib/admin-session";

const navigation = [
    { href: "/", label: "Visão geral", icon: "dashboard" as const },
    { href: "/reports", label: "Relatos", icon: "reports" as const },
    { href: "/notices", label: "Avisos à comunidade", icon: "bell" as const },
];

export function AdminShell({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [globalSearch, setGlobalSearch] = useState("");
    const adminEmail = useSyncExternalStore(
        subscribeToAdminEmail,
        getAdminEmail,
        () => "",
    );
    const pageTitle = pathname.startsWith("/reports/")
        ? "Análise do relato"
        : pathname.startsWith("/reports")
          ? "Relatos"
          : pathname.startsWith("/notices")
            ? "Avisos à comunidade"
            : "Painel de Controle";

    function searchReports(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const query = globalSearch.trim();
        router.push(query ? `/reports?search=${encodeURIComponent(query)}` : "/reports");
    }

    useEffect(() => {
        const handleUnauthorized = () => {
            clearAdminEmail();
            router.replace("/login");
        };
        window.addEventListener("farol:unauthorized", handleUnauthorized);
        return () =>
            window.removeEventListener("farol:unauthorized", handleUnauthorized);
    }, [router]);

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
                    {navigation.map((item) => {
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
                        onClick={async () => {
                            const response = await fetch("/api/auth/logout", {
                                method: "POST",
                            });
                            clearAdminEmail();
                            if (!response.ok) {
                                const result = await response.json().catch(() => null);
                                window.alert(
                                    result?.error?.message ??
                                        "Não foi possível encerrar a sessão corretamente.",
                                );
                            }
                            router.replace("/login");
                        }}
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
                        <span className="topbar-brand-mark"><Icon name="pin" /></span>
                        <span>Farol ADM</span>
                        <Icon name="chevron" />
                        <strong>{pageTitle}</strong>
                    </div>
                    <form className="topbar-search" onSubmit={searchReports} role="search">
                        <Icon name="search" />
                        <input
                            aria-label="Buscar relatos"
                            onChange={(event) => setGlobalSearch(event.target.value)}
                            placeholder="Buscar ocorrência, placa, protocolo"
                            value={globalSearch}
                        />
                    </form>
                    <div className="topbar-account">
                        <span className="role-pill">
                            <Icon name="lock" />
                            Acesso seguro
                        </span>
                        <span className="account-divider" />
                        <span className="account-copy">
                            <strong>Administrador</strong>
                            {adminEmail && <small title={adminEmail}>{adminEmail}</small>}
                        </span>
                        <span aria-hidden="true" className="account-avatar">A</span>
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
        </div>
    );
}
