import Link from "next/link";
import Image from "next/image";
import type { NavigationItem } from "@/app/components/shell/navigation";
import { Icon } from "@/app/components/ui-icon";

export function Sidebar({
    open,
    pathname,
    items,
    onNavigate,
    onLogout,
}: Readonly<{
    open: boolean;
    pathname: string;
    /** Itens já filtrados pelas permissões da sessão. */
    items: NavigationItem[];
    /** Fecha o menu no celular depois de um clique. */
    onNavigate: () => void;
    onLogout: () => void;
}>) {
    return (
        <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
            <Link
                className="brand"
                href="/"
                onClick={onNavigate}
            >
                <Image
                    alt=""
                    className="brand-logo"
                    height={52}
                    src="/farol-logo.png"
                    width={52}
                />
                <span>
                    <strong>Farol</strong>
                    <small>ADMINISTRAÇÃO</small>
                </span>
            </Link>
            <div className="sidebar-label">NAVEGAÇÃO PRINCIPAL</div>
            <nav aria-label="Navegação principal" className="side-nav">
                {items.map((item) => {
                    const active =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href);
                    return (
                        <Link
                            aria-current={active ? "page" : undefined}
                            className={`nav-link ${active ? "nav-link-active" : ""}`}
                            href={item.href}
                            key={item.href}
                            onClick={onNavigate}
                        >
                            <Icon name={item.icon} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="sidebar-bottom">
                <div className="security-note">
                    <span className="security-dot" />
                    <span>
                        <strong>Status Operacional</strong>
                        <small>Central ativa</small>
                    </span>
                    <Icon name="lock" />
                </div>
                <button
                    className="nav-link logout-link"
                    onClick={onLogout}
                    type="button"
                >
                    <Icon name="logout" />
                    <span>Sair da conta</span>
                </button>
            </div>
        </aside>
    );
}
