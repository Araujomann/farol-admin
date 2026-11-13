import Link from "next/link";
import { Icon } from "@/app/components/ui-icon";

export function WelcomePanel() {
    return (
        <section className="welcome-panel">
            <div className="welcome-symbol"><Icon name="refresh" /></div>
            <div className="welcome-copy">
                <div className="eyebrow"><span className="eyebrow-dot" /> FLUXO DE MODERAÇÃO</div>
                <h2>Relatos avaliados com cuidado fazem um mapa mais confiável.</h2>
                <p>
                    Revise as informações enviadas, registre uma mensagem ao usuário
                    e decida se o relato pode ser publicado.
                </p>
                <Link className="inline-link" href="/reports?status=PENDING">
                    Abrir fila de análise <Icon name="arrow" />
                </Link>
            </div>
            <div className="welcome-art" aria-hidden="true">
                <span className="art-ring art-ring-one" />
                <span className="art-ring art-ring-two" />
                <span className="art-ring art-ring-three" />
                <span className="art-pin"><Icon name="pin" /></span>
            </div>
        </section>
    );
}
