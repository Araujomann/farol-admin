"use client";

import { InviteForm } from "@/app/(panel)/team/_components/invite-form";
import { InvitesTable } from "@/app/(panel)/team/_components/invites-table";
import { TeamActionDialog } from "@/app/(panel)/team/_components/team-action-dialog";
import { TeamMembersTable } from "@/app/(panel)/team/_components/team-members-table";
import { useTeamActions } from "@/app/(panel)/team/use-team-actions";
import { useTeamLists } from "@/app/(panel)/team/use-team-lists";
import { AdminShell } from "@/app/components/admin-shell";
import { NoticeAlert } from "@/app/components/notice-alert";
import { PageHeading } from "@/app/components/page-heading";
import { Can, useCan } from "@/app/components/permissions-provider";
import { Icon } from "@/app/components/ui-icon";

export function TeamClient({ currentUserId }: { currentUserId: string }) {
    const canInvite = useCan("moderators:invite");
    const canRemove = useCan("moderators:revoke");

    const { team, invites, inviteFilter, setInviteFilter, loadError, reload } =
        useTeamLists(canRemove);
    const {
        inviteFormOpen,
        setInviteFormOpen,
        inviteEmail,
        setInviteEmail,
        sending,
        notice,
        busyInviteId,
        pendingAction,
        setPendingAction,
        removalReason,
        setRemovalReason,
        confirming,
        sendInvite,
        resend,
        confirmPendingAction,
        closeDialog,
    } = useTeamActions(reload);

    return (
        <AdminShell>
            <PageHeading
                description="Convide moderadores por e-mail, acompanhe os convites e remova permissões quando necessário. Todas as ações ficam na auditoria."
                eyebrow="ADMINISTRAÇÃO"
                title="Equipe e convites"
            >
                <Can permission="moderators:invite">
                    <button
                        className="button button-primary"
                        onClick={() => setInviteFormOpen((open) => !open)}
                        type="button"
                    >
                        <Icon name="mail" /> Convidar moderador
                    </button>
                </Can>
            </PageHeading>

            {canInvite && inviteFormOpen && (
                <InviteForm
                    email={inviteEmail}
                    onCancel={() => setInviteFormOpen(false)}
                    onEmailChange={setInviteEmail}
                    onSubmit={sendInvite}
                    sending={sending}
                />
            )}

            {notice && <NoticeAlert notice={notice} />}
            {loadError && <div className="alert alert-error" role="alert">{loadError}</div>}

            {canRemove && (
                <TeamMembersTable
                    currentUserId={currentUserId}
                    onRemove={(member) => setPendingAction({ kind: "remove-moderator", member })}
                    team={team}
                />
            )}

            <InvitesTable
                busyInviteId={busyInviteId}
                filter={inviteFilter}
                invites={invites}
                onFilterChange={setInviteFilter}
                onResend={(invite) => void resend(invite)}
                onRevoke={(invite) => setPendingAction({ kind: "revoke-invite", invite })}
            />

            {pendingAction && (
                <TeamActionDialog
                    action={pendingAction}
                    confirming={confirming}
                    onCancel={closeDialog}
                    onConfirm={() => void confirmPendingAction()}
                    onRemovalReasonChange={setRemovalReason}
                    removalReason={removalReason}
                />
            )}
        </AdminShell>
    );
}
