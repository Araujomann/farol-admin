import { Icon } from "@/app/components/ui-icon";

export function UsersFilters({
    search,
    role,
    status,
    onSearchChange,
    onRoleChange,
    onStatusChange,
}: Readonly<{
    search: string;
    role: string;
    status: string;
    onSearchChange: (value: string) => void;
    onRoleChange: (value: string) => void;
    onStatusChange: (value: string) => void;
}>) {
    return (
        <section aria-label="Filtros de usuários" className="filter-bar history-filters">
            <label className="search-field">
                <Icon name="search" />
                <span className="sr-only">Buscar por nome ou e-mail</span>
                <input
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Buscar por nome ou e-mail..."
                    value={search}
                />
            </label>
            <label className="select-field">
                <span className="sr-only">Filtrar por papel</span>
                <select onChange={(event) => onRoleChange(event.target.value)} value={role}>
                    <option value="">Todos os papéis</option>
                    <option value="user">Usuários</option>
                    <option value="moderator">Moderadores</option>
                    <option value="admin">Administradores</option>
                </select>
            </label>
            <label className="select-field">
                <span className="sr-only">Filtrar por situação</span>
                <select onChange={(event) => onStatusChange(event.target.value)} value={status}>
                    <option value="">Todas as situações</option>
                    <option value="active">Ativas</option>
                    <option value="suspended">Suspensas</option>
                </select>
            </label>
        </section>
    );
}
