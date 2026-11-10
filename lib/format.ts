export function formatDate(value: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export function formatSeverity(value: string) {
    const labels: Record<string, string> = {
        low: "Baixa",
        medium: "Média",
        high: "Alta",
        critical: "Crítica",
    };

    return labels[value] ?? value;
}

export function formatClassification(value: string) {
    return value === "com_vitima" ? "Com vítima" : "Sem vítima";
}

export function formatWeather(value: string) {
    const labels: Record<string, string> = {
        ceu_claro: "Céu claro",
        chuva: "Chuva",
        nublado: "Nublado",
        garoa: "Garoa",
    };

    return labels[value] ?? value;
}

export function formatStatus(value: string) {
    const labels: Record<string, string> = {
        PENDING: "Pendente",
        APPROVED: "Aprovado",
        REJECTED: "Rejeitado",
    };

    return labels[value] ?? value;
}
