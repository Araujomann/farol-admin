import { adminFetch } from "@/lib/client-api";
import type {
    ModerationHistoryItem,
    ModerationHistoryModerator,
    Pagination,
} from "@/lib/types";

export interface HistoryResponse {
    data: ModerationHistoryItem[];
    pagination: Pagination;
}

export function fetchHistoryModerators() {
    return adminFetch<{ data: ModerationHistoryModerator[] }>(
        "/api/admin/moderation-history/moderators",
    );
}

/** `query` já montada pela tela (page, limit, filtros). */
export function fetchModerationHistory(query: string) {
    return adminFetch<HistoryResponse>(`/api/admin/moderation-history?${query}`);
}
