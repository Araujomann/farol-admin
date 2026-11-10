"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/app/components/ui-icon";

const navigation = [
    { href: "/", label: "Visão geral", icon: "dashboard" as const },
    { href: "/reports", label: "Relatos", icon: "reports" as const },
];

export function AdminShell({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleUnauthorized = () => router.replace("/login");
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
                    <span className="brand-mark">f</span>
                    <span>
                        <strong>farol</strong>
                        <small>ADMINISTRAÇÃO</small>
                    </span>
                </Link>
                <div className="sidebar-label">MENU PRINCIPAL</div>
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
                        Área restrita a moderadores
                    </div>
                    <button
                        className="nav-link logout-link"
                        onClick={async () => {
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
                    <span className="topbar-title">Central de moderação</span>
                    <span className="role-pill">
                        <span className="security-dot" />
                        Acesso seguro
                    </span>
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
