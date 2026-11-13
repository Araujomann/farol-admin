"use client";

import { NoticeComposer } from "@/app/(panel)/notices/_components/notice-composer";
import { NoticeGuidelines } from "@/app/(panel)/notices/_components/notice-guidelines";
import { NoticeHistory } from "@/app/(panel)/notices/_components/notice-history";
import { useNotices } from "@/app/(panel)/notices/use-notices";
import { AdminShell } from "@/app/components/admin-shell";
import { PageHeading } from "@/app/components/page-heading";

export function NoticesClient() {
    const {
        message,
        changeMessage,
        notices,
        isLoading,
        isPublishing,
        loadError,
        error,
        status,
        publishNotice,
        retryLoad,
    } = useNotices();

    return (
        <AdminShell>
            <PageHeading
                description="Compartilhe atualizações importantes com quem usa o Farol."
                eyebrow="CANAL OFICIAL DE TRANSMISSÃO"
                title="Avisos à comunidade"
            >
                <span className="notice-reach">
                    <span className="security-dot" /> Alcance: comunidade Farol
                </span>
            </PageHeading>

            {error && (
                <div className="alert alert-error" role="alert">
                    <div>
                        <strong>Não foi possível concluir a solicitação.</strong>
                        <span>{error}</span>
                    </div>
                    {loadError && (
                        <button
                            className="text-button"
                            onClick={retryLoad}
                            type="button"
                        >
                            Tentar novamente
                        </button>
                    )}
                </div>
            )}

            {status && (
                <div className="alert alert-success" role="status">
                    <div>
                        <strong>Comunicado enviado</strong>
                        <span>{status}</span>
                    </div>
                </div>
            )}

            <div className="notice-page-grid">
                <NoticeComposer
                    isPublishing={isPublishing}
                    message={message}
                    onMessageChange={changeMessage}
                    onSubmit={publishNotice}
                />
                <NoticeGuidelines />
            </div>

            <NoticeHistory hasError={Boolean(error)} isLoading={isLoading} notices={notices} />
        </AdminShell>
    );
}
