import Link from "next/link";
import { SeverityPill } from "@/app/components/severity-pill";
import { StatusBadge } from "@/app/components/status-badge";
import { Icon } from "@/app/components/ui-icon";
import { formatDate } from "@/lib/format";
import type { AccidentListItem } from "@/lib/types";

export function ReportRow({ accident }: Readonly<{ accident: AccidentListItem }>) {
    return (
        <tr>
            <td>
                <div className="report-title-line">
                    <span className={`report-row-icon icon-${accident.severity}`}>
                        <Icon name={accident.severity === "critical" ? "alert" : "pin"} />
                    </span>
                    <Link className="report-title" href={`/reports/${accident.id}`}>
                        {accident.tipo_acidente}
                    </Link>
                </div>
                <span className="report-subtitle">
                    {accident.description || "Sem descrição adicional"}
                </span>
            </td>
            <td>
                <span className="table-primary">
                    {formatDate(accident.occurred_at)}
                </span>
                <span className="table-secondary">
                    Enviado {formatDate(accident.created_at)}
                </span>
            </td>
            <td>
                <span className="table-primary">
                    {accident.created_by?.name ?? "Usuário indisponível"}
                </span>
                <span className="table-secondary">
                    {accident.created_by?.email ?? "—"}
                </span>
            </td>
            <td>
                <SeverityPill severity={accident.severity} />
            </td>
            <td><StatusBadge status={accident.moderation_status} /></td>
            <td>
                <Link
                    aria-label={`Analisar relato ${accident.tipo_acidente}`}
                    className="row-action"
                    href={`/reports/${accident.id}`}
                >
                    <Icon name="arrow" />
                </Link>
            </td>
        </tr>
    );
}
