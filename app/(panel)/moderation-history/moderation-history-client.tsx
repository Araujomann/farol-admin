"use client";

import { HistoryFilters } from "@/app/(panel)/moderation-history/_components/history-filters";
import { HistoryRow } from "@/app/(panel)/moderation-history/_components/history-row";
import { useModerationHistory } from "@/app/(panel)/moderation-history/use-moderation-history";
import { AdminShell } from "@/app/components/admin-shell";
import { EmptyState } from "@/app/components/empty-state";
import { PageHeading } from "@/app/components/page-heading";
import { Pagination } from "@/app/components/pagination";
import { TableSkeletonRows } from "@/app/components/table-skeleton-rows";

export function ModerationHistoryClient() {
    const {
        filters,
        changeModerator,
        changeStatus,
        changeFrom,
        changeTo,
        clearFilters,
        hasFilters,
        refresh,
        page,
        goToPreviousPage,
        goToNextPage,
        moderators,
        result,
        loading,
        error,
    } = useModerationHistory();

    return (
        <AdminShell>
            <PageHeading
                description="Quem aprovou ou rejeitou cada relato, quando e com qual justificativa. As decisões registradas não podem ser alteradas."
                eyebrow="RASTREABILIDADE"
                title="Histórico de moderação"
            />

            <HistoryFilters
                from={filters.from}
                hasFilters={hasFilters}
                loading={loading}
                moderatorId={filters.moderatorId}
                moderators={moderators}
                onClear={clearFilters}
                onFromChange={changeFrom}
                onModeratorChange={changeModerator}
                onRefresh={refresh}
                onStatusChange={changeStatus}
                onToChange={changeTo}
                status={filters.status}
                to={filters.to}
            />

            {error && (
                <div className="alert alert-error" role="alert">
                    <div>
                        <strong>Falha ao carregar o histórico.</strong>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            <section aria-label="Decisões de moderação" className="table-card">
                <div className="table-scroll">
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Relato</th>
                                <th>Decisão</th>
                                <th>Responsável</th>
                                <th>Justificativa e observação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <TableSkeletonRows columns={5} rows={5} />}
                            {!loading &&
                                result?.data.map((entry) => (
                                    <HistoryRow entry={entry} key={entry.id} />
                                ))}
                        </tbody>
                    </table>
                </div>
                {!loading && result?.data.length === 0 && (
                    <EmptyState
                        description={
                            hasFilters
                                ? "Altere os filtros para ver outras decisões."
                                : "As aprovações e rejeições aparecerão aqui."
                        }
                        icon="clock"
                        title="Nenhuma decisão encontrada"
                    />
                )}
                {result && (
                    <Pagination
                        itemsLabel="decisões"
                        loading={loading}
                        onNext={goToNextPage}
                        onPrevious={goToPreviousPage}
                        page={page}
                        pagination={result.pagination}
                    />
                )}
            </section>
        </AdminShell>
    );
}
