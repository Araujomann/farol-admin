/** Cabeçalho padrão das páginas do painel: eyebrow, título, descrição e ações. */
export function PageHeading({
    eyebrow,
    title,
    description,
    children,
}: Readonly<{
    eyebrow: string;
    title: string;
    description: React.ReactNode;
    /** Ações exibidas ao lado do título (botões, links, selos). */
    children?: React.ReactNode;
}>) {
    return (
        <div className="page-heading">
            <div>
                <div className="eyebrow"><span className="eyebrow-dot" /> {eyebrow}</div>
                <h1>{title}</h1>
                <p>{description}</p>
            </div>
            {children}
        </div>
    );
}
