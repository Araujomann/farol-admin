import { ModerationHistoryClient } from "@/app/(panel)/moderation-history/moderation-history-client";
import { requirePagePermission } from "@/lib/session";

export const metadata = { title: "Histórico de moderação · Farol Admin" };

export default async function ModerationHistoryPage() {
    await requirePagePermission("moderation_history:read");

    return <ModerationHistoryClient />;
}
