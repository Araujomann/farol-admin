import { adminFetch } from "@/lib/client-api";
import type {
    InviteDelivery,
    ModeratorInvite,
    Pagination,
    TeamMember,
} from "@/lib/types";

export interface InvitesResponse {
    data: ModeratorInvite[];
    pagination: Pagination;
}

export function fetchModerators() {
    return adminFetch<{ data: TeamMember[] }>("/api/admin/moderators");
}

/** `query` já montada pela tela (limit, status). */
export function fetchInvites(query: string) {
    return adminFetch<InvitesResponse>(`/api/admin/moderator-invites?${query}`);
}

export function createInvite(email: string) {
    return adminFetch<{ data: InviteDelivery }>("/api/admin/moderator-invites", {
        method: "POST",
        body: JSON.stringify({ email }),
    });
}

export function resendInvite(inviteId: string) {
    return adminFetch<{ data: InviteDelivery }>(
        `/api/admin/moderator-invites/${inviteId}/resend`,
        { method: "POST" },
    );
}

export function revokeInvite(inviteId: string) {
    return adminFetch(`/api/admin/moderator-invites/${inviteId}/revoke`, {
        method: "POST",
    });
}

export function revokeModerator(memberId: string, reason: string) {
    return adminFetch(`/api/admin/moderators/${memberId}/revoke`, {
        method: "POST",
        body: JSON.stringify({ reason }),
    });
}
