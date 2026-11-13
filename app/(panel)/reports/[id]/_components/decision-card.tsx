import { Icon } from "@/app/components/ui-icon";
import { formatStatus } from "@/lib/format";
import type { ModerationStatus } from "@/lib/types";

/** Mensagem ao usuário, observação interna e botões de aprovar/rejeitar. */
export function DecisionCard({
    status,
    canModerate,
    editable,
    saving,
    hasUnsavedChanges,
    publicMessage,
    internalNote,
    onPublicMessageChange,
    onInternalNoteChange,
    onDecide,
}: Readonly<{
    status: ModerationStatus;
    canModerate: boolean;
    editable: boolean;
    saving: boolean;
    hasUnsavedChanges: boolean;
    publicMessage: string;
    internalNote: string;
    onPublicMessageChange: (value: string) => void;
    onInternalNoteChange: (value: string) => void;
    onDecide: (status: Exclude<ModerationStatus, "PENDING">) => void;
}>) {
    const isPending = status === "PENDING";

    return (
        <section className="content-card decision-card">
            <div className="decision-heading">
                <div className="eyebrow detail-eyebrow">
                    <Icon name="alert" /> DECISÃO DE MODERAÇÃO
                </div>
                <span className="official-pill">OFICIAL</span>
            </div>
            <h2>Registrar análise</h2>
            <label className="form-label" htmlFor="public-message">
                Justificativa ou mensagem ao usuário
                {editable && " *"}
            </label>
            <textarea
                className="text-area"
                disabled={!editable || saving}
                id="public-message"
                maxLength={2000}
                onChange={(event) => onPublicMessageChange(event.target.value)}
                placeholder="Esta mensagem poderá ser apresentada ao usuário."
                value={publicMessage}
            />
            <label className="form-label" htmlFor="internal-note">
                Observação interna
            </label>
            <textarea
                className="text-area text-area-short"
                disabled={!editable || saving}
                id="internal-note"
                maxLength={4000}
                onChange={(event) => onInternalNoteChange(event.target.value)}
                placeholder="Visível somente para administradores."
                value={internalNote}
            />
            {isPending && !canModerate ? (
                <p className="decision-locked">
                    Sua conta pode consultar este relato, mas não tem
                    permissão para aprová-lo ou rejeitá-lo.
                </p>
            ) : editable ? (
                <div className="decision-actions">
                    <button
                        className="button button-primary"
                        disabled={saving || hasUnsavedChanges}
                        onClick={() => onDecide("APPROVED")}
                        type="button"
                    >
                        <Icon name="check" /> {saving ? "Salvando..." : "Aprovar relato"}
                    </button>
                    <button
                        className="button button-danger"
                        disabled={saving || hasUnsavedChanges}
                        onClick={() => onDecide("REJECTED")}
                        type="button"
                    >
                        <Icon name="close" /> Rejeitar relato
                    </button>
                </div>
            ) : (
                <p className="decision-locked">
                    Este relato já foi {formatStatus(status).toLowerCase()}.
                    A decisão é permanente.
                </p>
            )}
        </section>
    );
}
