import type { PendingUserAction } from "@/app/(panel)/users/use-users";
import { formatDate } from "@/lib/format";
import { formatRole } from "@/lib/permissions";
import type { AdminUser, AdminUserDetail } from "@/lib/types";

/** Linha de uma conta e, quando expandida, a linha de detalhes logo abaixo. */
export function UserRow({
    user,
    currentUserId,
    expanded,
    detail,
    onToggleDetails,
    onAction,
}: Readonly<{
    user: AdminUser;
    currentUserId: string;
    expanded: boolean;
    /** `undefined` enquanto os detalhes carregam. */
    detail: AdminUserDetail | undefined;
    onToggleDetails: () => void;
    onAction: (action: PendingUserAction) => void;
}>) {
    const actionable = user.role !== "admin" && user.id !== currentUserId;

    return (
        <>
            <tr>
                <td>
                    <button
                        aria-expanded={expanded}
                        className="text-button user-name-button"
                        onClick={onToggleDetails}
                        type="button"
                    >
                        {user.name}
                        {user.id === currentUserId && " (você)"}
                    </button>
                    <span className="table-secondary">
                        {user.email}
                        {!user.is_email_verified && " · e-mail não verificado"}
                    </span>
                </td>
                <td>
                    <span className={`role-tag ${user.role === "admin" ? "role-tag-admin" : ""}`}>
                        {formatRole(user.role)}
                    </span>
                </td>
                <td>
                    {user.suspended_at ? (
                        <>
                            <span className="status-badge status-rejected">
                                <span className="status-dot" /> Suspensa
                            </span>
                            <span className="table-secondary">
                                {formatDate(user.suspended_at)}
                                {user.suspended_by && ` por ${user.suspended_by.name}`}
                            </span>
                        </>
                    ) : (
                        <span className="status-badge status-approved">
                            <span className="status-dot" /> Ativa
                        </span>
                    )}
                </td>
                <td><span className="table-primary">{formatDate(user.created_at)}</span></td>
                <td>
                    {actionable && (
                        <div className="row-actions">
                            <button
                                className="button button-outline button-small"
                                onClick={() => onAction({ kind: "sessions", user })}
                                type="button"
                            >
                                Encerrar sessões
                            </button>
                            {user.suspended_at ? (
                                <button
                                    className="button button-primary button-small"
                                    onClick={() => onAction({ kind: "reactivate", user })}
                                    type="button"
                                >
                                    Reativar
                                </button>
                            ) : (
                                <button
                                    className="button button-danger button-small"
                                    onClick={() => onAction({ kind: "suspend", user })}
                                    type="button"
                                >
                                    Suspender
                                </button>
                            )}
                        </div>
                    )}
                </td>
            </tr>
            {expanded && (
                <tr className="user-detail-row">
                    <td colSpan={5}>
                        {detail ? (
                            <dl className="user-detail">
                                <div><dt>Relatos</dt><dd>{detail.reports_count}</dd></div>
                                <div><dt>Comentários</dt><dd>{detail.comments_count}</dd></div>
                                <div><dt>Decisões de moderação</dt><dd>{detail.decisions_count}</dd></div>
                                <div><dt>Sessões ativas</dt><dd>{detail.active_sessions}</dd></div>
                                {detail.suspended_reason && (
                                    <div className="user-detail-wide">
                                        <dt>Motivo da suspensão</dt>
                                        <dd>{detail.suspended_reason}</dd>
                                    </div>
                                )}
                            </dl>
                        ) : (
                            <span className="table-skeleton" />
                        )}
                    </td>
                </tr>
            )}
        </>
    );
}
