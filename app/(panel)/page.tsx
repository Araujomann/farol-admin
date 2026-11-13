import { DashboardClient } from "@/app/(panel)/dashboard-client";
import { requirePagePermission } from "@/lib/session";

export default async function DashboardPage() {
    await requirePagePermission("stats:read");

    return <DashboardClient />;
}
