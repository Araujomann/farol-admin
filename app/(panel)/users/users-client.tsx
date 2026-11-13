"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/app/components/admin-shell";
import { ConfirmDialog } from "@/app/components/confirm-dialog";
import { Icon } from "@/app/components/ui-icon";
import { adminFetch } from "@/lib/client-api";
import { formatDate } from "@/lib/format";
import { formatRole } from "@/lib/permissions";
import type { AdminUser, AdminUserDetail, Pagination } from "@/lib/types";

interface UsersResponse {
    data: AdminUser[];
    pagination: Pagination;
}

type PendingAction =
    | { kind: "suspend"; user: AdminUser }
    | { kind: "reactivate"; user: AdminUser }
    | { kind: "sessions"; user: AdminUser };

export function UsersClient({ currentUserId }: { currentUserId: string }) {
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [reloadKey, setReloadKey] = useState(0);
    const [result, setResult] = useState<UsersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [expandedId, setExpandedId] = useState("");
    const [details, setDetails] = useState<Record<string, AdminUserDetail>>({});

    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [reason, setReason] = useState("");
    const [confirming, setConfirming] = useState(false);
    const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        let active = true;
        const query = new URLSearchParams({ page: String(page), limit: "20" });
        if (search.trim()) query.set("search", search.trim());
        if (role) query.set("role", role);
        if (status) query.set("status", status);

        const timer = window.setTimeout(async () => {
            try {
                const response = await adminFetch<UsersResponse>(`/api/admin/users?${query.toString()}`);
                if (active) {
                    setResult(response);
                    setError("");
                }
            } catch (reason) {
                if (active) setError(reason instanceof Error ? reason.message : "Erro ao carregar usuários.");
            } finally {
                if (active) setLoading(false);
            }
        }, 200);

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [page, reloadKey, role, search, status]);

    function updateFilter(setter: (value: string) => void, value: string) {
        setLoading(true);
        setPage(1);
        setter(value);
    }

    async function toggleDetails(user: AdminUser) {
        if (expandedId === user.id) {
            setExpandedId("");
            return;
        }
        setExpandedId(user.id);
        try {
            const response = await adminFetch<{ data: AdminUserDetail }>(`/api/admin/users/${user.id}`);
            setDetails((current) => ({ ...current, [user.id]: response.data }));
        } catch (reason) {
            setNotice({ tone: "error", text: reason instanceof Error ? reason.message : "Erro ao carregar detalhes." });
        }
    }

    const closeDialog = useCallback(() => {
        setPendingAction(null);
        setReason("");
    }, []);

    async function confirmAction() {
        if (!pendingAction) return;
        const { kind, user } = pendingAction;
        setConfirming(true);
        setNotice(null);
        try {
            if (kind === "suspend") {
                await adminFetch(`/api/admin/users/${user.id}/suspend`, {
                    method: "POST",
                    body: JSON.stringify({ reason: reason.trim() }),
                });
                setNotice({ tone: "success", text: `${user.name} foi suspenso(a). As sessões abertas foram encerradas.` });
            } else if (kind === "reactivate") {
                await adminFetch(`/api/admin/users/${user.id}/reactivate`, { method: "POST" });
                setNotice({ tone: "success", text: `${user.name} pode entrar novamente.` });
            } else {
                const response = await adminFetch<{ data: { revoked_sessions: number } }>(
                    `/api/admin/users/${user.id}/sessions/revoke`,
                    { method: "POST" },
                );
                setNotice({
                    tone: "success",
                    text: `${response.data.revoked_sessions} sessão(ões) de ${user.name} encerrada(s).`,
                });
            }
            setDetails((current) => {
                const next = { ...current };
                delete next[user.id];
                return next;
            });
            setExpandedId("");
            setLoading(true);
            setReloadKey((value) => value + 1);
        } catch (reason) {
            setNotice({ tone: "error", text: reason instanceof Error ? reason.message : "Não foi possível concluir a ação." });
        } finally {
            setConfirming(false);
            setPendingAction(null);
            setReason("");
        }
    }

    return (
        <AdminShell>
            <div className="page-heading">
                <div>
                    <div className="eyebrow"><span className="eyebrow-dot" /> ADMINISTRAÇÃO</div>
                    <h1>Usuários</h1>
                    <p>
                        Consulte contas, suspenda quem violar as regras da comunidade e
                        encerre sessões. Ações sobre administradores não são permitidas aqui.
                    </p>
                </div>
            </div>

            <section aria-label="Filtros de usuários" className="filter-bar history-filters">
                <label className="search-field">
                    <Icon name="search" />
                    <span className="sr-only">Buscar por nome ou e-mail</span>
                    <input
                        onChange={(event) => updateFilter(setSearch, event.target.value)}
                        placeholder="Buscar por nome ou e-mail..."
                        value={search}
                    />
                </label>
                <label className="select-field">
                    <span className="sr-only">Filtrar por papel</span>
                    <select onChange={(event) => updateFilter(setRole, event.target.value)} value={role}>
                        <option value="">Todos os papéis</option>
                        <option value="user">Usuários</option>
                        <option value="moderator">Moderadores</option>
                        <option value="admin">Administradores</option>
                    </select>
                </label>
                <label className="select-field">
                    <span className="sr-only">Filtrar por situação</span>
                    <select onChange={(event) => updateFilter(setStatus, event.target.value)} value={status}>
                        <option value="">Todas as situações</option>
                        <option value="active">Ativas</option>
                        <option value="suspended">Suspensas</option>
                    </select>
                </label>
            </section>

            {notice && (
                <div className={`alert ${notice.tone === "success" ? "alert-success" : "alert-error"}`} role="status">
                    {notice.text}
                </div>
            )}
            {error && <div className="alert alert-error" role="alert">{error}</div>}

            <section aria-label="Contas" className="table-card">
                <div className="table-scroll">
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>Conta</th>
                                <th>Papel</th>
                                <th>Situação</th>
                                <th>Criada em</th>
                                <th><span className="sr-only">Ações</span></th>
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
                                result?.data.map((user) => {
                                    const actionable = user.role !== "admin" && user.id !== currentUserId;
                                    const detail = details[user.id];
                                    return (
                                        <Fragment key={user.id}>
                                            <tr>
                                                <td>
                                                    <button
                                                        aria-expanded={expandedId === user.id}
                                                        className="text-button user-name-button"
                                                        onClick={() => void toggleDetails(user)}
                                                        type="button"
                                                    >
                                                        {user.name}
                                                        {user.id === currentUserId && " (você)"}
                                                    </button>
                                                    <span className="table-secondary">
                                                        {user.email}
                                                        {!user.is_email_verified && " · e-mail não verificado"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`role-tag ${user.role === "admin" ? "role-tag-admin" : ""}`}>
                                                        {formatRole(user.role)}
                                                    </span>
                                                </td>
                                                <td>
                                                    {user.suspended_at ? (
                                                        <>
                                                            <span className="status-badge status-rejected">
                                                                <span className="status-dot" /> Suspensa
                                                            </span>
                                                            <span className="table-secondary">
                                                                {formatDate(user.suspended_at)}
                                                                {user.suspended_by && ` por ${user.suspended_by.name}`}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="status-badge status-approved">
                                                            <span className="status-dot" /> Ativa
                                                        </span>
                                                    )}
                                                </td>
                                                <td><span className="table-primary">{formatDate(user.created_at)}</span></td>
                                                <td>
                                                    {actionable && (
                                                        <div className="row-actions">
                                                            <button
                                                                className="button button-outline button-small"
                                                                onClick={() => setPendingAction({ kind: "sessions", user })}
                                                                type="button"
                                                            >
                                                                Encerrar sessões
                                                            </button>
                                                            {user.suspended_at ? (
                                                                <button
                                                                    className="button button-primary button-small"
                                                                    onClick={() => setPendingAction({ kind: "reactivate", user })}
                                                                    type="button"
                                                                >
                                                                    Reativar
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="button button-danger button-small"
                                                                    onClick={() => setPendingAction({ kind: "suspend", user })}
                                                                    type="button"
                                                                >
                                                                    Suspender
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                            {expandedId === user.id && (
                                                <tr className="user-detail-row">
                                                    <td colSpan={5}>
                                                        {detail ? (
                                                            <dl className="user-detail">
                                                                <div><dt>Relatos</dt><dd>{detail.reports_count}</dd></div>
                                                                <div><dt>Comentários</dt><dd>{detail.comments_count}</dd></div>
                                                                <div><dt>Decisões de moderação</dt><dd>{detail.decisions_count}</dd></div>
                                                                <div><dt>Sessões ativas</dt><dd>{detail.active_sessions}</dd></div>
                                                                {detail.suspended_reason && (
                                                                    <div className="user-detail-wide">
                                                                        <dt>Motivo da suspensão</dt>
                                                                        <dd>{detail.suspended_reason}</dd>
                                                                    </div>
                                                                )}
                                                            </dl>
                                                        ) : (
                                                            <span className="table-skeleton" />
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
                {!loading && result?.data.length === 0 && (
                    <div className="empty-state">
                        <span className="empty-icon"><Icon name="user" /></span>
                        <strong>Nenhuma conta encontrada</strong>
                        <span>Altere a busca ou os filtros.</span>
                    </div>
                )}
                {result && result.pagination.totalPages > 1 && (
                    <div className="pagination">
                        <span>
                            Página {result.pagination.page} de {result.pagination.totalPages} · {result.pagination.total} contas
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

            {pendingAction?.kind === "suspend" && (
                <ConfirmDialog
                    confirmDisabled={reason.trim().length < 3}
                    confirmLabel="Suspender conta"
                    description={`${pendingAction.user.name} não conseguirá entrar no app nem no painel até ser reativado(a). As sessões abertas serão encerradas agora.`}
                    icon="lock"
                    onCancel={closeDialog}
                    onConfirm={() => void confirmAction()}
                    pending={confirming}
                    pendingLabel="Suspendendo..."
                    title="Suspender esta conta?"
                >
                    <label className="dialog-field">
                        <span className="form-label">Motivo (fica na auditoria)</span>
                        <textarea
                            autoFocus
                            className="text-area text-area-short"
                            maxLength={500}
                            onChange={(event) => setReason(event.target.value)}
                            value={reason}
                        />
                    </label>
                </ConfirmDialog>
            )}
            {pendingAction?.kind === "reactivate" && (
                <ConfirmDialog
                    confirmLabel="Reativar conta"
                    description={`${pendingAction.user.name} poderá entrar novamente.`}
                    icon="check"
                    onCancel={closeDialog}
                    onConfirm={() => void confirmAction()}
                    pending={confirming}
                    pendingLabel="Reativando..."
                    title="Reativar esta conta?"
                    tone="primary"
                />
            )}
            {pendingAction?.kind === "sessions" && (
                <ConfirmDialog
                    confirmLabel="Encerrar sessões"
                    description={`${pendingAction.user.name} precisará entrar de novo em todos os aparelhos.`}
                    icon="logout"
                    onCancel={closeDialog}
                    onConfirm={() => void confirmAction()}
                    pending={confirming}
                    pendingLabel="Encerrando..."
                    title="Encerrar todas as sessões?"
                />
            )}
        </AdminShell>
    );
}
