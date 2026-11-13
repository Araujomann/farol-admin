import { Icon } from "@/app/components/ui-icon";
import type { ModerationHistoryModerator } from "@/lib/types";

const decisions = [
    { value: "", label: "Todas as decisões" },
    { value: "APPROVED", label: "Aprovações" },
    { value: "REJECTED", label: "Rejeições" },
];

export function HistoryFilters({
    moderators,
    moderatorId,
    status,
    from,
    to,
    hasFilters,
    loading,
    onModeratorChange,
    onStatusChange,
    onFromChange,
    onToChange,
    onClear,
    onRefresh,
}: Readonly<{
    moderators: ModerationHistoryModerator[];
    moderatorId: string;
    status: string;
    from: string;
    to: string;
    hasFilters: boolean;
    loading: boolean;
    onModeratorChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onFromChange: (value: string) => void;
    onToChange: (value: string) => void;
    onClear: () => void;
    onRefresh: () => void;
}>) {
    return (
        <section aria-label="Filtros do histórico" className="filter-bar history-filters">
            <label className="select-field">
                <span className="sr-only">Filtrar por pessoa</span>
                <select
                    onChange={(event) => onModeratorChange(event.target.value)}
                    value={moderatorId}
                >
                    <option value="">Toda a equipe</option>
                    {moderators.map((moderator) => (
                        <option key={moderator.id} value={moderator.id}>
                            {moderator.is_deleted ? "Conta removida" : moderator.name} (
                            {moderator.decisions_count})
                        </option>
                    ))}
                </select>
            </label>
            <label className="select-field">
                <span className="sr-only">Filtrar por decisão</span>
                <select
                    onChange={(event) => onStatusChange(event.target.value)}
                    value={status}
                >
                    {decisions.map((item) => (
                        <option key={item.value} value={item.value}>
                            {item.label}
                        </option>
                    ))}
                </select>
            </label>
            <label className="select-field date-field">
                <span>De</span>
                <input
                    max={to || undefined}
                    onChange={(event) => onFromChange(event.target.value)}
                    type="date"
                    value={from}
                />
            </label>
            <label className="select-field date-field">
                <span>Até</span>
                <input
                    min={from || undefined}
                    onChange={(event) => onToChange(event.target.value)}
                    type="date"
                    value={to}
                />
            </label>
            {hasFilters && (
                <button
                    className="button button-outline button-small"
                    onClick={onClear}
                    type="button"
                >
                    Limpar filtros
                </button>
            )}
            <button
                aria-label="Atualizar histórico"
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
