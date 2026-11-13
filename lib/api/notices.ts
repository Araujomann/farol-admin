import { adminFetch } from "@/lib/client-api";

export interface AdministrativeNotice {
    id: string;
    message: string;
    created_at: string;
}

const NOTICES_PATH = "/api/admin/notifications/administrative-notices";

export function fetchNotices() {
    return adminFetch<{ data: AdministrativeNotice[] }>(NOTICES_PATH);
}

export function publishNotice(message: string) {
    return adminFetch<{ data: AdministrativeNotice }>(NOTICES_PATH, {
        method: "POST",
        body: JSON.stringify({ message }),
    });
}
