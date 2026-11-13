import { adminFetch } from "@/lib/client-api";
import type { AuditLogEntry, Pagination } from "@/lib/types";

export interface AuditResponse {
    data: AuditLogEntry[];
    pagination: Pagination;
}

/** `query` já montada pela tela (page, limit, filtros). */
export function fetchAuditLogs(query: string) {
    return adminFetch<AuditResponse>(`/api/admin/audit-logs?${query}`);
}
