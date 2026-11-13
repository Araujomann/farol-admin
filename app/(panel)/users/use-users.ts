"use client";

import { useCallback, useEffect, useState } from "react";
import type { FlashNotice } from "@/app/components/notice-alert";
import {
    fetchUserDetail,
    fetchUsers,
    reactivateUser,
    revokeUserSessions,
    suspendUser,
    type UsersResponse,
} from "@/lib/api/users";
import { errorMessage } from "@/lib/errors";
import type { AdminUser, AdminUserDetail } from "@/lib/types";

export type PendingUserAction =
    | { kind: "suspend"; user: AdminUser }
    | { kind: "reactivate"; user: AdminUser }
    | { kind: "sessions"; user: AdminUser };

/** Lista de contas com filtros, detalhes expansíveis e ações de moderação de conta. */
export function useUsers() {
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [reloadKey, setReloadKey] = useState(0);
    const [result, setResult] = useState<UsersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [expandedId, setExpandedId] = useState("");
    const [details, setDetails] = useState<Record<string, AdminUserDetail>>({});

    const [pendingAction, setPendingAction] = useState<PendingUserAction | null>(null);
    const [reason, setReason] = useState("");
    const [confirming, setConfirming] = useState(false);
    const [notice, setNotice] = useState<FlashNotice | null>(null);

    useEffect(() => {
        let active = true;
        const query = new URLSearchParams({ page: String(page), limit: "20" });
        if (search.trim()) query.set("search", search.trim());
        if (role) query.set("role", role);
        if (status) query.set("status", status);

        const timer = window.setTimeout(async () => {
            try {
                const response = await fetchUsers(query.toString());
                if (active) {
                    setResult(response);
                    setError("");
                }
            } catch (reason) {
                if (active) setError(errorMessage(reason, "Erro ao carregar usuários."));
            } finally {
                if (active) setLoading(false);
            }
        }, 200);

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [page, reloadKey, role, search, status]);

    function updateFilter(setter: (value: string) => void, value: string) {
        setLoading(true);
        setPage(1);
        setter(value);
    }

    function goToPreviousPage() {
        setLoading(true);
        setPage((value) => Math.max(1, value - 1));
    }

    function goToNextPage() {
        setLoading(true);
        setPage((value) => value + 1);
    }

    async function toggleDetails(user: AdminUser) {
        if (expandedId === user.id) {
            setExpandedId("");
            return;
        }
        setExpandedId(user.id);
        try {
            const response = await fetchUserDetail(user.id);
            setDetails((current) => ({ ...current, [user.id]: response.data }));
        } catch (reason) {
            setNotice({ tone: "error", text: errorMessage(reason, "Erro ao carregar detalhes.") });
        }
    }

    const closeDialog = useCallback(() => {
        setPendingAction(null);
        setReason("");
    }, []);

    async function confirmAction() {
        if (!pendingAction) return;
        const { kind, user } = pendingAction;
        setConfirming(true);
        setNotice(null);
        try {
            if (kind === "suspend") {
                await suspendUser(user.id, reason.trim());
                setNotice({ tone: "success", text: `${user.name} foi suspenso(a). As sessões abertas foram encerradas.` });
            } else if (kind === "reactivate") {
                await reactivateUser(user.id);
                setNotice({ tone: "success", text: `${user.name} pode entrar novamente.` });
            } else {
                const response = await revokeUserSessions(user.id);
                setNotice({
                    tone: "success",
                    text: `${response.data.revoked_sessions} sessão(ões) de ${user.name} encerrada(s).`,
                });
            }
            setDetails((current) => {
                const next = { ...current };
                delete next[user.id];
                return next;
            });
            setExpandedId("");
            setLoading(true);
            setReloadKey((value) => value + 1);
        } catch (reason) {
            setNotice({ tone: "error", text: errorMessage(reason, "Não foi possível concluir a ação.") });
        } finally {
            setConfirming(false);
            setPendingAction(null);
            setReason("");
        }
    }

    return {
        filters: { search, role, status },
        changeSearch: (value: string) => updateFilter(setSearch, value),
        changeRole: (value: string) => updateFilter(setRole, value),
        changeStatus: (value: string) => updateFilter(setStatus, value),
        page,
        goToPreviousPage,
        goToNextPage,
        result,
        loading,
        error,
        expandedId,
        details,
        toggleDetails,
        pendingAction,
        setPendingAction,
        reason,
        setReason,
        confirming,
        notice,
        closeDialog,
        confirmAction,
    };
}
