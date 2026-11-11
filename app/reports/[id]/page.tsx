"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/app/components/admin-shell";
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

export default function ReportDetailPage() {
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

    const mapUrl = `https://www.openstreetmap.org/?mlat=${accident.latitude}&mlon=${accident.longitude}#map=16/${accident.latitude}/${accident.longitude}`;

    return (
        <AdminShell>
            <Link className="back-link" href="/reports">← Voltar aos relatos</Link>
            <div className="detail-heading">
                <div>
                    <div className="eyebrow">ANÁLISE DE RELATO</div>
                    <h1>{accident.tipo_acidente}</h1>
                    <span className="detail-id">ID {accident.id}</span>
                </div>
                <StatusBadge status={accident.moderation_status} />
            </div>

            {error && <div className="alert alert-error" role="alert">{error}</div>}
            {notice && <div className="alert alert-success" role="status">{notice}</div>}

            <div className="detail-grid">
                <div className="detail-main">
                    <section className="content-card">
                        <div className="section-heading">
                            <div>
                                <div className="eyebrow">INFORMAÇÕES DO RELATO</div>
                                <h2>Texto e dados da ocorrência</h2>
                            </div>
                            <span className={`severity severity-${accident.severity}`}>
                                <span className="severity-dot" />
                                {formatSeverity(accident.severity)}
                            </span>
                        </div>
                        {accident.moderation_status === "PENDING" ? (
                            <form
                                className="report-edit-form"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void saveEdits();
                                }}
                            >
                                <label className="report-edit-field">
                                    <span className="form-label">Título do relato</span>
                                    <input
                                        className="text-input"
                                        disabled={saving}
                                        maxLength={180}
                                        minLength={3}
                                        onChange={(event) => setEditTitle(event.target.value)}
                                        required
                                        value={editTitle}
                                    />
                                </label>
                                <label className="report-edit-field">
                                    <span className="form-label">Descrição</span>
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
                                {accident.description ||
                                    "O usuário não adicionou uma descrição."}
                            </p>
                        )}
                        <div className="detail-facts">
                            <div className="fact">
                                <span>Data e hora da ocorrência</span>
                                <strong>{formatDate(accident.occurred_at)}</strong>
                            </div>
                            <div className="fact">
                                <span>Data de envio</span>
                                <strong>{formatDate(accident.created_at)}</strong>
                            </div>
                            <div className="fact">
                                <span>Classificação</span>
                                <strong>{formatClassification(accident.classificacao_acidente)}</strong>
                            </div>
                            <div className="fact">
                                <span>Condição climática</span>
                                <strong>{formatWeather(accident.condicao_meteorologica)}</strong>
                            </div>
                            <div className="fact">
                                <span>Coordenadas geográficas</span>
                                <strong>{accident.latitude.toFixed(6)}, {accident.longitude.toFixed(6)}</strong>
                            </div>
                            <a className="fact-map-link" href={mapUrl} rel="noreferrer" target="_blank">
                                <Icon name="pin" /> Ver localização no mapa <Icon name="arrow" />
                            </a>
                        </div>
                    </section>

                    <section className="content-card">
                        <div className="section-heading">
                            <div>
                                <div className="eyebrow">MÍDIA</div>
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
                            <p className="muted-copy">Nenhuma imagem foi anexada a este relato.</p>
                        )}
                    </section>

                    <section className="content-card">
                        <div className="section-heading">
                            <div>
                                <div className="eyebrow">RASTREABILIDADE</div>
                                <h2>Histórico de decisões</h2>
                            </div>
                            <span className="subtle-count">{accident.moderation_history.length}</span>
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
                            <p className="muted-copy">Ainda não há decisões registradas.</p>
                        )}
                    </section>
                </div>

                <aside className="detail-aside">
                    <section className="content-card submitter-card">
                        <div className="eyebrow">AUTOR DO RELATO</div>
                        <div className="submitter-avatar">
                            {accident.created_by?.name?.slice(0, 1).toUpperCase() ?? "?"}
                        </div>
                        <strong>{accident.created_by?.name ?? "Usuário indisponível"}</strong>
                        <span>{accident.created_by?.email ?? "Sem e-mail cadastrado"}</span>
                    </section>

                    <section className="content-card decision-card">
                        <div className="eyebrow">DECISÃO DE MODERAÇÃO</div>
                        <h2>Registrar análise</h2>
                        <label className="form-label" htmlFor="public-message">
                            Justificativa ou mensagem ao usuário
                            {accident.moderation_status === "PENDING" && " *"}
                        </label>
                        <textarea
                            className="text-area"
                            disabled={accident.moderation_status !== "PENDING" || saving}
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
                            disabled={accident.moderation_status !== "PENDING" || saving}
                            id="internal-note"
                            maxLength={4000}
                            onChange={(event) => setInternalNote(event.target.value)}
                            placeholder="Visível somente para administradores."
                            value={internalNote}
                        />
                        {accident.moderation_status === "PENDING" ? (
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
