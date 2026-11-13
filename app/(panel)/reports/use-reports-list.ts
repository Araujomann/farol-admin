"use client";

import { useEffect, useState } from "react";
import { fetchAccidents, type AccidentListResponse } from "@/lib/api/moderation";
import { errorMessage } from "@/lib/errors";

export type ReportsSort = "newest" | "oldest";

/** Fila de relatos com busca, filtros, ordenação e paginação. */
export function useReportsList({
    initialSearch,
    initialSeverity,
    initialStatus,
}: {
    initialSearch: string;
    initialSeverity: string;
    initialStatus: string;
}) {
    const [status, setStatus] = useState(initialStatus);
    const [severity, setSeverity] = useState(initialSeverity);
    const [search, setSearch] = useState(initialSearch);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<ReportsSort>("newest");
    const [result, setResult] = useState<AccidentListResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let active = true;
        const query = new URLSearchParams({
            page: String(page),
            limit: "10",
            sort,
        });
        if (status) query.set("status", status);
        if (severity) query.set("severity", severity);
        if (search.trim()) query.set("search", search.trim());

        const timer = window.setTimeout(async () => {
            try {
                const response = await fetchAccidents(query.toString());
                if (active) {
                    setResult(response);
                    setError("");
                }
            } catch (reason) {
                if (active) {
                    setError(errorMessage(reason, "Erro ao carregar relatos."));
                }
            } finally {
                if (active) setLoading(false);
            }
        }, 200);

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [page, reloadKey, search, severity, sort, status]);

    function changeSearch(value: string) {
        setLoading(true);
        setPage(1);
        setSearch(value);
    }

    function changeStatus(value: string) {
        setLoading(true);
        setPage(1);
        setStatus(value);
    }

    function changeSeverity(value: string) {
        setLoading(true);
        setPage(1);
        setSeverity(value);
    }

    function changeSort(value: ReportsSort) {
        setLoading(true);
        setSort(value);
    }

    function refresh() {
        setLoading(true);
        setReloadKey((value) => value + 1);
    }

    function retry() {
        setLoading(true);
        setError("");
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
        filters: { status, severity, search, sort },
        changeSearch,
        changeStatus,
        changeSeverity,
        changeSort,
        refresh,
        retry,
        page,
        goToPreviousPage,
        goToNextPage,
        result,
        loading,
        error,
    };
}
