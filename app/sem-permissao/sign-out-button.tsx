"use client";

import { useState } from "react";

export function SignOutButton() {
    const [pending, setPending] = useState(false);

    async function signOut() {
        setPending(true);
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } finally {
            // Carregamento completo: a pré-busca do Next guarda respostas de antes da
            // mudança de sessão (ex.: "/" redirecionando para /login) e uma navegação
            // do cliente reaproveitaria esse cache.
            window.location.replace("/login");
        }
    }

    return (
        <button
            className="button button-outline"
            disabled={pending}
            onClick={() => void signOut()}
            type="button"
        >
            {pending ? "Saindo..." : "Entrar com outra conta"}
        </button>
    );
}
