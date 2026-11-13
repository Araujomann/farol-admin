import { Icon } from "@/app/components/ui-icon";

/** Confirmação de saída da conta. O Escape é tratado pelo AdminShell. */
export function LogoutDialog({
    pending,
    onCancel,
    onConfirm,
}: Readonly<{
    pending: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}>) {
    return (
        <div
            className="logout-dialog-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !pending) {
                    onCancel();
                }
            }}
        >
            <section
                aria-describedby="logout-dialog-description"
                aria-labelledby="logout-dialog-title"
                aria-modal="true"
                className="logout-dialog"
                role="dialog"
            >
                <div className="logout-dialog-icon">
                    <Icon name="logout" />
                </div>
                <h2 id="logout-dialog-title">Sair da sua conta?</h2>
                <p id="logout-dialog-description">
                    Você precisará entrar novamente para acessar o painel.
                </p>
                <div className="logout-dialog-actions">
                    <button
                        autoFocus
                        className="button button-outline"
                        disabled={pending}
                        onClick={onCancel}
                        type="button"
                    >
                        Continuar conectado
                    </button>
                    <button
                        className="button button-danger"
                        disabled={pending}
                        onClick={onConfirm}
                        type="button"
                    >
                        {pending ? "Saindo..." : "Sair da conta"}
                    </button>
                </div>
            </section>
        </div>
    );
}
