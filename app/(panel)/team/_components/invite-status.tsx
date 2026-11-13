import { formatDate } from "@/lib/format";
import type { InviteStatus, ModeratorInvite } from "@/lib/types";

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

export const inviteFilters: Array<{ value: "" | InviteStatus; label: string }> = [
    { value: "", label: "Todos os convites" },
    { value: "PENDING", label: "Pendentes" },
    { value: "EXPIRED", label: "Expirados" },
    { value: "ACCEPTED", label: "Aceitos" },
    { value: "REVOKED", label: "Revogados" },
];

export function InviteStatusBadge({ status }: { status: InviteStatus }) {
    return (
        <span className={`status-badge ${inviteStatusClass[status]}`}>
            <span className="status-dot" />
            {inviteStatusLabels[status]}
        </span>
    );
}

export function describeInviteState(invite: ModeratorInvite) {
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
