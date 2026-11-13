"use client";

import { useEffect, useState } from "react";
import {
    fetchNotices,
    publishNotice as publishNoticeRequest,
    type AdministrativeNotice,
} from "@/lib/api/notices";
import { errorMessage } from "@/lib/errors";

/** Mural de avisos publicados e o rascunho do novo aviso. */
export function useNotices() {
    const [message, setMessage] = useState("");
    const [notices, setNotices] = useState<AdministrativeNotice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let active = true;
        fetchNotices()
            .then((result) => {
                if (active) {
                    setNotices(result.data);
                    setLoadError(false);
                    setError("");
                }
            })
            .catch((reason: unknown) => {
                if (active) {
                    setLoadError(true);
                    setError(errorMessage(reason, "Não foi possível carregar os avisos."));
                }
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => {
            active = false;
        };
    }, [reloadKey]);

    async function publishNotice(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const normalizedMessage = message.trim();
        if (!normalizedMessage || isPublishing) return;

        setIsPublishing(true);
        setError("");
        setStatus("");

        try {
            const result = await publishNoticeRequest(normalizedMessage);
            setNotices((current) => [
                result.data,
                ...current.filter((notice) => notice.id !== result.data.id),
            ].slice(0, 50));
            setMessage("");
            setStatus("Aviso publicado e disponível no aplicativo Farol.");
        } catch (reason) {
            setError(errorMessage(reason, "Não foi possível publicar o aviso."));
        } finally {
            setIsPublishing(false);
        }
    }

    /** Novo texto no rascunho; limpa as mensagens de resultado. */
    function changeMessage(value: string) {
        setMessage(value);
        setStatus("");
        setError("");
    }

    function retryLoad() {
        setIsLoading(true);
        setError("");
        setReloadKey((value) => value + 1);
    }

    return {
        message,
        changeMessage,
        notices,
        isLoading,
        isPublishing,
        loadError,
        error,
        status,
        publishNotice,
        retryLoad,
    };
}
