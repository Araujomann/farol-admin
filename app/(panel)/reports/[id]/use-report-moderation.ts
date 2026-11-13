"use client";

import { useCallback, useEffect, useState } from "react";
import {
    decideAccident,
    fetchAccident,
    updateAccidentText,
} from "@/lib/api/moderation";
import { errorMessage } from "@/lib/errors";
import type { AccidentDetail, ModerationStatus } from "@/lib/types";

/** Estado do relato em análise: carregamento, edição do texto e decisão. */
export function useReportModeration(id: string) {
    const [accident, setAccident] = useState<AccidentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [publicMessage, setPublicMessage] = useState("");
    const [internalNote, setInternalNote] = useState("");
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const loadAccident = useCallback(async () => {
        try {
            const result = await fetchAccident(id);
            setAccident(result.data);
            setPublicMessage(result.data.moderation_message ?? "");
            setInternalNote(result.data.moderation_internal_note ?? "");
            setEditTitle(result.data.tipo_acidente);
            setEditDescription(result.data.description ?? "");
        } catch (reason) {
            setError(errorMessage(reason, "Erro ao carregar o relato."));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const timer = window.setTimeout(() => void loadAccident(), 0);
        return () => window.clearTimeout(timer);
    }, [loadAccident]);

    const hasUnsavedChanges =
        accident !== null &&
        (editTitle !== accident.tipo_acidente ||
            editDescription !== (accident.description ?? ""));

    async function saveEdits() {
        if (!accident || accident.moderation_status !== "PENDING") return;
        if (editTitle.trim().length < 3) {
            setError("O título do relato deve ter pelo menos 3 caracteres.");
            return;
        }

        setSaving(true);
        setError("");
        setNotice("");
        try {
            const result = await updateAccidentText(accident.id, {
                tipo_acidente: editTitle,
                description: editDescription,
            });
            setAccident(result.data);
            setEditTitle(result.data.tipo_acidente);
            setEditDescription(result.data.description ?? "");
            setNotice("Texto do relato atualizado.");
        } catch (reason) {
            setError(errorMessage(reason, "Não foi possível salvar as alterações."));
        } finally {
            setSaving(false);
        }
    }

    async function decide(status: Exclude<ModerationStatus, "PENDING">) {
        if (!accident) return;
        if (hasUnsavedChanges) {
            setError("Salve as alterações do relato antes de registrar a decisão.");
            return;
        }
        if (status === "REJECTED" && !publicMessage.trim()) {
            setError("Informe uma justificativa que poderá ser enviada ao usuário.");
            return;
        }
        const label = status === "APPROVED" ? "aprovar" : "rejeitar";
        if (!window.confirm(`Confirma ${label} este relato? Essa decisão não poderá ser alterada.`)) {
            return;
        }

        setSaving(true);
        setError("");
        setNotice("");
        try {
            const result = await decideAccident(accident.id, {
                status,
                publicMessage: publicMessage.trim(),
                internalNote: internalNote.trim(),
            });
            setAccident(result.data);
            setNotice(
                status === "APPROVED"
                    ? "Relato aprovado e elegível para publicação no mapa."
                    : "Relato rejeitado. A justificativa foi registrada para retorno ao usuário.",
            );
        } catch (reason) {
            setError(errorMessage(reason, "Não foi possível registrar a decisão."));
        } finally {
            setSaving(false);
        }
    }

    return {
        accident,
        loading,
        saving,
        error,
        notice,
        publicMessage,
        setPublicMessage,
        internalNote,
        setInternalNote,
        editTitle,
        setEditTitle,
        editDescription,
        setEditDescription,
        hasUnsavedChanges,
        saveEdits,
        decide,
    };
}
