"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/app/components/admin-shell";
import { ConfirmDialog } from "@/app/components/confirm-dialog";
import { Can, useCan } from "@/app/components/permissions-provider";
import { Icon } from "@/app/components/ui-icon";
import { adminFetch } from "@/lib/client-api";
import { formatDate } from "@/lib/format";
import type {
    InviteDelivery,
    InviteStatus,
    ModeratorInvite,
    Pagination,
    TeamMember,
} from "@/lib/types";

const inviteStatusLabels: Record<InviteStatus, string> = {
    PENDING: "Pendente",
    EXPIRED: "Expirado",
    ACCEPTED: "Aceito",
    REVOKED: "Revogado",
};

const inviteStatusClass: Record<InviteStatus, string> = {
    PENDING: "status-pending",
    EXPIRED: "status-expired",
    ACCEPTED: "status-approved",
    REVOKED: "status-rejected",
};

const inviteFilters: Array<{ value: "" | InviteStatus; label: string }> = [
    { value: "", label: "Todos os convites" },
    { value: "PENDING", label: "Pendentes" },
    { value: "EXPIRED", label: "Expirados" },
    { value: "ACCEPTED", label: "Aceitos" },
    { value: "REVOKED", label: "Revogados" },
];

function InviteStatusBadge({ status }: { status: InviteStatus }) {
    return (
        <span className={`status-badge ${inviteStatusClass[status]}`}>
            <span className="status-dot" />
            {inviteStatusLabels[status]}
        </span>
    );
}

function describeInviteState(invite: ModeratorInvite) {
    switch (invite.status) {
        case "PENDING":
            return `Vale até ${formatDate(invite.expires_at)}`;
        case "EXPIRED":
            return `Venceu em ${formatDate(invite.expires_at)}`;
        case "ACCEPTED":
            return `Aceito em ${formatDate(invite.accepted_at ?? invite.expires_at)}`;
        case "REVOKED":
            return invite.revoked_by
                ? `Revogado por ${invite.revoked_by.name}`
                : "Substituído por um convite novo";
    }
}

type PendingAction =
    | { kind: "revoke-invite"; invite: ModeratorInvite }
    | { kind: "remove-moderator"; member: TeamMember };

export function TeamClient({ currentUserId }: { currentUserId: string }) {
    const canInvite = useCan("moderators:invite");
    const canRemove = useCan("moderators:revoke");

    const [team, setTeam] = useState<TeamMember[] | null>(null);
    const [invites, setInvites] = useState<{ data: ModeratorInvite[]; pagination: Pagination } | null>(null);
    const [inviteFilter, setInviteFilter] = useState<"" | InviteStatus>("");
    const [reloadKey, setReloadKey] = useState(0);
    const [loadError, setLoadError] = useState("");

    const [inviteFormOpen, setInviteFormOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [sending, setSending] = useState(false);

    const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
    const [busyInviteId, setBusyInviteId] = useState("");
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [removalReason, setRemovalReason] = useState("");
    const [confirming, setConfirming] = useState(false);

    const reload = useCallback(() => setReloadKey((value) => value + 1), []);

    useEffect(() => {
        if (!canRemove) return;
        let active = true;
        adminFetch<{ data: TeamMember[] }>("/api/admin/moderators")
            .then((response) => active && setTeam(response.data))
            .catch((reason) => active && setLoadError(reason instanceof Error ? reason.message : "Erro ao carregar a equipe."));
        return () => {
            active = false;
        };
    }, [canRemove, reloadKey]);

    useEffect(() => {
        let active = true;
        const query = new URLSearchParams({ limit: "50" });
        if (inviteFilter) query.set("status", inviteFilter);
        adminFetch<{ data: ModeratorInvite[]; pagination: Pagination }>(
            `/api/admin/moderator-invites?${query.toString()}`,
        )
            .then((response) => active && setInvites(response))
            .catch((reason) => active && setLoadError(reason instanceof Error ? reason.message : "Erro ao carregar os convites."));
        return () => {
            active = false;
        };
    }, [inviteFilter, reloadKey]);

    function deliveryNotice(delivery: InviteDelivery, verb: string) {
        setNotice(
            delivery.email_sent
                ? {
                      tone: "success",
                      text: `Convite ${verb} para ${delivery.invite.email}. O link vale até ${formatDate(delivery.invite.expires_at)}.`,
                  }
                : {
                      tone: "error",
                      text: `O convite para ${delivery.invite.email} foi ${verb === "enviado" ? "criado" : "renovado"}, mas o e-mail não pôde ser enviado. Tente reenviar em instantes.`,
                  },
        );
    }

    async function sendInvite(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSending(true);
        setNotice(null);
        try {
            const result = await adminFetch<{ data: InviteDelivery }>("/api/admin/moderator-invites", {
                method: "POST",
                body: JSON.stringify({ email: inviteEmail.trim() }),
            });
            deliveryNotice(result.data, "enviado");
            setInviteEmail("");
            setInviteFormOpen(false);
            reload();
        } catch (reason) {
            setNotice({ tone: "error", text: reason instanceof Error ? reason.message : "Não foi possível enviar o convite." });
        } finally {
            setSending(false);
        }
    }

    async function resend(invite: ModeratorInvite) {
        setBusyInviteId(invite.id);
        setNotice(null);
        try {
            const result = await adminFetch<{ data: InviteDelivery }>(
                `/api/admin/moderator-invites/${invite.id}/resend`,
                { method: "POST" },
            );
            deliveryNotice(result.data, "reenviado");
            reload();
        } catch (reason) {
            setNotice({ tone: "error", text: reason instanceof Error ? reason.message : "Não foi possível reenviar o convite." });
        } finally {
            setBusyInviteId("");
        }
    }

    async function confirmPendingAction() {
        if (!pendingAction) return;
        setConfirming(true);
        setNotice(null);
        try {
            if (pendingAction.kind === "revoke-invite") {
                await adminFetch(`/api/admin/moderator-invites/${pendingAction.invite.id}/revoke`, {
                    method: "POST",
                });
                setNotice({ tone: "success", text: `Convite para ${pendingAction.invite.email} revogado. O link deixou de funcionar.` });
            } else {
                await adminFetch(`/api/admin/moderators/${pendingAction.member.id}/revoke`, {
                    method: "POST",
                    body: JSON.stringify({ reason: removalReason.trim() }),
                });
                setNotice({
                    tone: "success",
                    text: `${pendingAction.member.name} não é mais moderador. As sessões abertas foram encerradas.`,
                });
            }
            setPendingAction(null);
            setRemovalReason("");
            reload();
        } catch (reason) {
            setNotice({ tone: "error", text: reason instanceof Error ? reason.message : "Não foi possível concluir a ação." });
            setPendingAction(null);
        } finally {
            setConfirming(false);
        }
    }

    const closeDialog = useCallback(() => {
        setPendingAction(null);
        setRemovalReason("");
    }, []);

    return (
        <AdminShell>
            <div className="page-heading">
                <div>
                    <div className="eyebrow"><span className="eyebrow-dot" /> ADMINISTRAÇÃO</div>
                    <h1>Equipe e convites</h1>
                    <p>
                        Convide moderadores por e-mail, acompanhe os convites e remova
                        permissões quando necessário. Todas as ações ficam na auditoria.
                    </p>
                </div>
                <Can permission="moderators:invite">
                    <button
                        className="button button-primary"
                        onClick={() => setInviteFormOpen((open) => !open)}
                        type="button"
                    >
                        <Icon name="mail" /> Convidar moderador
                    </button>
                </Can>
            </div>

            {canInvite && inviteFormOpen && (
                <form className="content-card invite-create-form" onSubmit={sendInvite}>
                    <label className="sr-only" htmlFor="invite-email">E-mail do convidado</label>
                    <input
                        autoFocus
                        className="text-input"
                        id="invite-email"
                        maxLength={254}
                        onChange={(event) => setInviteEmail(event.target.value)}
                        placeholder="email@exemplo.com"
                        required
                        type="email"
                        value={inviteEmail}
                    />
                    <button className="button button-primary" disabled={sending} type="submit">
                        {sending ? "Enviando..." : "Enviar convite"}
                    </button>
                    <button
                        className="button button-outline"
                        disabled={sending}
                        onClick={() => setInviteFormOpen(false)}
                        type="button"
                    >
                        Cancelar
                    </button>
                </form>
            )}

            {notice && (
                <div className={`alert ${notice.tone === "success" ? "alert-success" : "alert-error"}`} role="status">
                    {notice.text}
                </div>
            )}
            {loadError && <div className="alert alert-error" role="alert">{loadError}</div>}

            {canRemove && (
                <section aria-labelledby="team-title" className="team-section">
                    <div className="team-section-heading">
                        <h2 id="team-title">Equipe atual</h2>
                        <span className="subtle-count">{team?.length ?? "—"}</span>
                    </div>
                    <div className="table-card">
                        <div className="table-scroll">
                            <table className="reports-table">
                                <thead>
                                    <tr>
                                        <th>Pessoa</th>
                                        <th>Papel</th>
                                        <th>Decisões</th>
                                        <th>Na equipe desde</th>
                                        <th><span className="sr-only">Ações</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!team && (
                                        <tr><td colSpan={5}><span className="table-skeleton" /></td></tr>
                                    )}
                                    {team?.map((member) => (
                                        <tr key={member.id}>
                                            <td>
                                                <span className="table-primary">
                                                    {member.name}
                                                    {member.id === currentUserId && " (você)"}
                                                </span>
                                                <span className="table-secondary">{member.email}</span>
                                            </td>
                                            <td>
                                                <span className={`role-tag ${member.role === "admin" ? "role-tag-admin" : ""}`}>
                                                    {member.role === "admin" ? "Administrador" : "Moderador"}
                                                </span>
                                            </td>
                                            <td><span className="table-primary">{member.decisions_count}</span></td>
                                            <td>
                                                <span className="table-primary">
                                                    {formatDate(member.joined_at ?? member.created_at)}
                                                </span>
                                                <span className="table-secondary">
                                                    {member.joined_at ? "Por convite" : "Conta criada"}
                                                </span>
                                            </td>
                                            <td>
                                                {member.role === "moderator" && member.id !== currentUserId && (
                                                    <div className="row-actions">
                                                        <button
                                                            className="button button-danger button-small"
                                                            onClick={() => setPendingAction({ kind: "remove-moderator", member })}
                                                            type="button"
                                                        >
                                                            Remover permissão
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            )}

            <section aria-labelledby="invites-title" className="team-section">
                <div className="team-section-heading">
                    <h2 id="invites-title">Convites</h2>
                    <label className="select-field">
                        <span className="sr-only">Filtrar convites</span>
                        <select
                            onChange={(event) => setInviteFilter(event.target.value as "" | InviteStatus)}
                            value={inviteFilter}
                        >
                            {inviteFilters.map((item) => (
                                <option key={item.value} value={item.value}>{item.label}</option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className="table-card">
                    <div className="table-scroll">
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>E-mail</th>
                                    <th>Status</th>
                                    <th>Enviado por</th>
                                    <th>Situação</th>
                                    <th><span className="sr-only">Ações</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {!invites && (
                                    <tr><td colSpan={5}><span className="table-skeleton" /></td></tr>
                                )}
                                {invites?.data.map((invite) => {
                                    const open = invite.status === "PENDING" || invite.status === "EXPIRED";
                                    return (
                                        <tr key={invite.id}>
                                            <td>
                                                <span className="table-primary">{invite.email}</span>
                                                <span className="table-secondary">
                                                    {invite.send_count > 1 ? `${invite.send_count}º envio` : "1º envio"} · {formatDate(invite.last_sent_at)}
                                                </span>
                                            </td>
                                            <td><InviteStatusBadge status={invite.status} /></td>
                                            <td><span className="table-primary">{invite.invited_by.name}</span></td>
                                            <td><span className="table-secondary">{describeInviteState(invite)}</span></td>
                                            <td>
                                                {open && (
                                                    <div className="row-actions">
                                                        <button
                                                            className="button button-outline button-small"
                                                            disabled={busyInviteId === invite.id}
                                                            onClick={() => void resend(invite)}
                                                            type="button"
                                                        >
                                                            {busyInviteId === invite.id ? "Reenviando..." : "Reenviar"}
                                                        </button>
                                                        <button
                                                            className="button button-danger button-small"
                                                            disabled={busyInviteId === invite.id}
                                                            onClick={() => setPendingAction({ kind: "revoke-invite", invite })}
                                                            type="button"
                                                        >
                                                            Revogar
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {invites?.data.length === 0 && (
                        <div className="empty-state">
                            <span className="empty-icon"><Icon name="mail" /></span>
                            <strong>Nenhum convite {inviteFilter ? "com este status" : "enviado ainda"}</strong>
                            <span>Os convites enviados aparecem aqui com o status de cada um.</span>
                        </div>
                    )}
                </div>
            </section>

            {pendingAction?.kind === "revoke-invite" && (
                <ConfirmDialog
                    confirmLabel="Revogar convite"
                    description={`O link enviado para ${pendingAction.invite.email} deixará de funcionar.`}
                    icon="close"
                    onCancel={closeDialog}
                    onConfirm={() => void confirmPendingAction()}
                    pending={confirming}
                    pendingLabel="Revogando..."
                    title="Revogar este convite?"
                />
            )}
            {pendingAction?.kind === "remove-moderator" && (
                <ConfirmDialog
                    confirmDisabled={removalReason.trim().length < 3}
                    confirmLabel="Remover permissão"
                    description={`${pendingAction.member.name} voltará a ser um usuário comum e todas as sessões abertas serão encerradas. As decisões já tomadas continuam no histórico.`}
                    icon="users"
                    onCancel={closeDialog}
                    onConfirm={() => void confirmPendingAction()}
                    pending={confirming}
                    pendingLabel="Removendo..."
                    title="Remover permissão de moderador?"
                >
                    <label className="dialog-field">
                        <span className="form-label">Motivo (fica na auditoria)</span>
                        <textarea
                            autoFocus
                            className="text-area text-area-short"
                            maxLength={500}
                            onChange={(event) => setRemovalReason(event.target.value)}
                            value={removalReason}
                        />
                    </label>
                </ConfirmDialog>
            )}
        </AdminShell>
    );
}
