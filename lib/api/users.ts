import { adminFetch } from "@/lib/client-api";
import type { AdminUser, AdminUserDetail, Pagination } from "@/lib/types";

export interface UsersResponse {
    data: AdminUser[];
    pagination: Pagination;
}

/** `query` já montada pela tela (page, limit, filtros). */
export function fetchUsers(query: string) {
    return adminFetch<UsersResponse>(`/api/admin/users?${query}`);
}

export function fetchUserDetail(userId: string) {
    return adminFetch<{ data: AdminUserDetail }>(`/api/admin/users/${userId}`);
}

export function suspendUser(userId: string, reason: string) {
    return adminFetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
        body: JSON.stringify({ reason }),
    });
}

export function reactivateUser(userId: string) {
    return adminFetch(`/api/admin/users/${userId}/reactivate`, { method: "POST" });
}

export function revokeUserSessions(userId: string) {
    return adminFetch<{ data: { revoked_sessions: number } }>(
        `/api/admin/users/${userId}/sessions/revoke`,
        { method: "POST" },
    );
}
