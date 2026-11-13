import { Icon } from "@/app/components/ui-icon";
import type { AccidentDetail } from "@/lib/types";

export function ReportImagesCard({
    images,
}: Readonly<{ images: AccidentDetail["images"] }>) {
    return (
        <section className="content-card">
            <div className="section-heading">
                <div>
                    <div className="eyebrow detail-eyebrow">
                        <Icon name="imageOff" /> MÍDIA
                    </div>
                    <h2>Imagens anexadas</h2>
                </div>
                <span className="subtle-count">{images.length}</span>
            </div>
            {images.length ? (
                <div className="image-grid">
                    {images.map((image) => (
                        <a
                            className="report-image"
                            href={image.image_url}
                            key={image.id}
                            rel="noreferrer"
                            target="_blank"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img alt={image.caption ?? "Imagem anexada ao relato"} src={image.image_url} />
                            {image.caption && <span>{image.caption}</span>}
                        </a>
                    ))}
                </div>
            ) : (
                <div className="report-media-empty">
                    <span><Icon name="imageOff" /></span>
                    <strong>Nenhuma imagem foi anexada a este relato.</strong>
                    <p>
                        O cidadão não fez upload de fotos ou registros visuais
                        da ocorrência durante o envio inicial.
                    </p>
                </div>
            )}
        </section>
    );
}
