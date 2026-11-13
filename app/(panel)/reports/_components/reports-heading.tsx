import { Icon } from "@/app/components/ui-icon";
import type { AccidentListResponse } from "@/lib/api/moderation";

/** Título da página com o total da lista e os críticos da página atual. */
export function ReportsHeading({
    result,
}: Readonly<{ result: AccidentListResponse | null }>) {
    return (
        <section aria-label="Resumo dos relatos" className="reports-heading-card">
            <div className="page-heading reports-page-heading">
                <div>
                    <div className="eyebrow"><span className="eyebrow-dot" /> MODERAÇÃO</div>
                    <h1>Relatos</h1>
                    <p>
                        Consulte, filtre e acompanhe os relatos enviados pela comunidade
                        em tempo real.
                    </p>
                </div>
                <div className="reports-overview">
                    <div className="reports-overview-icon"><Icon name="reports" /></div>
                    <strong>{result?.pagination.total ?? "—"}</strong>
                    <span>relatos</span>
                    <small>Total na lista</small>
                </div>
                <div className="reports-overview reports-overview-critical">
                    <div className="reports-overview-icon"><Icon name="alert" /></div>
                    <strong>
                        {result?.data.filter((item) => item.severity === "critical").length ?? "—"}
                    </strong>
                    <span>críticos</span>
                    <small>merecem atenção imediata nesta página!</small>
                </div>
            </div>
        </section>
    );
}
