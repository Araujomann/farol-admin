import { describe, expect, it } from "vitest";
import { errorMessage } from "@/lib/errors";
import {
    formatClassification,
    formatSeverity,
    formatStatus,
    formatWeather,
} from "@/lib/format";
import { openStreetMapUrls } from "@/lib/map";
import { formatRole, type UserRole } from "@/lib/permissions";

describe("rótulos", () => {
    it("traduzem os valores conhecidos", () => {
        expect(formatSeverity("critical")).toBe("Crítica");
        expect(formatWeather("ceu_claro")).toBe("Céu claro");
        expect(formatStatus("PENDING")).toBe("Pendente");
        expect(formatRole("moderator")).toBe("Moderador");
    });

    it("mostram o valor cru quando ele é desconhecido", () => {
        expect(formatSeverity("extreme")).toBe("extreme");
        expect(formatWeather("neve")).toBe("neve");
        expect(formatStatus("ARCHIVED")).toBe("ARCHIVED");
        expect(formatRole("owner" as UserRole)).toBe("owner");
    });

    it("classificam só com_vitima como com vítima", () => {
        expect(formatClassification("com_vitima")).toBe("Com vítima");
        expect(formatClassification("sem_vitima")).toBe("Sem vítima");
    });
});

describe("errorMessage", () => {
    it("usa a mensagem do Error ou o fallback", () => {
        expect(errorMessage(new Error("falhou"), "padrão")).toBe("falhou");
        expect(errorMessage("texto", "padrão")).toBe("padrão");
    });
});

describe("openStreetMapUrls", () => {
    it("monta o link e o iframe em volta da coordenada", () => {
        const { mapUrl, mapEmbedUrl } = openStreetMapUrls(-5.5, -47.5);

        expect(mapUrl).toBe(
            "https://www.openstreetmap.org/?mlat=-5.5&mlon=-47.5#map=16/-5.5/-47.5",
        );
        const embed = new URL(mapEmbedUrl);
        expect(embed.searchParams.get("bbox")).toBe("-47.508,-5.505,-47.492,-5.495");
        expect(embed.searchParams.get("marker")).toBe("-5.5,-47.5");
    });
});
