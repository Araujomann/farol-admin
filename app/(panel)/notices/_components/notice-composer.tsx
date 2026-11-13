import { Icon } from "@/app/components/ui-icon";

export const MAX_MESSAGE_LENGTH = 1000;

/** Card de escrita e publicação de um novo aviso. */
export function NoticeComposer({
    message,
    isPublishing,
    onMessageChange,
    onSubmit,
}: Readonly<{
    message: string;
    isPublishing: boolean;
    /** Também usado pelo botão "Limpar" com `""`. */
    onMessageChange: (value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}>) {
    return (
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
                <span className="notice-guidance-icon"><Icon name="thumbsUp" /></span>
                <div>
                    <strong>Uma boa mensagem ajuda todo mundo</strong>
                    <span>
                        Conte o que mudou, quando a atualização acontece ou se a
                        comunidade precisa fazer algo.
                    </span>
                </div>
            </div>

            <form className="notice-form" onSubmit={onSubmit}>
                <label className="form-label" htmlFor="community-notice">
                    Mensagem do aviso <span className="required-mark">*</span>
                </label>
                <textarea
                    aria-describedby="notice-character-count notice-field-hint"
                    className="text-area notice-text-area"
                    id="community-notice"
                    maxLength={MAX_MESSAGE_LENGTH}
                    onChange={(event) => onMessageChange(event.target.value)}
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
                <div className="notice-form-actions">
                    <button
                        className="button button-quiet"
                        disabled={!message || isPublishing}
                        onClick={() => onMessageChange("")}
                        type="button"
                    >
                        Limpar
                    </button>
                    <button
                        className="button button-primary notice-submit"
                        disabled={!message.trim() || isPublishing}
                        type="submit"
                    >
                        <Icon name="bell" />
                        {isPublishing ? "Publicando aviso..." : "Publicar aviso"}
                    </button>
                </div>
            </form>
        </section>
    );
}
