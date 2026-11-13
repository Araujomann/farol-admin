import { formatSeverity } from "@/lib/format";
import type { Severity } from "@/lib/types";

export function SeverityPill({ severity }: Readonly<{ severity: Severity }>) {
    return (
        <span className={`severity severity-${severity}`}>
            <span className="severity-dot" />
            {formatSeverity(severity)}
        </span>
    );
}
