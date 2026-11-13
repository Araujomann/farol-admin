import type { FormEvent } from "react";

export function InviteForm({
    email,
    sending,
    onEmailChange,
    onSubmit,
    onCancel,
}: Readonly<{
    email: string;
    sending: boolean;
    onEmailChange: (value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}>) {
    return (
        <form className="content-card invite-create-form" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="invite-email">E-mail do convidado</label>
            <input
                autoFocus
                className="text-input"
                id="invite-email"
                maxLength={254}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="email@exemplo.com"
                required
                type="email"
                value={email}
            />
            <button className="button button-primary" disabled={sending} type="submit">
                {sending ? "Enviando..." : "Enviar convite"}
            </button>
            <button
                className="button button-outline"
                disabled={sending}
                onClick={onCancel}
                type="button"
            >
                Cancelar
            </button>
        </form>
    );
}
