"use client";

import Link from "next/link";
import { RecentReports } from "@/app/(panel)/_components/recent-reports";
import { StatCards } from "@/app/(panel)/_components/stat-cards";
import { WelcomePanel } from "@/app/(panel)/_components/welcome-panel";
import { useDashboard } from "@/app/(panel)/use-dashboard";
import { AdminShell } from "@/app/components/admin-shell";
import { PageHeading } from "@/app/components/page-heading";
import { Icon } from "@/app/components/ui-icon";

export function DashboardClient() {
    const { summary, recentReports, error, loading, retry } = useDashboard();

    return (
        <AdminShell>
            <PageHeading
                description="Acompanhe os relatos e as decisões de moderação."
                eyebrow="PAINEL ADMINISTRATIVO"
                title="Visão geral"
            >
                <Link className="button button-primary" href="/reports?status=PENDING">
                    Revisar pendentes <Icon name="arrow" />
                </Link>
            </PageHeading>

            {error && (
                <div className="alert alert-error" role="alert">
                    <div>
                        <strong>Não foi possível carregar os indicadores.</strong>
                        <span>{error}</span>
                    </div>
                    <button
                        className="text-button"
                        onClick={retry}
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            <StatCards loading={loading} summary={summary} />

            <WelcomePanel />

            <RecentReports loading={loading} reports={recentReports} />

            <div className="dashboard-footnote">
                <span className="security-dot" />
                Indicadores referentes somente aos relatos enviados pelo aplicativo Farol.
            </div>
        </AdminShell>
    );
}
