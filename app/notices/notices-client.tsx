"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/app/components/admin-shell";
import { Icon } from "@/app/components/ui-icon";
import { adminFetch } from "@/lib/client-api";

const MAX_MESSAGE_LENGTH = 1000;

interface AdministrativeNotice {
    id: string;
    message: string;
    created_at: string;
}

function formatNoticeDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Data indisponível";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

export function NoticesClient() {
    const [message, setMessage] = useState("");
    const [notices, setNotices] = useState<AdministrativeNotice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let active = true;
        adminFetch<{ data: AdministrativeNotice[] }>(
            "/api/admin/notifications/administrative-notices",
        )
            .then((result) => {
                if (active) {
                    setNotices(result.data);
                    setLoadError(false);
                    setError("");
                }
            })
            .catch((reason: unknown) => {
                if (active) {
                    setLoadError(true);
                    setError(
                        reason instanceof Error
                            ? reason.message
                            : "Não foi possível carregar os avisos.",
                    );
                }
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => {
            active = false;
        };
    }, [reloadKey]);

    async function publishNotice(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const normalizedMessage = message.trim();
        if (!normalizedMessage || isPublishing) return;

        setIsPublishing(true);
        setError("");
        setStatus("");

        try {
            const result = await adminFetch<{ data: AdministrativeNotice }>(
                "/api/admin/notifications/administrative-notices",
                {
                    method: "POST",
                    body: JSON.stringify({ message: normalizedMessage }),
                },
            );
            setNotices((current) => [
                result.data,
                ...current.filter((notice) => notice.id !== result.data.id),
            ].slice(0, 50));
            setMessage("");
            setStatus("Aviso publicado e disponível no aplicativo Farol.");
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "Não foi possível publicar o aviso.",
            );
        } finally {
            setIsPublishing(false);
        }
    }

    return (
        <AdminShell>
            <div className="page-heading">
                <div>
                    <div className="eyebrow">COMUNICAÇÃO COM A COMUNIDADE</div>
                    <h1>Avisos à comunidade</h1>
                    <p>
                        Compartilhe atualizações importantes com quem usa o Farol.
                    </p>
                </div>
            </div>

            {error && (
                <div className="alert alert-error" role="alert">
                    <div>
                        <strong>Não foi possível concluir a solicitação.</strong>
                        <span>{error}</span>
                    </div>
                    {loadError && (
                        <button
                            className="text-button"
                            onClick={() => {
                                setIsLoading(true);
                                setError("");
                                setReloadKey((value) => value + 1);
                            }}
                            type="button"
                        >
                            Tentar novamente
                        </button>
                    )}
                </div>
            )}

            {status && (
                <div className="alert alert-success" role="status">
                    <div>
                        <strong>Comunicado enviado</strong>
                        <span>{status}</span>
                    </div>
                </div>
            )}

            <div className="notice-page-grid">
                <section aria-labelledby="notice-composer-title" className="content-card notice-compose-card">
                    <div className="notice-intro">
                        <span className="notice-icon"><Icon name="bell" /></span>
                        <div>
                            <div className="eyebrow">NOVO COMUNICADO</div>
                            <h2 id="notice-composer-title">O que a comunidade precisa saber?</h2>
                            <p>
                                Escreva uma mensagem clara e direta. Ela ficará visível no
                                sininho do perfil de todas as pessoas no aplicativo.
                            </p>
                        </div>
                    </div>

                    <div className="notice-guidance">
                        <strong>Uma boa mensagem ajuda todo mundo</strong>
                        <span>
                            Conte o que mudou, quando a atualização acontece e se a
                            comunidade precisa fazer algo.
                        </span>
                    </div>

                    <form className="notice-form" onSubmit={publishNotice}>
                        <label className="form-label" htmlFor="community-notice">
                            Mensagem do aviso
                        </label>
                        <textarea
                            aria-describedby="notice-character-count notice-field-hint"
                            className="text-area notice-text-area"
                            id="community-notice"
                            maxLength={MAX_MESSAGE_LENGTH}
                            onChange={(event) => {
                                setMessage(event.target.value);
                                setStatus("");
                                setError("");
                            }}
                            placeholder="Ex.: O Farol recebeu uma atualização. Agora você pode acompanhar as novidades e melhorias diretamente pelo aplicativo."
                            required
                            value={message}
                        />
                        <div className="notice-field-footer">
                            <span id="notice-field-hint">
                                O aviso será publicado para toda a comunidade.
                            </span>
                            <span id="notice-character-count">
                                {message.length}/{MAX_MESSAGE_LENGTH}
                            </span>
                        </div>
                        <button
                            className="button button-primary notice-submit"
                            disabled={!message.trim() || isPublishing}
                            type="submit"
                        >
                            <Icon name="bell" />
                            {isPublishing ? "Publicando aviso..." : "Publicar aviso"}
                        </button>
                    </form>
                </section>

                <aside className="notice-side-card">
                    <div className="notice-side-icon"><Icon name="reports" /></div>
                    <strong>Antes de publicar</strong>
                    <p>
                        Os comunicados são compartilhados com todas as pessoas
                        usuárias do Farol. Revise o texto para garantir que a
                        informação esteja correta e fácil de entender.
                    </p>
                    <div className="notice-side-foot">
                        <span className="security-dot" />
                        Publicação feita por equipe autorizada
                    </div>
                </aside>
            </div>

            <section aria-labelledby="notice-history-title" className="notice-history">
                <div className="notice-history-heading">
                    <div>
                        <div className="eyebrow">MURAL DA COMUNIDADE</div>
                        <h2 id="notice-history-title">Avisos publicados</h2>
                    </div>
                    <span className="notice-history-count">
                        {isLoading ? "Carregando..." : `${notices.length} recentes`}
                    </span>
                </div>

                {isLoading && (
                    <div className="content-card notice-history-empty" role="status">
                        Carregando os avisos publicados...
                    </div>
                )}
                {!isLoading && notices.length === 0 && !error && (
                    <div className="content-card notice-history-empty">
                        <span className="notice-empty-icon"><Icon name="bell" /></span>
                        <strong>Nenhum aviso publicado ainda</strong>
                        <span>Quando um comunicado for enviado, ele aparecerá aqui.</span>
                    </div>
                )}
                {!isLoading && notices.length > 0 && (
                    <div className="notice-history-list">
                        {notices.map((notice) => (
                            <article className="content-card notice-history-item" key={notice.id}>
                                <span className="notice-history-marker" />
                                <div>
                                    <time dateTime={notice.created_at}>
                                        {formatNoticeDate(notice.created_at)}
                                    </time>
                                    <p>{notice.message}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </AdminShell>
    );
}
