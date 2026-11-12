import { ReportsClient } from "@/app/reports/reports-client";
import type { ModerationStatus, Severity } from "@/lib/types";

type ReportsPageProps = {
    searchParams: Promise<{
        status?: string | string[];
        search?: string | string[];
        severity?: string | string[];
    }>;
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
    const requestedSearch = Array.isArray(params.search)
        ? params.search[0]
        : params.search;
    const requestedSeverity = Array.isArray(params.severity)
        ? params.severity[0]
        : params.severity;
    const initialStatus =
        requestedStatus && moderationStatuses.includes(requestedStatus as ModerationStatus)
            ? requestedStatus
            : "";
    const severities: Severity[] = ["low", "medium", "high", "critical"];
    const initialSeverity =
        requestedSeverity && severities.includes(requestedSeverity as Severity)
            ? requestedSeverity
            : "";

    return (
        <ReportsClient
            key={`${initialStatus}:${initialSeverity}:${requestedSearch ?? ""}`}
            initialSearch={requestedSearch ?? ""}
            initialSeverity={initialSeverity}
            initialStatus={initialStatus}
        />
    );
}
