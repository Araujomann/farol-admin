import {
    describeInviteState,
    inviteFilters,
    InviteStatusBadge,
} from "@/app/(panel)/team/_components/invite-status";
import { EmptyState } from "@/app/components/empty-state";
import { TableSkeletonRows } from "@/app/components/table-skeleton-rows";
import type { InvitesResponse } from "@/lib/api/team";
import { formatDate } from "@/lib/format";
import type { InviteStatus, ModeratorInvite } from "@/lib/types";

export function InvitesTable({
    invites,
    filter,
    busyInviteId,
    onFilterChange,
    onResend,
    onRevoke,
}: Readonly<{
    /** `null` enquanto carrega. */
    invites: InvitesResponse | null;
    filter: "" | InviteStatus;
    /** Convite com reenvio em andamento. */
    busyInviteId: string;
    onFilterChange: (value: "" | InviteStatus) => void;
    onResend: (invite: ModeratorInvite) => void;
    onRevoke: (invite: ModeratorInvite) => void;
}>) {
    return (
        <section aria-labelledby="invites-title" className="team-section">
            <div className="team-section-heading">
                <h2 id="invites-title">Convites</h2>
                <label className="select-field">
                    <span className="sr-only">Filtrar convites</span>
                    <select
                        onChange={(event) => onFilterChange(event.target.value as "" | InviteStatus)}
                        value={filter}
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
                            {!invites && <TableSkeletonRows columns={5} rows={1} />}
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
                                                        onClick={() => onResend(invite)}
                                                        type="button"
                                                    >
                                                        {busyInviteId === invite.id ? "Reenviando..." : "Reenviar"}
                                                    </button>
                                                    <button
                                                        className="button button-danger button-small"
                                                        disabled={busyInviteId === invite.id}
                                                        onClick={() => onRevoke(invite)}
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
                    <EmptyState
                        description="Os convites enviados aparecem aqui com o status de cada um."
                        icon="mail"
                        title={<>Nenhum convite {filter ? "com este status" : "enviado ainda"}</>}
                    />
                )}
            </div>
        </section>
    );
}
