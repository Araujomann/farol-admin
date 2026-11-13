import { SeverityPill } from "@/app/components/severity-pill";
import { Icon } from "@/app/components/ui-icon";
import {
    formatClassification,
    formatDate,
    formatWeather,
} from "@/lib/format";
import { openStreetMapUrls } from "@/lib/map";
import type { AccidentDetail } from "@/lib/types";

/**
 * Card principal do relato: texto (o formulário de edição entra por
 * `editForm` quando o relato é editável), dados da ocorrência e mapa.
 */
export function ReportInfoCard({
    accident,
    editForm,
}: Readonly<{
    accident: AccidentDetail;
    /** `null` quando o relato não pode ser editado pela conta atual. */
    editForm: React.ReactNode;
}>) {
    const isPending = accident.moderation_status === "PENDING";
    const { mapUrl, mapEmbedUrl } = openStreetMapUrls(accident.latitude, accident.longitude);

    return (
        <section className="content-card">
            <div className="section-heading">
                <div>
                    <div className="eyebrow detail-eyebrow">
                        <Icon name="reports" /> INFORMAÇÕES DO RELATO
                    </div>
                    <h2>Texto e dados da ocorrência</h2>
                </div>
                <SeverityPill severity={accident.severity} />
            </div>
            {editForm ?? (
                <p className="description-text">
                    {isPending && (
                        // Sem o formulário de edição, o título
                        // pendente não apareceria em lugar nenhum.
                        <>
                            <strong>{accident.tipo_acidente}</strong>
                            <br />
                        </>
                    )}
                    {accident.description ||
                        "O usuário não adicionou uma descrição."}
                </p>
            )}
            <div className="detail-facts">
                <div className="fact">
                    <span><Icon name="calendar" /> Data e hora da ocorrência</span>
                    <strong>{formatDate(accident.occurred_at)}</strong>
                </div>
                <div className="fact">
                    <span><Icon name="upload" /> Data de envio</span>
                    <strong>{formatDate(accident.created_at)}</strong>
                </div>
                <div className="fact">
                    <span><Icon name="alert" /> Classificação</span>
                    <strong>{formatClassification(accident.classificacao_acidente)}</strong>
                </div>
                <div className="fact">
                    <span><Icon name="cloud" /> Condição climática</span>
                    <strong>{formatWeather(accident.condicao_meteorologica)}</strong>
                </div>
            </div>
            <a className="fact-map-link" href={mapUrl} rel="noreferrer" target="_blank">
                <span><Icon name="pin" /> Coordenadas geográficas</span>
                <strong>{accident.latitude.toFixed(6)}, {accident.longitude.toFixed(6)}</strong>
                <span className="map-link-label">Ver localização no mapa <Icon name="arrow" /></span>
            </a>
            <iframe
                className="report-map"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                src={mapEmbedUrl}
                title={`Mapa da ocorrência ${accident.tipo_acidente}`}
            />
        </section>
    );
}
