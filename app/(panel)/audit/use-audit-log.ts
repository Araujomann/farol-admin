"use client";

import { useEffect, useState } from "react";
import { fetchAuditLogs, type AuditResponse } from "@/lib/api/audit";
import { errorMessage } from "@/lib/errors";

/** Registros de auditoria filtrados por ação e período. */
export function useAuditLog() {
    const [action, setAction] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [page, setPage] = useState(1);
    const [reloadKey, setReloadKey] = useState(0);
    const [result, setResult] = useState<AuditResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        const query = new URLSearchParams({ page: String(page), limit: "25" });
        if (action) query.set("action", action);
        if (from) query.set("from", from);
        if (to) query.set("to", to);

        const timer = window.setTimeout(async () => {
            try {
                const response = await fetchAuditLogs(query.toString());
                if (active) {
                    setResult(response);
                    setError("");
                }
            } catch (reason) {
                if (active) setError(errorMessage(reason, "Erro ao carregar a auditoria."));
            } finally {
                if (active) setLoading(false);
            }
        }, 150);

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [action, from, page, reloadKey, to]);

    function updateFilter(setter: (value: string) => void, value: string) {
        setLoading(true);
        setPage(1);
        setter(value);
    }

    function refresh() {
        setLoading(true);
        setReloadKey((value) => value + 1);
    }

    function goToPreviousPage() {
        setLoading(true);
        setPage((value) => Math.max(1, value - 1));
    }

    function goToNextPage() {
        setLoading(true);
        setPage((value) => value + 1);
    }

    return {
        filters: { action, from, to },
        changeAction: (value: string) => updateFilter(setAction, value),
        changeFrom: (value: string) => updateFilter(setFrom, value),
        changeTo: (value: string) => updateFilter(setTo, value),
        refresh,
        page,
        goToPreviousPage,
        goToNextPage,
        result,
        loading,
        error,
    };
}
