export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type Severity = "low" | "medium" | "high" | "critical";

export interface Accident {
    id: string;
    tipo_acidente: string;
    classificacao_acidente: "com_vitima" | "sem_vitima";
    condicao_meteorologica: "ceu_claro" | "chuva" | "nublado" | "garoa";
    description: string | null;
    latitude: number;
    longitude: number;
    occurred_at: string;
    severity: Severity;
    source: "APP" | "PRF";
    moderation_status: ModerationStatus;
    moderation_message: string | null;
    moderation_internal_note: string | null;
    moderated_at: string | null;
    created_by_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface AccidentListItem extends Accident {
    created_by: { id: string; name: string; email: string } | null;
}

export interface ModerationHistoryEntry {
    id: string;
    previous_status: ModerationStatus;
    new_status: ModerationStatus;
    public_message: string | null;
    internal_note: string | null;
    created_at: string;
    moderated_by: { id: string; name: string; email: string };
}

export interface AccidentDetail extends Accident {
    created_by: { id: string; name: string; email: string } | null;
    comments: Array<{
        id: string;
        created_by_id: string;
        body: string;
        created_at: string;
    }>;
    images: Array<{
        id: string;
        image_url: string;
        caption: string | null;
        created_at: string;
    }>;
    moderation_history: ModerationHistoryEntry[];
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ApiError {
    error?: { code?: string; message?: string };
}

export interface ApiEnvelope<T> {
    data: T;
}

export interface ModerationHistoryActor {
    id: string;
    name: string;
    email: string;
    /** Conta removida e anonimizada; a decisão continua atribuída a ela. */
    is_deleted: boolean;
}

export interface ModerationHistoryItem {
    id: string;
    previous_status: ModerationStatus;
    new_status: ModerationStatus;
    public_message: string | null;
    internal_note: string | null;
    created_at: string;
    moderated_by: ModerationHistoryActor;
    accident: { id: string; tipo_acidente: string; severity: Severity };
}

export interface ModerationHistoryModerator extends ModerationHistoryActor {
    decisions_count: number;
}

export type InviteStatus = "PENDING" | "EXPIRED" | "ACCEPTED" | "REVOKED";

export interface TeamPerson {
    id: string;
    name: string;
}

export interface ModeratorInvite {
    id: string;
    email: string;
    status: InviteStatus;
    expires_at: string;
    created_at: string;
    last_sent_at: string;
    send_count: number;
    invited_by: TeamPerson;
    accepted_at: string | null;
    accepted_by: TeamPerson | null;
    revoked_at: string | null;
    /** `null` com `revoked_at` preenchido: encerrado pelo sistema. */
    revoked_by: TeamPerson | null;
}

export interface InviteDelivery {
    invite: ModeratorInvite;
    email_sent: boolean;
}

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: "moderator" | "admin";
    decisions_count: number;
    created_at: string;
    joined_at: string | null;
}
