import { SettingsClient } from "@/app/(panel)/settings/settings-client";
import { requirePagePermission } from "@/lib/session";

export const metadata = { title: "Configurações · Farol Admin" };

export default async function SettingsPage() {
    await requirePagePermission("settings:manage");

    return <SettingsClient />;
}
