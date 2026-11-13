import type { ReportsSort } from "@/app/(panel)/reports/use-reports-list";
import { Icon } from "@/app/components/ui-icon";
import type { ModerationStatus, Severity } from "@/lib/types";

const statuses: Array<{ value: "" | ModerationStatus; label: string }> = [
    { value: "", label: "Todos os status" },
    { value: "PENDING", label: "Pendentes" },
    { value: "APPROVED", label: "Aprovados" },
    { value: "REJECTED", label: "Rejeitados" },
];

const severities: Array<{ value: "" | Severity; label: string }> = [
    { value: "", label: "Todas as gravidades" },
    { value: "low", label: "Baixa" },
    { value: "medium", label: "Média" },
    { value: "high", label: "Alta" },
    { value: "critical", label: "Crítica" },
];

export function ReportsFilters({
    search,
    status,
    severity,
    sort,
    loading,
    onSearchChange,
    onStatusChange,
    onSeverityChange,
    onSortChange,
    onRefresh,
}: Readonly<{
    search: string;
    status: string;
    severity: string;
    sort: ReportsSort;
    loading: boolean;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onSeverityChange: (value: string) => void;
    onSortChange: (value: ReportsSort) => void;
    onRefresh: () => void;
}>) {
    return (
        <section aria-label="Filtros de relatos" className="filter-bar">
            <label className="search-field">
                <Icon name="search" />
                <span className="sr-only">Buscar relato</span>
                <input
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Buscar por tipo ou descrição..."
                    value={search}
                />
            </label>
            <label className="select-field">
                <span className="sr-only">Filtrar por status</span>
                <select onChange={(event) => onStatusChange(event.target.value)} value={status}>
                    {statuses.map((item) => (
                        <option key={item.value} value={item.value}>
                            {item.label}
                        </option>
                    ))}
                </select>
            </label>
            <label className="select-field">
                <span className="sr-only">Filtrar por gravidade</span>
                <select
                    onChange={(event) => onSeverityChange(event.target.value)}
                    value={severity}
                >
                    {severities.map((item) => (
                        <option key={item.value} value={item.value}>
                            {item.label}
                        </option>
                    ))}
                </select>
            </label>
            <label className="select-field sort-field">
                <span className="sr-only">Ordenar relatos</span>
                <select
                    onChange={(event) => onSortChange(event.target.value as ReportsSort)}
                    value={sort}
                >
                    <option value="newest">Mais recentes</option>
                    <option value="oldest">Mais antigos</option>
                </select>
            </label>
            <button
                aria-label="Atualizar lista de relatos"
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
