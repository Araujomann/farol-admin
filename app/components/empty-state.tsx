import { Icon, type IconName } from "@/app/components/ui-icon";

/** Mensagem exibida abaixo de uma tabela sem resultados. */
export function EmptyState({
    icon,
    title,
    description,
}: Readonly<{
    icon: IconName;
    title: React.ReactNode;
    description: React.ReactNode;
}>) {
    return (
        <div className="empty-state">
            <span className="empty-icon"><Icon name={icon} /></span>
            <strong>{title}</strong>
            <span>{description}</span>
        </div>
    );
}
