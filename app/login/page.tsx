"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const result = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(
                    result?.error?.message ?? "Não foi possível entrar.",
                );
            }

            const next = searchParams.get("next");
            const destination =
                next?.startsWith("/") && !next.startsWith("//")
                    ? next
                    : "/";
            router.replace(destination);
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "Não foi possível conectar à API.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="login-page">
            <section aria-labelledby="login-title" className="login-card">
                <Link className="brand login-brand" href="/">
                    <span className="brand-mark">f</span>
                    <span>
                        <strong>farol</strong>
                        <small>ADMINISTRAÇÃO</small>
                    </span>
                </Link>
                <div className="login-eyebrow">ÁREA RESTRITA</div>
                <h1 id="login-title">Acesse sua conta</h1>
                <p className="login-description">
                    Entre com uma conta de moderador ou administrador do Farol.
                </p>
                <form className="login-form" onSubmit={submit}>
                    <label className="form-label" htmlFor="email">
                        E-mail
                    </label>
                    <input
                        autoComplete="username"
                        className="text-input"
                        id="email"
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="nome@exemplo.com"
                        required
                        type="email"
                        value={email}
                    />
                    <label className="form-label" htmlFor="password">
                        Senha
                    </label>
                    <input
                        autoComplete="current-password"
                        className="text-input"
                        id="password"
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
                    <button className="button button-primary login-submit" disabled={loading}>
                        {loading ? "Entrando..." : "Entrar no painel"}
                    </button>
                </form>
                <p className="login-footnote">
                    O acesso requer papel administrativo e e-mail verificado na API.
                </p>
            </section>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<main className="login-page"><div className="loading-card">Carregando...</div></main>}>
            <LoginForm />
        </Suspense>
    );
}
