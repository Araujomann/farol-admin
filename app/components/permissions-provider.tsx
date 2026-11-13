"use client";

import { createContext, useContext, useMemo } from "react";
import type { Permission, SessionUser } from "@/lib/permissions";

interface PermissionsContextValue {
    user: SessionUser;
    permissions: ReadonlySet<Permission>;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

// Só controla o que a interface mostra. Quem autoriza é a Crash Map API.
export function PermissionsProvider({
    user,
    children,
}: Readonly<{ user: SessionUser; children: React.ReactNode }>) {
    const value = useMemo(
        () => ({ user, permissions: new Set(user.permissions) }),
        [user],
    );

    return (
        <PermissionsContext.Provider value={value}>
            {children}
        </PermissionsContext.Provider>
    );
}

export function useSessionUser(): SessionUser | null {
    return useContext(PermissionsContext)?.user ?? null;
}

/** Retorna uma função `can(permission)` para a sessão atual. */
export function usePermissions() {
    const context = useContext(PermissionsContext);
    return (permission: Permission) => context?.permissions.has(permission) ?? false;
}

export function useCan(permission: Permission) {
    return usePermissions()(permission);
}

export function Can({
    permission,
    children,
    fallback = null,
}: Readonly<{
    permission: Permission;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}>) {
    return useCan(permission) ? children : fallback;
}
