import { AuditClient } from "@/app/(panel)/audit/audit-client";
import { requirePagePermission } from "@/lib/session";

export const metadata = { title: "Auditoria · Farol Admin" };

export default async function AuditPage() {
    await requirePagePermission("audit:read");

    return <AuditClient />;
}
