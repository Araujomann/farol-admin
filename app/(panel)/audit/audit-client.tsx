"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/app/components/admin-shell";
import { Icon } from "@/app/components/ui-icon";
import { adminFetch } from "@/lib/client-api";
import { formatDate } from "@/lib/format";
import type { AuditAction, AuditLogEntry, Pagination } from "@/lib/types";

interface AuditResponse {
    data: AuditLogEntry[];
    pagination: Pagination;
}

const actionLabels: Record<AuditAction, string> = {
    MODERATOR_INVITE_CREATED: "Convite enviado",
    MODERATOR_INVITE_RESENT: "Convite reenviado",
    MODERATOR_INVITE_REVOKED: "Convite revogado",
    MODERATOR_INVITE_ACCEPTED: "Convite aceito",
    MODERATOR_ROLE_REVOKED: "Moderador removido",
    REPORT_EDITED_BY_STAFF: "Relato editado pela equipe",
    REPORT_DELETED_BY_STAFF: "Relato apagado pela equipe",
    COMMENT_DELETED_BY_STAFF: "Comentário apagado pela equipe",
    IMAGE_DELETED_BY_STAFF: "Imagem apagada pela equipe",
    USER_SUSPENDED: "Conta suspensa",
    USER_REACTIVATED: "Conta reativada",
    USER_SESSIONS_REVOKED: "Sessões encerradas",
    SETTINGS_UPDATED: "Configurações alteradas",
    ROLE_GRANTED_BY_SCRIPT: "Papel alterado por script",
};

const settingLabels: Record<string, string> = {
    invite_ttl_hours: "validade do convite (h)",
    invite_max_sends_per_day: "envios por e-mail/dia",
};

function text(value: unknown) {
    return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

/** Resumo legível do que aconteceu, a partir dos metadados de cada ação. */
function describe(entry: AuditLogEntry): string {
    const meta = entry.metadata;
    switch (entry.action) {
        case "MODERATOR_INVITE_CREATED":
        case "MODERATOR_INVITE_RESENT":
        case "MODERATOR_INVITE_REVOKED":
            return text(meta.email);
        case "MODERATOR_INVITE_ACCEPTED":
            return `Papel anterior: ${text(meta.previous_role) || "—"}`;
        case "MODERATOR_ROLE_REVOKED":
        case "USER_SUSPENDED":
            return `${text(meta.name)} (${text(meta.email)}) · Motivo: ${text(meta.reason)}`;
        case "USER_REACTIVATED":
        case "USER_SESSIONS_REVOKED":
            return [
                `${text(meta.name)} (${text(meta.email)})`,
                meta.revoked_sessions !== undefined ? `${text(meta.revoked_sessions)} sessão(ões)` : "",
            ]
                .filter(Boolean)
                .join(" · ");
        case "REPORT_EDITED_BY_STAFF": {
            const after = (meta.after ?? {}) as Record<string, unknown>;
            const fields = Object.keys(after);
            return fields.length ? `Campos: ${fields.join(", ")}` : "Sem alteração de campos";
        }
        case "REPORT_DELETED_BY_STAFF": {
            const snapshot = (meta.snapshot ?? {}) as Record<string, unknown>;
            return text(snapshot.tipo_acidente);
        }
        case "COMMENT_DELETED_BY_STAFF":
            return `“${text(meta.body).slice(0, 120)}”`;
        case "IMAGE_DELETED_BY_STAFF":
            return text(meta.caption) || "Imagem sem legenda";
        case "SETTINGS_UPDATED": {
            const before = (meta.before ?? {}) as Record<string, unknown>;
            const after = (meta.after ?? {}) as Record<string, unknown>;
            return Object.keys(after)
                .map((key) => `${settingLabels[key] ?? key}: ${text(before[key])} → ${text(after[key])}`)
                .join(" · ");
        }
        case "ROLE_GRANTED_BY_SCRIPT":
            return `${text(meta.email)}: ${text(meta.previous_role)} → ${text(meta.new_role)} (operador: ${text(meta.operator)})`;
        default:
            return "";
    }
}

export function AuditClient() {
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
                const response = await adminFetch<AuditResponse>(`/api/admin/audit-logs?${query.toString()}`);
                if (active) {
                    setResult(response);
                    setError("");
                }
            } catch (reason) {
                if (active) setError(reason instanceof Error ? reason.message : "Erro ao carregar a auditoria.");
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

    return (
        <AdminShell>
            <div className="page-heading">
                <div>
                    <div className="eyebrow"><span className="eyebrow-dot" /> ADMINISTRAÇÃO</div>
                    <h1>Auditoria</h1>
                    <p>
                        Registro permanente das ações administrativas: quem fez, quando, de
                        onde e com qual motivo. Nenhuma linha pode ser alterada ou apagada.
                        Aprovações e rejeições ficam no histórico de moderação.
                    </p>
                </div>
            </div>

            <section aria-label="Filtros da auditoria" className="filter-bar history-filters">
                <label className="select-field">
                    <span className="sr-only">Filtrar por ação</span>
                    <select onChange={(event) => updateFilter(setAction, event.target.value)} value={action}>
                        <option value="">Todas as ações</option>
                        {(Object.keys(actionLabels) as AuditAction[]).map((key) => (
                            <option key={key} value={key}>{actionLabels[key]}</option>
                        ))}
                    </select>
                </label>
                <label className="select-field date-field">
                    <span>De</span>
                    <input max={to || undefined} onChange={(event) => updateFilter(setFrom, event.target.value)} type="date" value={from} />
                </label>
                <label className="select-field date-field">
                    <span>Até</span>
                    <input min={from || undefined} onChange={(event) => updateFilter(setTo, event.target.value)} type="date" value={to} />
                </label>
                <button
                    aria-label="Atualizar auditoria"
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

            {error && <div className="alert alert-error" role="alert">{error}</div>}

            <section aria-label="Registros de auditoria" className="table-card">
                <div className="table-scroll">
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Ação</th>
                                <th>Quem</th>
                                <th>Detalhes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading &&
                                Array.from({ length: 6 }).map((_, index) => (
                                    <tr key={`loading-${index}`}>
                                        <td colSpan={4}><span className="table-skeleton" /></td>
                                    </tr>
                                ))}
                            {!loading &&
                                result?.data.map((entry) => (
                                    <tr key={entry.id}>
                                        <td>
                                            <span className="table-primary">{formatDate(entry.created_at)}</span>
                                            {entry.ip && <span className="table-secondary">IP {entry.ip}</span>}
                                        </td>
                                        <td><span className="table-primary">{actionLabels[entry.action] ?? entry.action}</span></td>
                                        <td>
                                            {entry.actor ? (
                                                <>
                                                    <span className="table-primary">
                                                        {entry.actor.is_deleted ? "Conta removida" : entry.actor.name}
                                                    </span>
                                                    <span className="table-secondary">
                                                        {entry.actor.is_deleted ? "Ex-integrante da equipe" : entry.actor.email}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="table-primary">Script / sistema</span>
                                            )}
                                        </td>
                                        <td className="history-notes">
                                            <span className="table-primary">{describe(entry) || "—"}</span>
                                            <details className="audit-raw">
                                                <summary>Dados completos</summary>
                                                <pre>{JSON.stringify(entry.metadata, null, 2)}</pre>
                                            </details>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                {!loading && result?.data.length === 0 && (
                    <div className="empty-state">
                        <span className="empty-icon"><Icon name="shield" /></span>
                        <strong>Nenhum registro encontrado</strong>
                        <span>Altere os filtros para ver outras ações.</span>
                    </div>
                )}
                {result && result.pagination.totalPages > 1 && (
                    <div className="pagination">
                        <span>
                            Página {result.pagination.page} de {result.pagination.totalPages} · {result.pagination.total} registros
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
