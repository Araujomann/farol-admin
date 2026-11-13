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

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: "user" | "moderator" | "admin";
    is_email_verified: boolean;
    created_at: string;
    suspended_at: string | null;
    suspended_reason: string | null;
    suspended_by: TeamPerson | null;
}

export interface AdminUserDetail extends AdminUser {
    reports_count: number;
    comments_count: number;
    decisions_count: number;
    active_sessions: number;
}

export type AuditAction =
    | "MODERATOR_INVITE_CREATED"
    | "MODERATOR_INVITE_RESENT"
    | "MODERATOR_INVITE_REVOKED"
    | "MODERATOR_INVITE_ACCEPTED"
    | "MODERATOR_ROLE_REVOKED"
    | "REPORT_EDITED_BY_STAFF"
    | "REPORT_DELETED_BY_STAFF"
    | "COMMENT_DELETED_BY_STAFF"
    | "IMAGE_DELETED_BY_STAFF"
    | "USER_SUSPENDED"
    | "USER_REACTIVATED"
    | "USER_SESSIONS_REVOKED"
    | "SETTINGS_UPDATED"
    | "ROLE_GRANTED_BY_SCRIPT";

export interface AuditLogEntry {
    id: string;
    action: AuditAction;
    target_type: string;
    target_id: string | null;
    metadata: Record<string, unknown>;
    ip: string | null;
    user_agent: string | null;
    created_at: string;
    /** `null`: ação de script/sistema. */
    actor: ModerationHistoryActor | null;
}

export interface PlatformSettingItem {
    key: string;
    value: number;
    default: number;
    min: number;
    max: number;
    description: string;
    updated_at: string | null;
    updated_by: TeamPerson | null;
}
