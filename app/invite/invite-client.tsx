"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Icon } from "@/app/components/ui-icon";

function readTokenFromHash(): string | null {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const token = params.get("token")?.trim();
    return token || null;
}

// Duas formas de chegar aqui: pelo botão do e-mail (token no fragmento #token=)
// ou digitando o endereço e colando o código do e-mail. Em ambiente local o
// e-mail não leva link, porque os provedores barram links para localhost.
export function InviteClient() {
    const router = useRouter();
    const [linkToken, setLinkToken] = useState<string | null | undefined>(undefined);
    const [code, setCode] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

    // Lido uma única vez: o Strict Mode roda o efeito duas vezes em
    // desenvolvimento, e na segunda o fragmento já foi limpo.
    const tokenRef = useRef<string | null | undefined>(undefined);

    useEffect(() => {
        if (tokenRef.current === undefined) {
            tokenRef.current = readTokenFromHash();
            // Tira o token da barra de endereço (histórico, capturas de tela);
            // ele fica só na memória desta página.
            if (tokenRef.current) {
                window.history.replaceState(null, "", window.location.pathname);
            }
        }
        const token = tokenRef.current;
        const timer = window.setTimeout(() => setLinkToken(token));
        return () => window.clearTimeout(timer);
    }, []);

    const fromLink = Boolean(linkToken);
    const token = linkToken ?? code.replace(/\s+/g, "");

    async function accept(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!token) return;

        setPending(true);
        setError("");
        try {
            const response = await fetch("/api/invites/accept", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, email, password }),
            });
            const result = await response.json().catch(() => null);
            if (!response.ok) {
                setError(result?.error?.message ?? "Não foi possível aceitar o convite.");
                return;
            }
            router.replace("/");
        } catch {
            setError("Não foi possível conectar ao painel. Tente novamente.");
        } finally {
            setPending(false);
        }
    }

    return (
        <main className="access-denied-page">
            <section className="loading-card invite-card" aria-labelledby="invite-title">
                <div className="invite-brand">
                    <Image alt="" height={44} src="/farol-logo.png" width={44} />
                    <span>
                        <strong>Farol</strong>
                        <small>ADMINISTRAÇÃO</small>
                    </span>
                </div>
                <h1 id="invite-title">Convite para a moderação</h1>
                <p>
                    {fromLink
                        ? "Entre com a sua conta do Farol para aceitar."
                        : "Cole o código que chegou no e-mail do convite e entre com a sua conta do Farol."}{" "}
                    Use o mesmo e-mail que recebeu o convite, já verificado no aplicativo.
                </p>
                <form className="invite-form" onSubmit={accept}>
                    {linkToken === null && (
                        <>
                            <label className="form-label" htmlFor="invite-code">
                                Código do convite
                            </label>
                            <input
                                autoComplete="off"
                                className="text-input invite-code-input"
                                id="invite-code"
                                onChange={(event) => setCode(event.target.value)}
                                placeholder="Cole aqui o código do e-mail"
                                required
                                spellCheck={false}
                                value={code}
                            />
                        </>
                    )}
                    <label className="form-label" htmlFor="invite-email">
                        E-mail
                    </label>
                    <input
                        autoComplete="username"
                        className="text-input"
                        id="invite-email"
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        type="email"
                        value={email}
                    />
                    <label className="form-label" htmlFor="invite-password">
                        Senha
                    </label>
                    <input
                        autoComplete="current-password"
                        className="text-input"
                        id="invite-password"
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        type="password"
                        value={password}
                    />
                    {error && (
                        <div className="alert alert-error" role="alert">
                            {error}
                        </div>
                    )}
                    <button
                        className="button button-primary"
                        disabled={pending || linkToken === undefined || !token}
                        type="submit"
                    >
                        {pending ? "Aceitando..." : "Aceitar convite e entrar"}
                        {!pending && <Icon name="arrow" />}
                    </button>
                </form>
                <p className="invite-footnote">
                    Ainda não tem conta? Crie uma no aplicativo Farol com o e-mail
                    convidado, verifique-o e volte a esta página.
                </p>
            </section>
        </main>
    );
}
