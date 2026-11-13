import { Icon } from "@/app/components/ui-icon";
import type { AdministrativeNotice } from "@/lib/api/notices";

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

/** Mural com os avisos já publicados. */
export function NoticeHistory({
    notices,
    isLoading,
    hasError,
}: Readonly<{
    notices: AdministrativeNotice[];
    isLoading: boolean;
    /** Com erro na página, o estado vazio não é exibido. */
    hasError: boolean;
}>) {
    return (
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
            {!isLoading && notices.length === 0 && !hasError && (
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
    );
}
