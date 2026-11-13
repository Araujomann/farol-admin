"use client";

import { useEffect, useState } from "react";
import {
    fetchAccidents,
    fetchModerationSummary,
    type ModerationSummary,
} from "@/lib/api/moderation";
import { errorMessage } from "@/lib/errors";
import type { AccidentListItem } from "@/lib/types";

/** Indicadores da moderação e os 3 relatos pendentes mais recentes. */
export function useDashboard() {
    const [summary, setSummary] = useState<ModerationSummary | null>(null);
    const [recentReports, setRecentReports] = useState<AccidentListItem[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let active = true;
        Promise.all([
            fetchModerationSummary(),
            fetchAccidents("page=1&limit=3&status=PENDING&sort=newest"),
        ])
            .then(([summaryResult, reportsResult]) => {
                if (!active) return;
                setSummary(summaryResult.data);
                setRecentReports(reportsResult.data);
                setError("");
            })
            .catch((reason: unknown) => {
                if (!active) return;
                setError(errorMessage(reason, "Erro ao carregar dados."));
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [reloadKey]);

    function retry() {
        setLoading(true);
        setError("");
        setReloadKey((value) => value + 1);
    }

    return { summary, recentReports, error, loading, retry };
}
