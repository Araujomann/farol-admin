import { InviteClient } from "@/app/invite/invite-client";

export const metadata = { title: "Convite para moderação · Farol Admin" };

// Pública: quem aceita ainda não tem acesso ao painel. O token chega no
// fragmento (#token=...), que só o navegador lê.
export default function InvitePage() {
    return <InviteClient />;
}
