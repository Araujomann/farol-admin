/** Linhas de carregamento de uma tabela (`<tbody>`). */
export function TableSkeletonRows({
    rows,
    columns,
}: Readonly<{ rows: number; columns: number }>) {
    return Array.from({ length: rows }).map((_, index) => (
        <tr key={`loading-${index}`}>
            <td colSpan={columns}><span className="table-skeleton" /></td>
        </tr>
    ));
}
