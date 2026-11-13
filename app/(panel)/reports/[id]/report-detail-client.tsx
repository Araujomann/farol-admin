"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminShell } from "@/app/components/admin-shell";
import { useCan } from "@/app/components/permissions-provider";
import { Icon } from "@/app/components/ui-icon";
import { StatusBadge } from "@/app/components/status-badge";
import { DecisionCard } from "@/app/(panel)/reports/[id]/_components/decision-card";
import { ReportEditForm } from "@/app/(panel)/reports/[id]/_components/report-edit-form";
import { ReportHistoryCard } from "@/app/(panel)/reports/[id]/_components/report-history-card";
import { ReportImagesCard } from "@/app/(panel)/reports/[id]/_components/report-images-card";
import { ReportInfoCard } from "@/app/(panel)/reports/[id]/_components/report-info-card";
import { SubmitterCard } from "@/app/(panel)/reports/[id]/_components/submitter-card";
import { useReportModeration } from "@/app/(panel)/reports/[id]/use-report-moderation";

export function ReportDetailClient() {
    const { id } = useParams<{ id: string }>();
    const {
        accident,
        loading,
        saving,
        error,
        notice,
        publicMessage,
        setPublicMessage,
        internalNote,
        setInternalNote,
        editTitle,
        setEditTitle,
        editDescription,
        setEditDescription,
        hasUnsavedChanges,
        saveEdits,
        decide,
    } = useReportModeration(id);
    const canModerate = useCan("reports:moderate");

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
                    <ReportInfoCard
                        accident={accident}
                        editForm={
                            editable ? (
                                <ReportEditForm
                                    description={editDescription}
                                    hasUnsavedChanges={hasUnsavedChanges}
                                    onDescriptionChange={setEditDescription}
                                    onSave={() => void saveEdits()}
                                    onTitleChange={setEditTitle}
                                    saving={saving}
                                    title={editTitle}
                                />
                            ) : null
                        }
                    />
                    <ReportImagesCard images={accident.images} />
                    <ReportHistoryCard accident={accident} />
                </div>

                <aside className="detail-aside">
                    <SubmitterCard author={accident.created_by} />
                    <DecisionCard
                        canModerate={canModerate}
                        editable={editable}
                        hasUnsavedChanges={hasUnsavedChanges}
                        internalNote={internalNote}
                        onDecide={(status) => void decide(status)}
                        onInternalNoteChange={setInternalNote}
                        onPublicMessageChange={setPublicMessage}
                        publicMessage={publicMessage}
                        saving={saving}
                        status={accident.moderation_status}
                    />
                </aside>
            </div>
        </AdminShell>
    );
}
