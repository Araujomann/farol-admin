"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    usePermissions,
    useSessionUser,
} from "@/app/components/permissions-provider";
import { LogoutDialog } from "@/app/components/shell/logout-dialog";
import { navigation, pageTitleFor } from "@/app/components/shell/navigation";
import { Sidebar } from "@/app/components/shell/sidebar";
import { Topbar } from "@/app/components/shell/topbar";
import { useSessionEvents } from "@/app/components/shell/use-session-events";

/** Moldura das páginas do painel: menu lateral, barra superior e saída da conta. */
export function AdminShell({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [logoutPending, setLogoutPending] = useState(false);
    const user = useSessionUser();
    const can = usePermissions();
    const visibleNavigation = navigation.filter((item) => can(item.permission));
    const canSearchReports = can("reports:read");
    const pageTitle = pageTitleFor(pathname);

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

    useSessionEvents();

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
            <Sidebar
                items={visibleNavigation}
                onLogout={() => setLogoutDialogOpen(true)}
                onNavigate={() => setMenuOpen(false)}
                open={menuOpen}
                pathname={pathname}
            />
            <div className="main-column">
                <Topbar
                    canSearchReports={canSearchReports}
                    onToggleMenu={() => setMenuOpen((open) => !open)}
                    pageTitle={pageTitle}
                    user={user}
                />
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
                <LogoutDialog
                    onCancel={() => setLogoutDialogOpen(false)}
                    onConfirm={() => void confirmLogout()}
                    pending={logoutPending}
                />
            )}
        </div>
    );
}
