"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Icon } from "@/app/components/ui-icon";
import { formatRole, type SessionUser } from "@/lib/permissions";

export function Topbar({
    pageTitle,
    user,
    canSearchReports,
    onToggleMenu,
}: Readonly<{
    pageTitle: string;
    user: SessionUser | null;
    canSearchReports: boolean;
    onToggleMenu: () => void;
}>) {
    const router = useRouter();
    const [globalSearch, setGlobalSearch] = useState("");

    function searchReports(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const query = globalSearch.trim();
        router.push(query ? `/reports?search=${encodeURIComponent(query)}` : "/reports");
    }

    return (
        <header className="topbar">
            <button
                aria-label="Abrir menu"
                className="mobile-menu"
                onClick={onToggleMenu}
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
    );
}
