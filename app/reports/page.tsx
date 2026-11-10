import { ReportsClient } from "@/app/reports/reports-client";
import type { ModerationStatus } from "@/lib/types";

type ReportsPageProps = {
    searchParams: Promise<{ status?: string | string[] }>;
};

const moderationStatuses: ModerationStatus[] = [
    "PENDING",
    "APPROVED",
    "REJECTED",
];

export default async function ReportsPage({
    searchParams,
}: ReportsPageProps) {
    const params = await searchParams;
    const requestedStatus = Array.isArray(params.status)
        ? params.status[0]
        : params.status;
    const initialStatus =
        requestedStatus && moderationStatuses.includes(requestedStatus as ModerationStatus)
            ? requestedStatus
            : "";

    return <ReportsClient initialStatus={initialStatus} />;
}
