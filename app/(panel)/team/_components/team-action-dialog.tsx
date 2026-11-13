import type { PendingTeamAction } from "@/app/(panel)/team/use-team-actions";
import { ConfirmDialog } from "@/app/components/confirm-dialog";

/** Confirmação de revogar convite ou remover moderador. */
export function TeamActionDialog({
    action,
    removalReason,
    confirming,
    onRemovalReasonChange,
    onConfirm,
    onCancel,
}: Readonly<{
    action: PendingTeamAction;
    removalReason: string;
    confirming: boolean;
    onRemovalReasonChange: (value: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}>) {
    if (action.kind === "revoke-invite") {
        return (
            <ConfirmDialog
                confirmLabel="Revogar convite"
                description={`O link enviado para ${action.invite.email} deixará de funcionar.`}
                icon="close"
                onCancel={onCancel}
                onConfirm={onConfirm}
                pending={confirming}
                pendingLabel="Revogando..."
                title="Revogar este convite?"
            />
        );
    }

    return (
        <ConfirmDialog
            confirmDisabled={removalReason.trim().length < 3}
            confirmLabel="Remover permissão"
            description={`${action.member.name} voltará a ser um usuário comum e todas as sessões abertas serão encerradas. As decisões já tomadas continuam no histórico.`}
            icon="users"
            onCancel={onCancel}
            onConfirm={onConfirm}
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
                    onChange={(event) => onRemovalReasonChange(event.target.value)}
                    value={removalReason}
                />
            </label>
        </ConfirmDialog>
    );
}
