"use client";

import { useEffect, useState } from "react";
import {
    fetchHistoryModerators,
    fetchModerationHistory,
    type HistoryResponse,
} from "@/lib/api/history";
import { errorMessage } from "@/lib/errors";
import type { ModerationHistoryModerator } from "@/lib/types";

/** Decisões de moderação filtradas por pessoa, decisão e período. */
export function useModerationHistory() {
    const [moderatorId, setModeratorId] = useState("");
    const [status, setStatus] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [page, setPage] = useState(1);
    const [reloadKey, setReloadKey] = useState(0);
    const [result, setResult] = useState<HistoryResponse | null>(null);
    const [moderators, setModerators] = useState<ModerationHistoryModerator[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        fetchHistoryModerators()
            .then((response) => {
                if (active) setModerators(response.data);
            })
            // O filtro por pessoa é opcional; a lista principal mostra o erro.
            .catch(() => undefined);
        return () => {
            active = false;
        };
    }, [reloadKey]);

    useEffect(() => {
        let active = true;
        const query = new URLSearchParams({ page: String(page), limit: "20" });
        if (moderatorId) query.set("moderatorId", moderatorId);
        if (status) query.set("status", status);
        if (from) query.set("from", from);
        if (to) query.set("to", to);

        const timer = window.setTimeout(async () => {
            try {
                const response = await fetchModerationHistory(query.toString());
                if (active) {
                    setResult(response);
                    setError("");
                }
            } catch (reason) {
                if (active) {
                    setError(errorMessage(reason, "Erro ao carregar o histórico."));
                }
            } finally {
                if (active) setLoading(false);
            }
        }, 150);

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [from, moderatorId, page, reloadKey, status, to]);

    function updateFilter(setter: (value: string) => void, value: string) {
        setLoading(true);
        setPage(1);
        setter(value);
    }

    function clearFilters() {
        setLoading(true);
        setPage(1);
        setModeratorId("");
        setStatus("");
        setFrom("");
        setTo("");
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

    const hasFilters = Boolean(moderatorId || status || from || to);

    return {
        filters: { moderatorId, status, from, to },
        changeModerator: (value: string) => updateFilter(setModeratorId, value),
        changeStatus: (value: string) => updateFilter(setStatus, value),
        changeFrom: (value: string) => updateFilter(setFrom, value),
        changeTo: (value: string) => updateFilter(setTo, value),
        clearFilters,
        hasFilters,
        refresh,
        page,
        goToPreviousPage,
        goToNextPage,
        moderators,
        result,
        loading,
        error,
    };
}
