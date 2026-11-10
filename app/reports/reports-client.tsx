"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/app/components/admin-shell";
import { Icon } from "@/app/components/ui-icon";
import { StatusBadge } from "@/app/components/status-badge";
import { adminFetch } from "@/lib/client-api";
import {
    formatDate,
    formatSeverity,
} from "@/lib/format";
import type {
    AccidentListItem,
    ModerationStatus,
    Pagination,
} from "@/lib/types";

interface AccidentListResponse {
    data: AccidentListItem[];
    pagination: Pagination;
}

const statuses: Array<{ value: "" | ModerationStatus; label: string }> = [
    { value: "", label: "Todos os status" },
    { value: "PENDING", label: "Pendentes" },
    { value: "APPROVED", label: "Aprovados" },
    { value: "REJECTED", label: "Rejeitados" },
];

export function ReportsClient({ initialStatus }: { initialStatus: string }) {
    const [status, setStatus] = useState(initialStatus);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<"newest" | "oldest">("newest");
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
        if (search.trim()) query.set("search", search.trim());

        const timer = window.setTimeout(async () => {
            try {
                const response = await adminFetch<AccidentListResponse>(
                    `/api/admin/moderation?${query.toString()}`,
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
                            : "Erro ao carregar relatos.",
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        }, 200);

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [page, reloadKey, search, sort, status]);

    function updateStatus(value: string) {
        setLoading(true);
        setPage(1);
        setStatus(value);
    }

    return (
        <AdminShell>
            <div className="page-heading">
                <div>
                    <div className="eyebrow">MODERAÇÃO</div>
                    <h1>Relatos</h1>
                    <p>Consulte, filtre e acompanhe os relatos enviados pela comunidade.</p>
                </div>
                <div className="heading-count">
                    <strong>{result?.pagination.total ?? "—"}</strong>
                    <span>relatos</span>
                </div>
            </div>

            <section aria-label="Filtros de relatos" className="filter-bar">
                <label className="search-field">
                    <Icon name="search" />
                    <span className="sr-only">Buscar relato</span>
                    <input
                        onChange={(event) => {
                            setLoading(true);
                            setPage(1);
                            setSearch(event.target.value);
                        }}
                        placeholder="Buscar por tipo ou descrição"
                        value={search}
                    />
                </label>
                <label className="select-field">
                    <span className="sr-only">Filtrar por status</span>
                    <select onChange={(event) => updateStatus(event.target.value)} value={status}>
                        {statuses.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="select-field sort-field">
                    <span className="sr-only">Ordenar relatos</span>
                    <select
                        onChange={(event) => {
                            setLoading(true);
                            setSort(event.target.value as "newest" | "oldest");
                        }}
                        value={sort}
                    >
                        <option value="newest">Mais recentes</option>
                        <option value="oldest">Mais antigos</option>
                    </select>
                </label>
            </section>

            {error && (
                <div className="alert alert-error" role="alert">
                    <div>
                        <strong>Falha ao carregar os relatos.</strong>
                        <span>{error}</span>
                    </div>
                    <button
                        className="text-button"
                        onClick={() => {
                            setLoading(true);
                            setError("");
                            setReloadKey((value) => value + 1);
                        }}
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            <section aria-label="Lista de relatos" className="table-card">
                <div className="table-scroll">
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>Relato</th>
                                <th>Ocorrência</th>
                                <th>Enviado por</th>
                                <th>Gravidade</th>
                                <th>Status</th>
                                <th><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading &&
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={`loading-${index}`}>
                                        <td colSpan={6}><span className="table-skeleton" /></td>
                                    </tr>
                                ))}
                            {!loading &&
                                result?.data.map((accident) => (
                                    <tr key={accident.id}>
                                        <td>
                                            <Link className="report-title" href={`/reports/${accident.id}`}>
                                                {accident.tipo_acidente}
                                            </Link>
                                            <span className="report-subtitle">
                                                {accident.description || "Sem descrição adicional"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="table-primary">
                                                {formatDate(accident.occurred_at)}
                                            </span>
                                            <span className="table-secondary">
                                                Enviado {formatDate(accident.created_at)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="table-primary">
                                                {accident.created_by?.name ?? "Usuário indisponível"}
                                            </span>
                                            <span className="table-secondary">
                                                {accident.created_by?.email ?? "—"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`severity severity-${accident.severity}`}>
                                                <span className="severity-dot" />
                                                {formatSeverity(accident.severity)}
                                            </span>
                                        </td>
                                        <td><StatusBadge status={accident.moderation_status} /></td>
                                        <td>
                                            <Link
                                                aria-label={`Analisar relato ${accident.tipo_acidente}`}
                                                className="row-action"
                                                href={`/reports/${accident.id}`}
                                            >
                                                <Icon name="arrow" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                {!loading && result?.data.length === 0 && (
                    <div className="empty-state">
                        <span className="empty-icon"><Icon name="reports" /></span>
                        <strong>Nenhum relato encontrado</strong>
                        <span>Altere os filtros ou tente outra busca.</span>
                    </div>
                )}
                {result && result.pagination.totalPages > 1 && (
                    <div className="pagination">
                        <span>
                            Página {result.pagination.page} de {result.pagination.totalPages}
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
