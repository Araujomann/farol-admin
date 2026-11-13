import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/app/components/ui-icon";
import { SignOutButton } from "@/app/sem-permissao/sign-out-button";
import { formatRole } from "@/lib/permissions";
import { getSession } from "@/lib/session";

export const metadata = { title: "Sem permissão · Farol Admin" };

export default async function AccessDeniedPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const hasPanelAccess = session.permissions.includes("panel:access");

    return (
        <main className="access-denied-page">
            <section className="loading-card access-denied-card" aria-labelledby="access-denied-title">
                <span className="empty-icon" aria-hidden="true">
                    <Icon name="lock" />
                </span>
                <h1 id="access-denied-title">Acesso não permitido</h1>
                <p>
                    {hasPanelAccess
                        ? "Sua conta não tem permissão para abrir esta área do painel."
                        : "Sua conta não tem mais acesso ao painel administrativo."}
                </p>
                <p className="access-denied-account">
                    {session.email} · {formatRole(session.role)}
                </p>
                <div className="access-denied-actions">
                    {hasPanelAccess && (
                        <Link className="button button-primary" href="/">
                            Voltar à visão geral
                        </Link>
                    )}
                    <SignOutButton />
                </div>
            </section>
        </main>
    );
}
