"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchInvites, fetchModerators, type InvitesResponse } from "@/lib/api/team";
import { errorMessage } from "@/lib/errors";
import type { InviteStatus, TeamMember } from "@/lib/types";

/**
 * Equipe atual (só para quem pode remover moderadores) e lista de convites
 * filtrada por status. `reload` busca as duas listas de novo.
 */
export function useTeamLists(canRemove: boolean) {
    const [team, setTeam] = useState<TeamMember[] | null>(null);
    const [invites, setInvites] = useState<InvitesResponse | null>(null);
    const [inviteFilter, setInviteFilter] = useState<"" | InviteStatus>("");
    const [reloadKey, setReloadKey] = useState(0);
    const [loadError, setLoadError] = useState("");

    const reload = useCallback(() => setReloadKey((value) => value + 1), []);

    useEffect(() => {
        if (!canRemove) return;
        let active = true;
        fetchModerators()
            .then((response) => active && setTeam(response.data))
            .catch((reason) => active && setLoadError(errorMessage(reason, "Erro ao carregar a equipe.")));
        return () => {
            active = false;
        };
    }, [canRemove, reloadKey]);

    useEffect(() => {
        let active = true;
        const query = new URLSearchParams({ limit: "50" });
        if (inviteFilter) query.set("status", inviteFilter);
        fetchInvites(query.toString())
            .then((response) => active && setInvites(response))
            .catch((reason) => active && setLoadError(errorMessage(reason, "Erro ao carregar os convites.")));
        return () => {
            active = false;
        };
    }, [inviteFilter, reloadKey]);

    return { team, invites, inviteFilter, setInviteFilter, loadError, reload };
}
