import { PermissionsProvider } from "@/app/components/permissions-provider";
import { requirePagePermission } from "@/lib/session";

// Disponibiliza o usuário e as permissões para a interface. Cada página também
// chama `requirePagePermission`, porque layouts não são reavaliados a cada
// navegação.
export default async function PanelLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const user = await requirePagePermission();

    return <PermissionsProvider user={user}>{children}</PermissionsProvider>;
}
