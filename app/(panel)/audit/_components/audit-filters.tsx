import { actionLabels } from "@/app/(panel)/audit/audit-format";
import { Icon } from "@/app/components/ui-icon";
import type { AuditAction } from "@/lib/types";

export function AuditFilters({
    action,
    from,
    to,
    loading,
    onActionChange,
    onFromChange,
    onToChange,
    onRefresh,
}: Readonly<{
    action: string;
    from: string;
    to: string;
    loading: boolean;
    onActionChange: (value: string) => void;
    onFromChange: (value: string) => void;
    onToChange: (value: string) => void;
    onRefresh: () => void;
}>) {
    return (
        <section aria-label="Filtros da auditoria" className="filter-bar history-filters">
            <label className="select-field">
                <span className="sr-only">Filtrar por ação</span>
                <select onChange={(event) => onActionChange(event.target.value)} value={action}>
                    <option value="">Todas as ações</option>
                    {(Object.keys(actionLabels) as AuditAction[]).map((key) => (
                        <option key={key} value={key}>{actionLabels[key]}</option>
                    ))}
                </select>
            </label>
            <label className="select-field date-field">
                <span>De</span>
                <input max={to || undefined} onChange={(event) => onFromChange(event.target.value)} type="date" value={from} />
            </label>
            <label className="select-field date-field">
                <span>Até</span>
                <input min={from || undefined} onChange={(event) => onToChange(event.target.value)} type="date" value={to} />
            </label>
            <button
                aria-label="Atualizar auditoria"
                className="filter-refresh"
                disabled={loading}
                onClick={onRefresh}
                type="button"
            >
                <Icon name="refresh" />
            </button>
        </section>
    );
}
