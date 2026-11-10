import { formatStatus } from "@/lib/format";
import type { ModerationStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: ModerationStatus }) {
    return (
        <span className={`status-badge status-${status.toLowerCase()}`}>
            <span className="status-dot" />
            {formatStatus(status)}
        </span>
    );
}
