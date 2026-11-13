import { Icon } from "@/app/components/ui-icon";

/** Lembretes exibidos ao lado do formulário de avisos. */
export function NoticeGuidelines() {
    return (
        <aside className="notice-side-card">
            <div className="notice-side-icon"><Icon name="reports" /></div>
            <strong>Antes de publicar</strong>
            <p>
                Os comunicados são compartilhados com todas as pessoas
                usuárias do Farol. Revise o texto para garantir que a
                informação esteja correta e fácil de entender.
            </p>
            <ul className="notice-checklist">
                <li><Icon name="check" /> Linguagem acessível e neutra</li>
                <li><Icon name="check" /> Sem abreviações ambíguas</li>
                <li><Icon name="check" /> Notificação push moderada</li>
            </ul>

        </aside>
    );
}
