/** Resultado de uma ação, exibido no topo da página. */
export interface FlashNotice {
    tone: "success" | "error";
    text: string;
}

export function NoticeAlert({ notice }: Readonly<{ notice: FlashNotice }>) {
    return (
        <div className={`alert ${notice.tone === "success" ? "alert-success" : "alert-error"}`} role="status">
            {notice.text}
        </div>
    );
}
