import { TeamClient } from "@/app/(panel)/team/team-client";
import { requirePagePermission } from "@/lib/session";

export const metadata = { title: "Equipe e convites · Farol Admin" };

export default async function TeamPage() {
    const user = await requirePagePermission("invites:manage");

    return <TeamClient currentUserId={user.id} />;
}
