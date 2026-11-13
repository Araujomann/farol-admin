import { Icon } from "@/app/components/ui-icon";

/** Edição do título e da descrição de um relato pendente. */
export function ReportEditForm({
    title,
    description,
    saving,
    hasUnsavedChanges,
    onTitleChange,
    onDescriptionChange,
    onSave,
}: Readonly<{
    title: string;
    description: string;
    saving: boolean;
    hasUnsavedChanges: boolean;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onSave: () => void;
}>) {
    return (
        <form
            className="report-edit-form"
            onSubmit={(event) => {
                event.preventDefault();
                onSave();
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
                        onChange={(event) => onTitleChange(event.target.value)}
                        required
                        value={title}
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
                    onChange={(event) => onDescriptionChange(event.target.value)}
                    placeholder="O usuário não adicionou uma descrição."
                    value={description}
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
    );
}
