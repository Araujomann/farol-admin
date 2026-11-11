"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/app/components/admin-shell";
import { Icon } from "@/app/components/ui-icon";
import { adminFetch } from "@/lib/client-api";
import { formatDate, formatSeverity } from "@/lib/format";
import type { AccidentListItem, Pagination } from "@/lib/types";

interface Summary {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

interface RecentReports {
    data: AccidentListItem[];
    pagination: Pagination;
}

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

export default function DashboardPage() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [recentReports, setRecentReports] = useState<AccidentListItem[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let active = true;
        Promise.all([
            adminFetch<{ data: Summary }>("/api/admin/moderation/summary"),
            adminFetch<RecentReports>(
                "/api/admin/moderation?page=1&limit=3&status=PENDING&sort=newest",
            ),
        ])
            .then(([summaryResult, reportsResult]) => {
                if (!active) return;
                setSummary(summaryResult.data);
                setRecentReports(reportsResult.data);
                setError("");
            })
            .catch((reason: unknown) => {
                if (!active) return;
                setError(
                    reason instanceof Error
                        ? reason.message
                        : "Erro ao carregar dados.",
                );
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [reloadKey]);

    return (
        <AdminShell>
            <div className="page-heading">
                <div>
                    <div className="eyebrow"><span className="eyebrow-dot" /> PAINEL ADMINISTRATIVO</div>
                    <h1>Visão geral</h1>
                    <p>Acompanhe os relatos e as decisões de moderação.</p>
                </div>
                <Link className="button button-primary" href="/reports?status=PENDING">
                    Revisar pendentes <Icon name="arrow" />
                </Link>
            </div>

            {error && (
                <div className="alert alert-error" role="alert">
                    <div>
                        <strong>Não foi possível carregar os indicadores.</strong>
                        <span>{error}</span>
                    </div>
                    <button
                        className="text-button"
                        onClick={() => {
                            setLoading(true);
                            setError("");
                            setReloadKey((value) => value + 1);
                        }}
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

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

            <section className="welcome-panel">
                <div className="welcome-symbol"><Icon name="refresh" /></div>
                <div className="welcome-copy">
                    <div className="eyebrow"><span className="eyebrow-dot" /> FLUXO DE MODERAÇÃO</div>
                    <h2>Relatos avaliados com cuidado fazem um mapa mais confiável.</h2>
                    <p>
                        Revise as informações enviadas, registre uma mensagem ao usuário
                        e decida se o relato pode ser publicado.
                    </p>
                    <Link className="inline-link" href="/reports?status=PENDING">
                        Abrir fila de análise <Icon name="arrow" />
                    </Link>
                </div>
                <div className="welcome-art" aria-hidden="true">
                    <span className="art-ring art-ring-one" />
                    <span className="art-ring art-ring-two" />
                    <span className="art-ring art-ring-three" />
                    <span className="art-pin"><Icon name="pin" /></span>
                </div>
            </section>

            <section aria-labelledby="recent-reports-title" className="recent-reports">
                <div className="dashboard-section-heading">
                    <div>
                        <h2 id="recent-reports-title">Fila prioritária recente</h2>
                        <span className="recent-count">3 mais recentes</span>
                    </div>
                    <span className="refresh-label">Atualização contínua</span>
                </div>
                {recentReports.length > 0 ? (
                    <div className="recent-report-grid">
                        {recentReports.map((accident) => (
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

            <div className="dashboard-footnote">
                <span className="security-dot" />
                Indicadores referentes somente aos relatos enviados pelo aplicativo Farol.
            </div>
        </AdminShell>
    );
}
