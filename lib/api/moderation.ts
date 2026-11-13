import { adminFetch } from "@/lib/client-api";
import type {
    AccidentDetail,
    AccidentListItem,
    ApiEnvelope,
    ModerationStatus,
    Pagination,
} from "@/lib/types";

export interface AccidentListResponse {
    data: AccidentListItem[];
    pagination: Pagination;
}

export interface ModerationSummary {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export function fetchModerationSummary() {
    return adminFetch<{ data: ModerationSummary }>("/api/admin/moderation/summary");
}

/** `query` já montada pela tela (page, limit, sort, filtros). */
export function fetchAccidents(query: string) {
    return adminFetch<AccidentListResponse>(`/api/admin/moderation?${query}`);
}

export function fetchAccident(id: string) {
    return adminFetch<ApiEnvelope<AccidentDetail>>(`/api/admin/moderation/${id}`);
}

export function updateAccidentText(
    id: string,
    changes: { tipo_acidente: string; description: string },
) {
    return adminFetch<ApiEnvelope<AccidentDetail>>(`/api/admin/moderation/${id}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
    });
}

export function decideAccident(
    id: string,
    decision: {
        status: Exclude<ModerationStatus, "PENDING">;
        publicMessage: string;
        internalNote: string;
    },
) {
    return adminFetch<ApiEnvelope<AccidentDetail>>(`/api/admin/${id}/moderation`, {
        method: "PATCH",
        body: JSON.stringify(decision),
    });
}
