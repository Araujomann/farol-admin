import { adminFetch } from "@/lib/client-api";
import type { PlatformSettingItem } from "@/lib/types";

export function fetchSettings() {
    return adminFetch<{ data: PlatformSettingItem[] }>("/api/admin/settings");
}

/** Envia só as chaves alteradas; a API devolve a lista completa atualizada. */
export function updateSettings(changes: Record<string, number>) {
    return adminFetch<{ data: PlatformSettingItem[] }>("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(changes),
    });
}
