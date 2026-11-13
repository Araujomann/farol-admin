import { Icon } from "@/app/components/ui-icon";
import type { AccidentDetail } from "@/lib/types";

export function SubmitterCard({
    author,
}: Readonly<{ author: AccidentDetail["created_by"] }>) {
    return (
        <section className="content-card submitter-card">
            <div className="eyebrow detail-eyebrow">
                <Icon name="users" /> AUTOR DO RELATO
            </div>
            <div className="submitter-avatar">
                {author?.name?.slice(0, 1).toUpperCase() ?? "?"}
            </div>
            <strong>
                {author?.name ?? "Usuário indisponível"}
                <span className="verified-mark">✓</span>
            </strong>
            <span>{author?.email ?? "Sem e-mail cadastrado"}</span>
            <small className="submitter-history">Relato enviado pela comunidade</small>
        </section>
    );
}
