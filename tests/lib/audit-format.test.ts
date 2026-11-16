import { describe, expect, it } from "vitest";
import { actionLabels, describeAuditEntry } from "@/app/(panel)/audit/audit-format";
import type { AuditAction, AuditLogEntry } from "@/lib/types";

function entry(action: AuditAction, metadata: Record<string, unknown>): AuditLogEntry {
    return {
        id: "a1",
        action,
        target_type: "user",
        target_id: null,
        metadata,
        ip: null,
        user_agent: null,
        created_at: "2026-01-01T00:00:00.000Z",
        actor: null,
    };
}

describe("describeAuditEntry", () => {
    it("resume convites pelo e-mail", () => {
        expect(describeAuditEntry(entry("MODERATOR_INVITE_CREATED", { email: "a@b.c" }))).toBe("a@b.c");
    });

    it("mostra travessão quando não há papel anterior", () => {
        expect(describeAuditEntry(entry("MODERATOR_INVITE_ACCEPTED", {}))).toBe("Papel anterior: —");
    });

    it("inclui nome, e-mail e motivo da suspensão", () => {
        expect(
            describeAuditEntry(
                entry("USER_SUSPENDED", { name: "Ana", email: "ana@x.com", reason: "spam" }),
            ),
        ).toBe("Ana (ana@x.com) · Motivo: spam");
    });

    it("conta as sessões só quando a API manda o número", () => {
        const meta = { name: "Ana", email: "ana@x.com" };
        expect(describeAuditEntry(entry("USER_SESSIONS_REVOKED", { ...meta, revoked_sessions: 0 }))).toBe(
            "Ana (ana@x.com) · 0 sessão(ões)",
        );
        expect(describeAuditEntry(entry("USER_REACTIVATED", meta))).toBe("Ana (ana@x.com)");
    });

    it("lista os campos editados de um relato", () => {
        expect(
            describeAuditEntry(entry("REPORT_EDITED_BY_STAFF", { after: { descricao: "x", gravidade: "y" } })),
        ).toBe("Campos: descricao, gravidade");
        expect(describeAuditEntry(entry("REPORT_EDITED_BY_STAFF", {}))).toBe("Sem alteração de campos");
    });

    it("corta comentários apagados em 120 caracteres", () => {
        const text = describeAuditEntry(entry("COMMENT_DELETED_BY_STAFF", { body: "a".repeat(200) }));
        expect(text).toBe(`“${"a".repeat(120)}”`);
    });

    it("descreve configurações alteradas com rótulos conhecidos ou a chave crua", () => {
        expect(
            describeAuditEntry(
                entry("SETTINGS_UPDATED", {
                    before: { invite_ttl_hours: 24, other: "a" },
                    after: { invite_ttl_hours: 48, other: "b" },
                }),
            ),
        ).toBe("validade do convite (h): 24 → 48 · other: a → b");
    });

    it("ignora metadados que não são texto nem número", () => {
        expect(describeAuditEntry(entry("MODERATOR_INVITE_REVOKED", { email: { nested: true } }))).toBe("");
    });

    it("tem rótulo para toda ação e devolve vazio para ação desconhecida", () => {
        for (const label of Object.values(actionLabels)) expect(label).not.toBe("");
        expect(describeAuditEntry(entry("UNKNOWN" as AuditAction, {}))).toBe("");
    });
});
