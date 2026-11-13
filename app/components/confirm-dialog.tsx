"use client";

import { useEffect } from "react";
import { Icon, type IconName } from "@/app/components/ui-icon";

/** Diálogo de confirmação no mesmo visual do diálogo de saída da conta. */
export function ConfirmDialog({
    title,
    description,
    icon = "alert",
    confirmLabel,
    pendingLabel,
    pending,
    confirmDisabled = false,
    onConfirm,
    onCancel,
    children,
}: Readonly<{
    title: string;
    description: string;
    icon?: IconName;
    confirmLabel: string;
    pendingLabel: string;
    pending: boolean;
    confirmDisabled?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    children?: React.ReactNode;
}>) {
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !pending) onCancel();
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onCancel, pending]);

    return (
        <div
            className="logout-dialog-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !pending) onCancel();
            }}
        >
            <section
                aria-describedby="confirm-dialog-description"
                aria-labelledby="confirm-dialog-title"
                aria-modal="true"
                className="logout-dialog"
                role="dialog"
            >
                <div className="logout-dialog-icon">
                    <Icon name={icon} />
                </div>
                <h2 id="confirm-dialog-title">{title}</h2>
                <p id="confirm-dialog-description">{description}</p>
                {children}
                <div className="logout-dialog-actions">
                    <button
                        className="button button-outline"
                        disabled={pending}
                        onClick={onCancel}
                        type="button"
                    >
                        Cancelar
                    </button>
                    <button
                        className="button button-danger"
                        disabled={pending || confirmDisabled}
                        onClick={onConfirm}
                        type="button"
                    >
                        {pending ? pendingLabel : confirmLabel}
                    </button>
                </div>
            </section>
        </div>
    );
}
