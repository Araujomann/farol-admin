"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/app/components/admin-shell";
import { StatusBadge } from "@/app/components/status-badge";
import { Icon } from "@/app/components/ui-icon";
import { adminFetch } from "@/lib/client-api";
import { formatDate, formatSeverity } from "@/lib/format";
import type {
    ModerationHistoryActor,
    ModerationHistoryItem,
    ModerationHistoryModerator,
    Pagination,
} from "@/lib/types";

interface HistoryResponse {
    data: ModerationHistoryItem[];
    pagination: Pagination;
}

const decisions = [
    { value: "", label: "Todas as decisões" },
    { value: "APPROVED", label: "Aprovações" },
    { value: "REJECTED", label: "Rejeições" },
];

function ActorName({ actor }: { actor: ModerationHistoryActor }) {
    return (
        <>
            <span className="table-primary">
                {actor.is_deleted ? "Conta removida" : actor.name}
            </span>
            <span className="table-secondary">
                {actor.is_deleted ? "Ex-integrante da equipe" : actor.email}
            </span>
        </>
    );
}

export function ModerationHistoryClient() {
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
        adminFetch<{ data: ModerationHistoryModerator[] }>(
            "/api/admin/moderation-history/moderators",
        )
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
                const response = await adminFetch<HistoryResponse>(
                    `/api/admin/moderation-history?${query.toString()}`,
                );
                if (active) {
                    setResult(response);
                    setError("");
                }
            } catch (reason) {
                if (active) {
                    setError(
                        reason instanceof Error
                            ? reason.message
                            : "Erro ao carregar o histórico.",
                    );
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

    const hasFilters = Boolean(moderatorId || status || from || to);

    return (
        <AdminShell>
            <div className="page-heading">
                <div>
                    <div className="eyebrow"><span className="eyebrow-dot" /> RASTREABILIDADE</div>
                    <h1>Histórico de moderação</h1>
                    <p>
                        Quem aprovou ou rejeitou cada relato, quando e com qual
                        justificativa. As decisões registradas não podem ser alteradas.
                    </p>
                </div>
            </div>

            <section aria-label="Filtros do histórico" className="filter-bar history-filters">
                <label className="select-field">
                    <span className="sr-only">Filtrar por pessoa</span>
                    <select
                        onChange={(event) => updateFilter(setModeratorId, event.target.value)}
                        value={moderatorId}
                    >
                        <option value="">Toda a equipe</option>
                        {moderators.map((moderator) => (
                            <option key={moderator.id} value={moderator.id}>
                                {moderator.is_deleted ? "Conta removida" : moderator.name} (
                                {moderator.decisions_count})
                            </option>
                        ))}
                    </select>
                </label>
                <label className="select-field">
                    <span className="sr-only">Filtrar por decisão</span>
                    <select
                        onChange={(event) => updateFilter(setStatus, event.target.value)}
                        value={status}
                    >
                        {decisions.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="select-field date-field">
                    <span>De</span>
                    <input
                        max={to || undefined}
                        onChange={(event) => updateFilter(setFrom, event.target.value)}
                        type="date"
                        value={from}
                    />
                </label>
                <label className="select-field date-field">
                    <span>Até</span>
                    <input
                        min={from || undefined}
                        onChange={(event) => updateFilter(setTo, event.target.value)}
                        type="date"
                        value={to}
                    />
                </label>
                {hasFilters && (
                    <button
                        className="button button-outline button-small"
                        onClick={() => {
                            setLoading(true);
                            setPage(1);
                            setModeratorId("");
                            setStatus("");
                            setFrom("");
                            setTo("");
                        }}
                        type="button"
                    >
                        Limpar filtros
                    </button>
                )}
                <button
                    aria-label="Atualizar histórico"
                    className="filter-refresh"
                    disabled={loading}
                    onClick={() => {
                        setLoading(true);
                        setReloadKey((value) => value + 1);
                    }}
                    type="button"
                >
                    <Icon name="refresh" />
                </button>
            </section>

            {error && (
                <div className="alert alert-error" role="alert">
                    <div>
                        <strong>Falha ao carregar o histórico.</strong>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            <section aria-label="Decisões de moderação" className="table-card">
                <div className="table-scroll">
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Relato</th>
                                <th>Decisão</th>
                                <th>Responsável</th>
                                <th>Justificativa e observação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading &&
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={`loading-${index}`}>
                                        <td colSpan={5}><span className="table-skeleton" /></td>
                                    </tr>
                                ))}
                            {!loading &&
                                result?.data.map((entry) => (
                                    <tr key={entry.id}>
                                        <td>
                                            <span className="table-primary">
                                                {formatDate(entry.created_at)}
                                            </span>
                                        </td>
                                        <td>
                                            <Link
                                                className="report-title"
                                                href={`/reports/${entry.accident.id}`}
                                            >
                                                {entry.accident.tipo_acidente}
                                            </Link>
                                            <span className="table-secondary">
                                                Gravidade {formatSeverity(entry.accident.severity).toLowerCase()}
                                                {" · "}#{entry.accident.id.slice(0, 8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td><StatusBadge status={entry.new_status} /></td>
                                        <td><ActorName actor={entry.moderated_by} /></td>
                                        <td className="history-notes">
                                            {entry.public_message && (
                                                <span className="table-primary">
                                                    {entry.public_message}
                                                </span>
                                            )}
                                            {entry.internal_note && (
                                                <span className="table-secondary">
                                                    Interna: {entry.internal_note}
                                                </span>
                                            )}
                                            {!entry.public_message && !entry.internal_note && (
                                                <span className="table-secondary">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                {!loading && result?.data.length === 0 && (
                    <div className="empty-state">
                        <span className="empty-icon"><Icon name="clock" /></span>
                        <strong>Nenhuma decisão encontrada</strong>
                        <span>
                            {hasFilters
                                ? "Altere os filtros para ver outras decisões."
                                : "As aprovações e rejeições aparecerão aqui."}
                        </span>
                    </div>
                )}
                {result && result.pagination.totalPages > 1 && (
                    <div className="pagination">
                        <span>
                            Página {result.pagination.page} de {result.pagination.totalPages}
                            {" · "}
                            {result.pagination.total} decisões
                        </span>
                        <div>
                            <button
                                className="button button-outline button-small"
                                disabled={page <= 1 || loading}
                                onClick={() => {
                                    setLoading(true);
                                    setPage((value) => Math.max(1, value - 1));
                                }}
                            >
                                Anterior
                            </button>
                            <button
                                className="button button-outline button-small"
                                disabled={page >= result.pagination.totalPages || loading}
                                onClick={() => {
                                    setLoading(true);
                                    setPage((value) => value + 1);
                                }}
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </AdminShell>
    );
}
