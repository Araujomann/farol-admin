"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/app/components/admin-shell";
import { useCan } from "@/app/components/permissions-provider";
import { Icon } from "@/app/components/ui-icon";
import { StatusBadge } from "@/app/components/status-badge";
import { adminFetch } from "@/lib/client-api";
import {
    formatClassification,
    formatDate,
    formatSeverity,
    formatWeather,
    formatStatus,
} from "@/lib/format";
import type { AccidentDetail, ApiEnvelope, ModerationStatus } from "@/lib/types";

export function ReportDetailClient() {
    const { id } = useParams<{ id: string }>();
    const [accident, setAccident] = useState<AccidentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [publicMessage, setPublicMessage] = useState("");
    const [internalNote, setInternalNote] = useState("");
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const canModerate = useCan("reports:moderate");

    const loadAccident = useCallback(async () => {
        try {
            const result = await adminFetch<ApiEnvelope<AccidentDetail>>(
                `/api/admin/moderation/${id}`,
            );
            setAccident(result.data);
            setPublicMessage(result.data.moderation_message ?? "");
            setInternalNote(result.data.moderation_internal_note ?? "");
            setEditTitle(result.data.tipo_acidente);
            setEditDescription(result.data.description ?? "");
        } catch (reason) {
            setError(
                reason instanceof Error ? reason.message : "Erro ao carregar o relato.",
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const timer = window.setTimeout(() => void loadAccident(), 0);
        return () => window.clearTimeout(timer);
    }, [loadAccident]);

    const hasUnsavedChanges =
        accident !== null &&
        (editTitle !== accident.tipo_acidente ||
            editDescription !== (accident.description ?? ""));

    async function saveEdits() {
        if (!accident || accident.moderation_status !== "PENDING") return;
        if (editTitle.trim().length < 3) {
            setError("O título do relato deve ter pelo menos 3 caracteres.");
            return;
        }

        setSaving(true);
        setError("");
        setNotice("");
        try {
            const result = await adminFetch<ApiEnvelope<AccidentDetail>>(
                `/api/admin/moderation/${accident.id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        tipo_acidente: editTitle,
                        description: editDescription,
                    }),
                },
            );
            setAccident(result.data);
            setEditTitle(result.data.tipo_acidente);
            setEditDescription(result.data.description ?? "");
            setNotice("Texto do relato atualizado.");
        } catch (reason) {
            setError(
                reason instanceof Error
                    ? reason.message
                    : "Não foi possível salvar as alterações.",
            );
        } finally {
            setSaving(false);
        }
    }

    async function decide(status: Exclude<ModerationStatus, "PENDING">) {
        if (!accident) return;
        if (hasUnsavedChanges) {
            setError("Salve as alterações do relato antes de registrar a decisão.");
            return;
        }
        if (status === "REJECTED" && !publicMessage.trim()) {
            setError("Informe uma justificativa que poderá ser enviada ao usuário.");
            return;
        }
        const label = status === "APPROVED" ? "aprovar" : "rejeitar";
        if (!window.confirm(`Confirma ${label} este relato? Essa decisão não poderá ser alterada.`)) {
            return;
        }

        setSaving(true);
        setError("");
        setNotice("");
        try {
            const result = await adminFetch<ApiEnvelope<AccidentDetail>>(
                `/api/admin/${accident.id}/moderation`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        status,
                        publicMessage: publicMessage.trim(),
                        internalNote: internalNote.trim(),
                    }),
                },
            );
            setAccident(result.data);
            setNotice(
                status === "APPROVED"
                    ? "Relato aprovado e elegível para publicação no mapa."
                    : "Relato rejeitado. A justificativa foi registrada para retorno ao usuário.",
            );
        } catch (reason) {
            setError(
                reason instanceof Error ? reason.message : "Não foi possível registrar a decisão.",
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <AdminShell>
                <div className="loading-card">Carregando relato...</div>
            </AdminShell>
        );
    }

    if (error && !accident) {
        return (
            <AdminShell>
                <Link className="back-link" href="/reports">← Voltar aos relatos</Link>
                <div className="alert alert-error" role="alert">{error}</div>
            </AdminShell>
        );
    }

    if (!accident) return null;

    const isPending = accident.moderation_status === "PENDING";
    // Relato decidido: travado para todos. Pendente: só quem pode moderar edita.
    const editable = isPending && canModerate;
    const mapUrl = `https://www.openstreetmap.org/?mlat=${accident.latitude}&mlon=${accident.longitude}#map=16/${accident.latitude}/${accident.longitude}`;
    const mapBounds = [
        accident.longitude - 0.008,
        accident.latitude - 0.005,
        accident.longitude + 0.008,
        accident.latitude + 0.005,
    ].join(",");
    const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds}&layer=mapnik&marker=${accident.latitude}%2C${accident.longitude}`;

    return (
        <AdminShell>
            <div className="detail-toolbar">
                <Link className="back-link" href="/reports">
                    <Icon name="arrow" /> Voltar aos relatos
                </Link>
                <span className="detail-protocol">
                    / Protocolo #{accident.id.slice(0, 8).toUpperCase()}
                </span>
                <StatusBadge status={accident.moderation_status} />
            </div>
            <h1 className="sr-only">Análise do relato: {accident.tipo_acidente}</h1>

            {error && <div className="alert alert-error" role="alert">{error}</div>}
            {notice && <div className="alert alert-success" role="status">{notice}</div>}

            <div className="detail-grid">
                <div className="detail-main">
                    <section className="content-card">
                        <div className="section-heading">
                            <div>
                                <div className="eyebrow detail-eyebrow">
                                    <Icon name="reports" /> INFORMAÇÕES DO RELATO
                                </div>
                                <h2>Texto e dados da ocorrência</h2>
                            </div>
                            <span className={`severity severity-${accident.severity}`}>
                                <span className="severity-dot" />
                                {formatSeverity(accident.severity)}
                            </span>
                        </div>
                        {editable ? (
                            <form
                                className="report-edit-form"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void saveEdits();
                                }}
                            >
                                <label className="report-edit-field">
                                    <span className="report-field-heading">
                                        <span className="form-label">Título do relato</span>
                                        <span>Identificador principal</span>
                                    </span>
                                    <span className="report-title-input-wrap">
                                        <input
                                            className="text-input"
                                            disabled={saving}
                                            maxLength={180}
                                            minLength={3}
                                            onChange={(event) => setEditTitle(event.target.value)}
                                            required
                                            value={editTitle}
                                        />
                                        <Icon name="edit" />
                                    </span>
                                </label>
                                <label className="report-edit-field">
                                    <span className="report-field-heading">
                                        <span className="form-label">Descrição</span>
                                        <span>Enviada pelo relator</span>
                                    </span>
                                    <textarea
                                        className="text-area"
                                        disabled={saving}
                                        maxLength={4000}
                                        onChange={(event) =>
                                            setEditDescription(event.target.value)
                                        }
                                        placeholder="O usuário não adicionou uma descrição."
                                        value={editDescription}
                                    />
                                </label>
                                <div className="report-edit-actions">
                                    <button
                                        className="button button-primary button-small"
                                        disabled={saving || !hasUnsavedChanges}
                                        type="submit"
                                    >
                                        {saving ? "Salvando..." : "Salvar alterações"}
                                    </button>
                                    {hasUnsavedChanges && (
                                        <span>Salve as alterações antes de decidir.</span>
                                    )}
                                </div>
                            </form>
                        ) : (
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

                    <section className="content-card">
                        <div className="section-heading">
                            <div>
                                <div className="eyebrow detail-eyebrow">
                                    <Icon name="imageOff" /> MÍDIA
                                </div>
                                <h2>Imagens anexadas</h2>
                            </div>
                            <span className="subtle-count">{accident.images.length}</span>
                        </div>
                        {accident.images.length ? (
                            <div className="image-grid">
                                {accident.images.map((image) => (
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

                    <section className="content-card">
                        <div className="section-heading">
                            <div>
                                <div className="eyebrow detail-eyebrow">
                                    <Icon name="refresh" /> RASTREABILIDADE
                                </div>
                                <h2>Histórico de auditoria e logs</h2>
                            </div>
                            <span className="audit-caption">Ações registradas pelo sistema</span>
                        </div>
                        {accident.moderation_history.length ? (
                            <ol className="history-list">
                                {accident.moderation_history.map((entry) => (
                                    <li key={entry.id}>
                                        <span className={`history-marker history-${entry.new_status.toLowerCase()}`} />
                                        <div className="history-copy">
                                            <strong>
                                                {formatStatus(entry.previous_status)} → {formatStatus(entry.new_status)}
                                            </strong>
                                            <span>{entry.moderated_by.name} · {formatDate(entry.created_at)}</span>
                                            {entry.public_message && (
                                                <p><b>Mensagem ao usuário:</b> {entry.public_message}</p>
                                            )}
                                            {entry.internal_note && (
                                                <p><b>Observação interna:</b> {entry.internal_note}</p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <div className="audit-empty">
                                <span className="audit-empty-icon"><Icon name="reports" /></span>
                                <div>
                                    <strong>Ocorrência submetida</strong>
                                    <p>
                                        Relato recebido em {formatDate(accident.created_at)}.
                                        Aguardando análise da equipe de moderação.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                <aside className="detail-aside">
                    <section className="content-card submitter-card">
                        <div className="eyebrow detail-eyebrow">
                            <Icon name="users" /> AUTOR DO RELATO
                        </div>
                        <div className="submitter-avatar">
                            {accident.created_by?.name?.slice(0, 1).toUpperCase() ?? "?"}
                        </div>
                        <strong>
                            {accident.created_by?.name ?? "Usuário indisponível"}
                            <span className="verified-mark">✓</span>
                        </strong>
                        <span>{accident.created_by?.email ?? "Sem e-mail cadastrado"}</span>
                        <small className="submitter-history">Relato enviado pela comunidade</small>
                    </section>

                    <section className="content-card decision-card">
                        <div className="decision-heading">
                            <div className="eyebrow detail-eyebrow">
                                <Icon name="alert" /> DECISÃO DE MODERAÇÃO
                            </div>
                            <span className="official-pill">OFICIAL</span>
                        </div>
                        <h2>Registrar análise</h2>
                        <label className="form-label" htmlFor="public-message">
                            Justificativa ou mensagem ao usuário
                            {editable && " *"}
                        </label>
                        <textarea
                            className="text-area"
                            disabled={!editable || saving}
                            id="public-message"
                            maxLength={2000}
                            onChange={(event) => setPublicMessage(event.target.value)}
                            placeholder="Esta mensagem poderá ser apresentada ao usuário."
                            value={publicMessage}
                        />
                        <label className="form-label" htmlFor="internal-note">
                            Observação interna
                        </label>
                        <textarea
                            className="text-area text-area-short"
                            disabled={!editable || saving}
                            id="internal-note"
                            maxLength={4000}
                            onChange={(event) => setInternalNote(event.target.value)}
                            placeholder="Visível somente para administradores."
                            value={internalNote}
                        />
                        {isPending && !canModerate ? (
                            <p className="decision-locked">
                                Sua conta pode consultar este relato, mas não tem
                                permissão para aprová-lo ou rejeitá-lo.
                            </p>
                        ) : editable ? (
                            <div className="decision-actions">
                                <button
                                    className="button button-primary"
                                    disabled={saving || hasUnsavedChanges}
                                    onClick={() => void decide("APPROVED")}
                                    type="button"
                                >
                                    <Icon name="check" /> {saving ? "Salvando..." : "Aprovar relato"}
                                </button>
                                <button
                                    className="button button-danger"
                                    disabled={saving || hasUnsavedChanges}
                                    onClick={() => void decide("REJECTED")}
                                    type="button"
                                >
                                    <Icon name="close" /> Rejeitar relato
                                </button>
                            </div>
                        ) : (
                            <p className="decision-locked">
                                Este relato já foi {formatStatus(accident.moderation_status).toLowerCase()}.
                                A decisão é permanente.
                            </p>
                        )}
                    </section>
                </aside>
            </div>
        </AdminShell>
    );
}
