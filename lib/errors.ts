/** Mensagem de um erro capturado, ou `fallback` quando não é um `Error`. */
export function errorMessage(reason: unknown, fallback: string) {
    return reason instanceof Error ? reason.message : fallback;
}
