"use client";

import { UserActionDialog } from "@/app/(panel)/users/_components/user-action-dialog";
import { UserRow } from "@/app/(panel)/users/_components/user-row";
import { UsersFilters } from "@/app/(panel)/users/_components/users-filters";
import { useUsers } from "@/app/(panel)/users/use-users";
import { AdminShell } from "@/app/components/admin-shell";
import { EmptyState } from "@/app/components/empty-state";
import { NoticeAlert } from "@/app/components/notice-alert";
import { PageHeading } from "@/app/components/page-heading";
import { Pagination } from "@/app/components/pagination";
import { TableSkeletonRows } from "@/app/components/table-skeleton-rows";

export function UsersClient({ currentUserId }: { currentUserId: string }) {
    const {
        filters,
        changeSearch,
        changeRole,
        changeStatus,
        page,
        goToPreviousPage,
        goToNextPage,
        result,
        loading,
        error,
        expandedId,
        details,
        toggleDetails,
        pendingAction,
        setPendingAction,
        reason,
        setReason,
        confirming,
        notice,
        closeDialog,
        confirmAction,
    } = useUsers();

    return (
        <AdminShell>
            <PageHeading
                description="Consulte contas, suspenda quem violar as regras da comunidade e encerre sessões. Ações sobre administradores não são permitidas aqui."
                eyebrow="ADMINISTRAÇÃO"
                title="Usuários"
            />

            <UsersFilters
                onRoleChange={changeRole}
                onSearchChange={changeSearch}
                onStatusChange={changeStatus}
                role={filters.role}
                search={filters.search}
                status={filters.status}
            />

            {notice && <NoticeAlert notice={notice} />}
            {error && <div className="alert alert-error" role="alert">{error}</div>}

            <section aria-label="Contas" className="table-card">
                <div className="table-scroll">
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>Conta</th>
                                <th>Papel</th>
                                <th>Situação</th>
                                <th>Criada em</th>
                                <th><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <TableSkeletonRows columns={5} rows={5} />}
                            {!loading &&
                                result?.data.map((user) => (
                                    <UserRow
                                        currentUserId={currentUserId}
                                        detail={details[user.id]}
                                        expanded={expandedId === user.id}
                                        key={user.id}
                                        onAction={setPendingAction}
                                        onToggleDetails={() => void toggleDetails(user)}
                                        user={user}
                                    />
                                ))}
                        </tbody>
                    </table>
                </div>
                {!loading && result?.data.length === 0 && (
                    <EmptyState
                        description="Altere a busca ou os filtros."
                        icon="user"
                        title="Nenhuma conta encontrada"
                    />
                )}
                {result && (
                    <Pagination
                        itemsLabel="contas"
                        loading={loading}
                        onNext={goToNextPage}
                        onPrevious={goToPreviousPage}
                        page={page}
                        pagination={result.pagination}
                    />
                )}
            </section>

            {pendingAction && (
                <UserActionDialog
                    action={pendingAction}
                    confirming={confirming}
                    onCancel={closeDialog}
                    onConfirm={() => void confirmAction()}
                    onReasonChange={setReason}
                    reason={reason}
                />
            )}
        </AdminShell>
    );
}
