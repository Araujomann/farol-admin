import { UsersClient } from "@/app/(panel)/users/users-client";
import { requirePagePermission } from "@/lib/session";

export const metadata = { title: "Usuários · Farol Admin" };

export default async function UsersPage() {
    const user = await requirePagePermission("users:manage");

    return <UsersClient currentUserId={user.id} />;
}
