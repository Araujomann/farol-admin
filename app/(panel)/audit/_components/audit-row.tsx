import { actionLabels, describeAuditEntry } from "@/app/(panel)/audit/audit-format";
import { ActorName } from "@/app/components/actor-name";
import { formatDate } from "@/lib/format";
import type { AuditLogEntry } from "@/lib/types";

export function AuditRow({ entry }: Readonly<{ entry: AuditLogEntry }>) {
    return (
        <tr>
            <td>
                <span className="table-primary">{formatDate(entry.created_at)}</span>
                {entry.ip && <span className="table-secondary">IP {entry.ip}</span>}
            </td>
            <td><span className="table-primary">{actionLabels[entry.action] ?? entry.action}</span></td>
            <td>
                {entry.actor ? (
                    <ActorName actor={entry.actor} />
                ) : (
                    <span className="table-primary">Script / sistema</span>
                )}
            </td>
            <td className="history-notes">
                <span className="table-primary">{describeAuditEntry(entry) || "—"}</span>
                <details className="audit-raw">
                    <summary>Dados completos</summary>
                    <pre>{JSON.stringify(entry.metadata, null, 2)}</pre>
                </details>
            </td>
        </tr>
    );
}
