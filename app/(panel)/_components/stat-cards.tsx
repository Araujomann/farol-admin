import { Icon } from "@/app/components/ui-icon";
import type { ModerationSummary } from "@/lib/api/moderation";

const cards = [
    {
        key: "total" as const,
        label: "Relatos recebidos",
        description: "Enviados pela comunidade",
        icon: "reports" as const,
        color: "blue",
    },
    {
        key: "pending" as const,
        label: "Aguardando análise",
        description: "Precisam de revisão",
        icon: "clock" as const,
        color: "amber",
    },
    {
        key: "approved" as const,
        label: "Aprovados",
        description: "Elegíveis para o mapa",
        icon: "check" as const,
        color: "green",
    },
    {
        key: "rejected" as const,
        label: "Rejeitados",
        description: "Não publicados no mapa",
        icon: "close" as const,
        color: "red",
    },
];

/** Os quatro indicadores do topo do dashboard. */
export function StatCards({
    summary,
    loading,
}: Readonly<{ summary: ModerationSummary | null; loading: boolean }>) {
    return (
        <section aria-label="Indicadores dos relatos" className="stats-grid">
            {cards.map((card) => (
                <article className="stat-card" key={card.key}>
                    <div className="stat-top">
                        <span className="stat-label">{card.label}</span>
                        <span className={`stat-icon icon-${card.color}`}>
                            <Icon name={card.icon} />
                        </span>
                    </div>
                    <div className="stat-value">
                        {loading ? <span className="skeleton-value" /> : summary?.[card.key] ?? "—"}
                        {card.key === "approved" && summary && summary.total > 0 && (
                            <span className="stat-trend">
                                {((summary.approved / summary.total) * 100).toFixed(0)}%
                            </span>
                        )}
                        {card.key === "pending" && (
                            <span className="status-badge status-pending stat-status">
                                <span className="status-dot" /> Pendente
                            </span>
                        )}
                        {card.key === "rejected" && (
                            <span className="status-badge status-rejected stat-status">
                                <span className="status-dot" /> {summary?.total
                                    ? ((summary.rejected / summary.total) * 100).toFixed(0)
                                    : 0}%
                            </span>
                        )}
                    </div>
                    <div className="stat-description">{card.description}</div>
                </article>
            ))}
        </section>
    );
}
