import Link from "next/link";
import { Icon } from "@/app/components/ui-icon";
import { formatDate, formatSeverity } from "@/lib/format";
import type { AccidentListItem } from "@/lib/types";

/** Fila prioritária: os relatos pendentes mais recentes. */
export function RecentReports({
    reports,
    loading,
}: Readonly<{ reports: AccidentListItem[]; loading: boolean }>) {
    return (
        <section aria-labelledby="recent-reports-title" className="recent-reports">
            <div className="dashboard-section-heading">
                <div>
                    <h2 id="recent-reports-title">Fila prioritária recente</h2>
                    <span className="recent-count">3 mais recentes</span>
                </div>
                <span className="refresh-label">Atualização contínua</span>
            </div>
            {reports.length > 0 ? (
                <div className="recent-report-grid">
                    {reports.map((accident) => (
                        <Link
                            className="recent-report-card"
                            href={`/reports/${accident.id}`}
                            key={accident.id}
                        >
                            <span className={`recent-report-icon icon-${accident.severity}`}>
                                <Icon name={accident.severity === "critical" ? "alert" : "pin"} />
                            </span>
                            <span className="recent-report-copy">
                                <strong>{accident.tipo_acidente}</strong>
                                <span>
                                    {accident.description || "Sem descrição adicional"}
                                </span>
                                <small>
                                    {accident.created_by?.name ?? "Usuário indisponível"}
                                    {" · "}
                                    {formatDate(accident.created_at)}
                                </small>
                            </span>
                            <span className={`recent-severity severity-${accident.severity}`}>
                                {formatSeverity(accident.severity)}
                            </span>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="recent-empty">
                    {loading ? "Carregando relatos recentes..." : "Nenhum relato recente para exibir."}
                </div>
            )}
        </section>
    );
}
