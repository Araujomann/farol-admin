import type { ModerationHistoryActor } from "@/lib/types";

/** Nome e e-mail de quem executou uma ação; contas removidas aparecem anonimizadas. */
export function ActorName({ actor }: Readonly<{ actor: ModerationHistoryActor }>) {
    return (
        <>
            <span className="table-primary">
                {actor.is_deleted ? "Conta removida" : actor.name}
            </span>
            <span className="table-secondary">
                {actor.is_deleted ? "Ex-integrante da equipe" : actor.email}
            </span>
        </>
    );
}
