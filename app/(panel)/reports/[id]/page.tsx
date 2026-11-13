import { ReportDetailClient } from "@/app/(panel)/reports/[id]/report-detail-client";
import { requirePagePermission } from "@/lib/session";

export default async function ReportDetailPage() {
    await requirePagePermission("reports:read");

    return <ReportDetailClient />;
}
