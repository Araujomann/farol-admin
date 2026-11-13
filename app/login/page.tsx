"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Icon } from "@/app/components/ui-icon";

function LoginForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
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
            <section aria-label="Identidade do Farol" className="login-brand-panel">
                <div className="login-brand-art" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </div>
                <div className="login-brand-content">
                    <Link className="brand login-brand" href="/">
                        <Image
                            alt=""
                            className="login-brand-logo"
                            height={58}
                            src="/farol-logo.png"
                            width={58}
                        />
                        <span>
                            <strong>Farol</strong>
                            <small>ADMINISTRAÇÃO</small>
                        </span>
                    </Link>
                    
                       
                    <h2>Trânsito urbano seguro e em tempo real.</h2>
                    <p>
                        Plataforma dedicada à gestão de relatos e à análise das
                        informações enviadas pela comunidade.
                    </p>
                    <div className="login-feature-list">
                        <article className="login-feature">
                            <span className="login-feature-icon"><Icon name="lock" /></span>
                            <span>
                                <strong>Gestão responsável</strong>
                                <small>Acesso destinado à equipe autorizada</small>
                            </span>
                            <Icon className="login-feature-check" name="check" />
                        </article>
                        <article className="login-feature">
                            <span className="login-feature-icon"><Icon name="reports" /></span>
                            <span>
                                <strong>Relatos da comunidade</strong>
                                <small>Informações organizadas para análise</small>
                            </span>
                            <Icon className="login-feature-check" name="check" />
                        </article>
                        <article className="login-feature">
                            <span className="login-feature-icon"><Icon name="users" /></span>
                            <span>
                                <strong>Moderação centralizada</strong>
                                <small>Apoio à equipe do Farol</small>
                            </span>
                            <Icon className="login-feature-check" name="check" />
                        </article>
                    </div>
                </div>
                <div className="login-brand-footer">
                    <span>Portal institucional</span>
                </div>
            </section>

            <section aria-labelledby="login-title" className="login-form-panel">
                <div className="login-form-header">
                    <div className="login-eyebrow">PAINEL ADMINISTRATIVO</div>
                    <span className="login-access-label"><Icon name="lock" /> Área restrita</span>
                </div>
                <div className="login-form-content">
                    <h1 id="login-title">Acessar painel</h1>
                    <p className="login-description">
                        Entre com suas credenciais institucionais para gerenciar
                        os relatos da comunidade.
                    </p>
                    <form className="login-form" onSubmit={submit}>
                        <label className="form-label" htmlFor="email">
                            E-mail institucional
                        </label>
                        <span className="login-input-wrap">
                            <Icon name="mail" />
                            <input
                                autoComplete="username"
                                id="email"
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="nome@exemplo.com"
                                required
                                type="email"
                                value={email}
                            />
                        </span>
                        <label className="form-label" htmlFor="password">
                            Senha
                        </label>
                        <span className="login-input-wrap">
                            <Icon name="lock" />
                            <input
                                autoComplete="current-password"
                                id="password"
                                onChange={(event) => setPassword(event.target.value)}
                                required
                                type={passwordVisible ? "text" : "password"}
                                value={password}
                            />
                            <button
                                aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
                                className="password-visibility"
                                onClick={() => setPasswordVisible((visible) => !visible)}
                                type="button"
                            >
                                <Icon name={passwordVisible ? "eyeOff" : "eye"} />
                            </button>
                        </span>
                        {error && (
                            <div className="alert alert-error" role="alert">
                                {error}
                            </div>
                        )}
                        <button className="button button-primary login-submit" disabled={loading}>
                            {loading ? "Entrando..." : "Entrar no painel"}
                            {!loading && <Icon name="arrow" />}
                        </button>
                    </form>
                    <div className="login-audit-note">
                        <span className="login-audit-icon"><Icon name="reports" /></span>
                        <span>
                            <strong>Acesso de equipe</strong>
                            <small>
                                Entre com uma conta de moderador ou administrador do Farol.
                            </small>
                        </span>
                    </div>
                </div>
                <div className="login-form-footer">
                   
                    
                </div>
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
