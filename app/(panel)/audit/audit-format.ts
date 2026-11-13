import type { AuditAction, AuditLogEntry } from "@/lib/types";

export const actionLabels: Record<AuditAction, string> = {
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
export function describeAuditEntry(entry: AuditLogEntry): string {
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
