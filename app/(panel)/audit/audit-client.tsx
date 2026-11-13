"use client";

import { AuditFilters } from "@/app/(panel)/audit/_components/audit-filters";
import { AuditRow } from "@/app/(panel)/audit/_components/audit-row";
import { useAuditLog } from "@/app/(panel)/audit/use-audit-log";
import { AdminShell } from "@/app/components/admin-shell";
import { EmptyState } from "@/app/components/empty-state";
import { PageHeading } from "@/app/components/page-heading";
import { Pagination } from "@/app/components/pagination";
import { TableSkeletonRows } from "@/app/components/table-skeleton-rows";

export function AuditClient() {
    const {
        filters,
        changeAction,
        changeFrom,
        changeTo,
        refresh,
        page,
        goToPreviousPage,
        goToNextPage,
        result,
        loading,
        error,
    } = useAuditLog();

    return (
        <AdminShell>
            <PageHeading
                description="Registro permanente das ações administrativas: quem fez, quando, de onde e com qual motivo. Nenhuma linha pode ser alterada ou apagada. Aprovações e rejeições ficam no histórico de moderação."
                eyebrow="ADMINISTRAÇÃO"
                title="Auditoria"
            />

            <AuditFilters
                action={filters.action}
                from={filters.from}
                loading={loading}
                onActionChange={changeAction}
                onFromChange={changeFrom}
                onRefresh={refresh}
                onToChange={changeTo}
                to={filters.to}
            />

            {error && <div className="alert alert-error" role="alert">{error}</div>}

            <section aria-label="Registros de auditoria" className="table-card">
                <div className="table-scroll">
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Ação</th>
                                <th>Quem</th>
                                <th>Detalhes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <TableSkeletonRows columns={4} rows={6} />}
                            {!loading &&
                                result?.data.map((entry) => (
                                    <AuditRow entry={entry} key={entry.id} />
                                ))}
                        </tbody>
                    </table>
                </div>
                {!loading && result?.data.length === 0 && (
                    <EmptyState
                        description="Altere os filtros para ver outras ações."
                        icon="shield"
                        title="Nenhum registro encontrado"
                    />
                )}
                {result && (
                    <Pagination
                        itemsLabel="registros"
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
