"use client";

import { ReportRow } from "@/app/(panel)/reports/_components/report-row";
import { ReportsFilters } from "@/app/(panel)/reports/_components/reports-filters";
import { ReportsHeading } from "@/app/(panel)/reports/_components/reports-heading";
import { useReportsList } from "@/app/(panel)/reports/use-reports-list";
import { AdminShell } from "@/app/components/admin-shell";
import { EmptyState } from "@/app/components/empty-state";
import { Pagination } from "@/app/components/pagination";
import { TableSkeletonRows } from "@/app/components/table-skeleton-rows";

export function ReportsClient({
    initialSearch,
    initialSeverity,
    initialStatus,
}: {
    initialSearch: string;
    initialSeverity: string;
    initialStatus: string;
}) {
    const {
        filters,
        changeSearch,
        changeStatus,
        changeSeverity,
        changeSort,
        refresh,
        retry,
        page,
        goToPreviousPage,
        goToNextPage,
        result,
        loading,
        error,
    } = useReportsList({ initialSearch, initialSeverity, initialStatus });

    return (
        <AdminShell>
            <ReportsHeading result={result} />

            <ReportsFilters
                loading={loading}
                onRefresh={refresh}
                onSearchChange={changeSearch}
                onSeverityChange={changeSeverity}
                onSortChange={changeSort}
                onStatusChange={changeStatus}
                search={filters.search}
                severity={filters.severity}
                sort={filters.sort}
                status={filters.status}
            />

            {error && (
                <div className="alert alert-error" role="alert">
                    <div>
                        <strong>Falha ao carregar os relatos.</strong>
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

            <section aria-label="Lista de relatos" className="table-card">
                <div className="table-scroll">
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>Relato</th>
                                <th>Ocorrência</th>
                                <th>Enviado por</th>
                                <th>Gravidade</th>
                                <th>Status</th>
                                <th><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <TableSkeletonRows columns={6} rows={5} />}
                            {!loading &&
                                result?.data.map((accident) => (
                                    <ReportRow accident={accident} key={accident.id} />
                                ))}
                        </tbody>
                    </table>
                </div>
                {!loading && result?.data.length === 0 && (
                    <EmptyState
                        description="Altere os filtros ou tente outra busca."
                        icon="reports"
                        title="Nenhum relato encontrado"
                    />
                )}
                {result && (
                    <Pagination
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
