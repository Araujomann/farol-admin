"use client";

import { FormEvent, useCallback, useState } from "react";
import type { FlashNotice } from "@/app/components/notice-alert";
import {
    createInvite,
    resendInvite,
    revokeInvite,
    revokeModerator,
} from "@/lib/api/team";
import { errorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import type { InviteDelivery, ModeratorInvite, TeamMember } from "@/lib/types";

export type PendingTeamAction =
    | { kind: "revoke-invite"; invite: ModeratorInvite }
    | { kind: "remove-moderator"; member: TeamMember };

/** Enviar, reenviar e revogar convites; remover moderadores. */
export function useTeamActions(reload: () => void) {
    const [inviteFormOpen, setInviteFormOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [sending, setSending] = useState(false);

    const [notice, setNotice] = useState<FlashNotice | null>(null);
    const [busyInviteId, setBusyInviteId] = useState("");
    const [pendingAction, setPendingAction] = useState<PendingTeamAction | null>(null);
    const [removalReason, setRemovalReason] = useState("");
    const [confirming, setConfirming] = useState(false);

    function deliveryNotice(delivery: InviteDelivery, verb: string) {
        setNotice(
            delivery.email_sent
                ? {
                      tone: "success",
                      text: `Convite ${verb} para ${delivery.invite.email}. O link vale até ${formatDate(delivery.invite.expires_at)}.`,
                  }
                : {
                      tone: "error",
                      text: `O convite para ${delivery.invite.email} foi ${verb === "enviado" ? "criado" : "renovado"}, mas o e-mail não pôde ser enviado. Tente reenviar em instantes.`,
                  },
        );
    }

    async function sendInvite(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSending(true);
        setNotice(null);
        try {
            const result = await createInvite(inviteEmail.trim());
            deliveryNotice(result.data, "enviado");
            setInviteEmail("");
            setInviteFormOpen(false);
            reload();
        } catch (reason) {
            setNotice({ tone: "error", text: errorMessage(reason, "Não foi possível enviar o convite.") });
        } finally {
            setSending(false);
        }
    }

    async function resend(invite: ModeratorInvite) {
        setBusyInviteId(invite.id);
        setNotice(null);
        try {
            const result = await resendInvite(invite.id);
            deliveryNotice(result.data, "reenviado");
            reload();
        } catch (reason) {
            setNotice({ tone: "error", text: errorMessage(reason, "Não foi possível reenviar o convite.") });
        } finally {
            setBusyInviteId("");
        }
    }

    async function confirmPendingAction() {
        if (!pendingAction) return;
        setConfirming(true);
        setNotice(null);
        try {
            if (pendingAction.kind === "revoke-invite") {
                await revokeInvite(pendingAction.invite.id);
                setNotice({ tone: "success", text: `Convite para ${pendingAction.invite.email} revogado. O link deixou de funcionar.` });
            } else {
                await revokeModerator(pendingAction.member.id, removalReason.trim());
                setNotice({
                    tone: "success",
                    text: `${pendingAction.member.name} não é mais moderador. As sessões abertas foram encerradas.`,
                });
            }
            setPendingAction(null);
            setRemovalReason("");
            reload();
        } catch (reason) {
            setNotice({ tone: "error", text: errorMessage(reason, "Não foi possível concluir a ação.") });
            setPendingAction(null);
        } finally {
            setConfirming(false);
        }
    }

    const closeDialog = useCallback(() => {
        setPendingAction(null);
        setRemovalReason("");
    }, []);

    return {
        inviteFormOpen,
        setInviteFormOpen,
        inviteEmail,
        setInviteEmail,
        sending,
        notice,
        busyInviteId,
        pendingAction,
        setPendingAction,
        removalReason,
        setRemovalReason,
        confirming,
        sendInvite,
        resend,
        confirmPendingAction,
        closeDialog,
    };
}
