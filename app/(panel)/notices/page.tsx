import { NoticesClient } from "@/app/(panel)/notices/notices-client";
import { requirePagePermission } from "@/lib/session";

export default async function NoticesPage() {
    await requirePagePermission("notices:publish");

    return <NoticesClient />;
}
