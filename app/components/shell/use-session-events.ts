"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Reage aos eventos disparados pelo `adminFetch`: 401 leva ao login e 403 de
 * autorização recarrega a sessão no servidor.
 */
export function useSessionEvents() {
    const router = useRouter();

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
}
