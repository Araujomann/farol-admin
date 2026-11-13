import Link from "next/link";
import { ActorName } from "@/app/components/actor-name";
import { StatusBadge } from "@/app/components/status-badge";
import { formatDate, formatSeverity } from "@/lib/format";
import type { ModerationHistoryItem } from "@/lib/types";

export function HistoryRow({ entry }: Readonly<{ entry: ModerationHistoryItem }>) {
    return (
        <tr>
            <td>
                <span className="table-primary">
                    {formatDate(entry.created_at)}
                </span>
            </td>
            <td>
                <Link
                    className="report-title"
                    href={`/reports/${entry.accident.id}`}
                >
                    {entry.accident.tipo_acidente}
                </Link>
                <span className="table-secondary">
                    Gravidade {formatSeverity(entry.accident.severity).toLowerCase()}
                    {" · "}#{entry.accident.id.slice(0, 8).toUpperCase()}
                </span>
            </td>
            <td><StatusBadge status={entry.new_status} /></td>
            <td><ActorName actor={entry.moderated_by} /></td>
            <td className="history-notes">
                {entry.public_message && (
                    <span className="table-primary">
                        {entry.public_message}
                    </span>
                )}
                {entry.internal_note && (
                    <span className="table-secondary">
                        Interna: {entry.internal_note}
                    </span>
                )}
                {!entry.public_message && !entry.internal_note && (
                    <span className="table-secondary">—</span>
                )}
            </td>
        </tr>
    );
}
