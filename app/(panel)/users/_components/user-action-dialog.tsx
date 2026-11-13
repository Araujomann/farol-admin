import type { PendingUserAction } from "@/app/(panel)/users/use-users";
import { ConfirmDialog } from "@/app/components/confirm-dialog";

/** Confirmação de suspender, reativar ou encerrar as sessões de uma conta. */
export function UserActionDialog({
    action,
    reason,
    confirming,
    onReasonChange,
    onConfirm,
    onCancel,
}: Readonly<{
    action: PendingUserAction;
    reason: string;
    confirming: boolean;
    onReasonChange: (value: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}>) {
    switch (action.kind) {
        case "suspend":
            return (
                <ConfirmDialog
                    confirmDisabled={reason.trim().length < 3}
                    confirmLabel="Suspender conta"
                    description={`${action.user.name} não conseguirá entrar no app nem no painel até ser reativado(a). As sessões abertas serão encerradas agora.`}
                    icon="lock"
                    onCancel={onCancel}
                    onConfirm={onConfirm}
                    pending={confirming}
                    pendingLabel="Suspendendo..."
                    title="Suspender esta conta?"
                >
                    <label className="dialog-field">
                        <span className="form-label">Motivo (fica na auditoria)</span>
                        <textarea
                            autoFocus
                            className="text-area text-area-short"
                            maxLength={500}
                            onChange={(event) => onReasonChange(event.target.value)}
                            value={reason}
                        />
                    </label>
                </ConfirmDialog>
            );
        case "reactivate":
            return (
                <ConfirmDialog
                    confirmLabel="Reativar conta"
                    description={`${action.user.name} poderá entrar novamente.`}
                    icon="check"
                    onCancel={onCancel}
                    onConfirm={onConfirm}
                    pending={confirming}
                    pendingLabel="Reativando..."
                    title="Reativar esta conta?"
                    tone="primary"
                />
            );
        case "sessions":
            return (
                <ConfirmDialog
                    confirmLabel="Encerrar sessões"
                    description={`${action.user.name} precisará entrar de novo em todos os aparelhos.`}
                    icon="logout"
                    onCancel={onCancel}
                    onConfirm={onConfirm}
                    pending={confirming}
                    pendingLabel="Encerrando..."
                    title="Encerrar todas as sessões?"
                />
            );
    }
}
