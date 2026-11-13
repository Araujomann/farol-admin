import type { Pagination as PaginationData } from "@/lib/types";

/** Rodapé "Anterior / Próxima" das listas paginadas. Some com uma página só. */
export function Pagination({
    pagination,
    page,
    loading,
    itemsLabel,
    onPrevious,
    onNext,
}: Readonly<{
    /** Paginação devolvida pela API (usada no texto). */
    pagination: PaginationData;
    /** Página pedida pela tela (usada para habilitar os botões). */
    page: number;
    loading: boolean;
    /** Quando informado, mostra o total: "· 42 contas". */
    itemsLabel?: string;
    onPrevious: () => void;
    onNext: () => void;
}>) {
    if (pagination.totalPages <= 1) return null;

    return (
        <div className="pagination">
            <span>
                Página {pagination.page} de {pagination.totalPages}
                {itemsLabel && ` · ${pagination.total} ${itemsLabel}`}
            </span>
            <div>
                <button
                    className="button button-outline button-small"
                    disabled={page <= 1 || loading}
                    onClick={onPrevious}
                >
                    Anterior
                </button>
                <button
                    className="button button-outline button-small"
                    disabled={page >= pagination.totalPages || loading}
                    onClick={onNext}
                >
                    Próxima
                </button>
            </div>
        </div>
    );
}
