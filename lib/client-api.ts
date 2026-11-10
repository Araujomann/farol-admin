import type { ApiError } from "@/lib/types";

export async function adminFetch<T>(
    path: string,
    init?: RequestInit,
): Promise<T> {
    const response = await fetch(path, {
        ...init,
        cache: "no-store",
        headers: {
            ...(init?.body ? { "Content-Type": "application/json" } : {}),
            ...init?.headers,
        },
    });

    if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as ApiError | null;
        if (response.status === 401) {
            window.dispatchEvent(new Event("farol:unauthorized"));
        }
        throw new Error(
            payload?.error?.message ??
                `Não foi possível concluir a solicitação (${response.status}).`,
        );
    }

    return (await response.json()) as T;
}
