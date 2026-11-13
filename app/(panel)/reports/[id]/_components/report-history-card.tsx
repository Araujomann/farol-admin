import { Icon } from "@/app/components/ui-icon";
import { formatDate, formatStatus } from "@/lib/format";
import type { AccidentDetail } from "@/lib/types";

/** Linha do tempo das decisões de moderação do relato. */
export function ReportHistoryCard({
    accident,
}: Readonly<{ accident: AccidentDetail }>) {
    return (
        <section className="content-card">
            <div className="section-heading">
                <div>
                    <div className="eyebrow detail-eyebrow">
                        <Icon name="refresh" /> RASTREABILIDADE
                    </div>
                    <h2>Histórico de auditoria e logs</h2>
                </div>
                <span className="audit-caption">Ações registradas pelo sistema</span>
            </div>
            {accident.moderation_history.length ? (
                <ol className="history-list">
                    {accident.moderation_history.map((entry) => (
                        <li key={entry.id}>
                            <span className={`history-marker history-${entry.new_status.toLowerCase()}`} />
                            <div className="history-copy">
                                <strong>
                                    {formatStatus(entry.previous_status)} → {formatStatus(entry.new_status)}
                                </strong>
                                <span>{entry.moderated_by.name} · {formatDate(entry.created_at)}</span>
                                {entry.public_message && (
                                    <p><b>Mensagem ao usuário:</b> {entry.public_message}</p>
                                )}
                                {entry.internal_note && (
                                    <p><b>Observação interna:</b> {entry.internal_note}</p>
                                )}
                            </div>
                        </li>
                    ))}
                </ol>
            ) : (
                <div className="audit-empty">
                    <span className="audit-empty-icon"><Icon name="reports" /></span>
                    <div>
                        <strong>Ocorrência submetida</strong>
                        <p>
                            Relato recebido em {formatDate(accident.created_at)}.
                            Aguardando análise da equipe de moderação.
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}
