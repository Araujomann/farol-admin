import { vi } from "vitest";

/**
 * Estado falso de `next/headers` para cada teste. Use junto com:
 * `vi.mock("next/headers", async () => (await import("./next-headers-mock")).nextHeadersMock)`
 * (a factory sobe para o topo do arquivo, por isso o import dinâmico).
 */
export const requestState = {
    cookies: new Map<string, string>(),
    headers: new Headers(),
    reset() {
        this.cookies = new Map();
        this.headers = new Headers();
    },
};

export const cookieStore = {
    get: vi.fn((name: string) => {
        const value = requestState.cookies.get(name);
        return value === undefined ? undefined : { name, value };
    }),
    set: vi.fn((name: string, value: string) => {
        requestState.cookies.set(name, value);
    }),
    delete: vi.fn((name: string) => {
        requestState.cookies.delete(name);
    }),
};

export const nextHeadersMock = {
    cookies: async () => cookieStore,
    headers: async () => requestState.headers,
};
