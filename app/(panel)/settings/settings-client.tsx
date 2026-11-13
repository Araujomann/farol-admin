"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminShell } from "@/app/components/admin-shell";
import { adminFetch } from "@/lib/client-api";
import { formatDate } from "@/lib/format";
import type { PlatformSettingItem } from "@/lib/types";

const settingTitles: Record<string, string> = {
    invite_ttl_hours: "Validade do convite de moderador",
    invite_max_sends_per_day: "Envios de convite por e-mail a cada 24 horas",
};

const settingUnits: Record<string, string> = {
    invite_ttl_hours: "horas",
    invite_max_sends_per_day: "envios",
};

export function SettingsClient() {
    const [settings, setSettings] = useState<PlatformSettingItem[] | null>(null);
    const [draft, setDraft] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

    function load(items: PlatformSettingItem[]) {
        setSettings(items);
        setDraft(Object.fromEntries(items.map((item) => [item.key, String(item.value)])));
    }

    useEffect(() => {
        let active = true;
        adminFetch<{ data: PlatformSettingItem[] }>("/api/admin/settings")
            .then((response) => active && load(response.data))
            .catch((reason) =>
                active &&
                setNotice({ tone: "error", text: reason instanceof Error ? reason.message : "Erro ao carregar configurações." }),
            );
        return () => {
            active = false;
        };
    }, []);

    const changes = Object.fromEntries(
        (settings ?? [])
            .filter((item) => draft[item.key] !== undefined && Number(draft[item.key]) !== item.value)
            .map((item) => [item.key, Number(draft[item.key])]),
    );
    const invalid = (settings ?? []).some((item) => {
        const value = Number(draft[item.key]);
        return !Number.isInteger(value) || value < item.min || value > item.max;
    });

    async function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (invalid || Object.keys(changes).length === 0) return;

        setSaving(true);
        setNotice(null);
        try {
            const response = await adminFetch<{ data: PlatformSettingItem[] }>("/api/admin/settings", {
                method: "PATCH",
                body: JSON.stringify(changes),
            });
            load(response.data);
            setNotice({ tone: "success", text: "Configurações salvas e registradas na auditoria." });
        } catch (reason) {
            setNotice({ tone: "error", text: reason instanceof Error ? reason.message : "Não foi possível salvar." });
        } finally {
            setSaving(false);
        }
    }

    return (
        <AdminShell>
            <div className="page-heading">
                <div>
                    <div className="eyebrow"><span className="eyebrow-dot" /> ADMINISTRAÇÃO</div>
                    <h1>Configurações</h1>
                    <p>
                        Ajustes da plataforma. Cada alteração vale para as próximas ações e
                        fica registrada na auditoria com o valor anterior.
                    </p>
                </div>
            </div>

            {notice && (
                <div className={`alert ${notice.tone === "success" ? "alert-success" : "alert-error"}`} role="status">
                    {notice.text}
                </div>
            )}

            {!settings ? (
                <div className="loading-card">Carregando configurações...</div>
            ) : (
                <form className="content-card settings-form" onSubmit={save}>
                    {settings.map((item) => {
                        const value = Number(draft[item.key]);
                        const outOfRange = !Number.isInteger(value) || value < item.min || value > item.max;
                        return (
                            <div className="settings-field" key={item.key}>
                                <label className="form-label" htmlFor={`setting-${item.key}`}>
                                    {settingTitles[item.key] ?? item.key}
                                </label>
                                <p>{item.description}. Padrão: {item.default}. Permitido: {item.min} a {item.max}.</p>
                                <div className="settings-input">
                                    <input
                                        aria-invalid={outOfRange}
                                        className="text-input"
                                        id={`setting-${item.key}`}
                                        inputMode="numeric"
                                        max={item.max}
                                        min={item.min}
                                        onChange={(event) =>
                                            setDraft((current) => ({ ...current, [item.key]: event.target.value }))
                                        }
                                        step={1}
                                        type="number"
                                        value={draft[item.key] ?? ""}
                                    />
                                    <span>{settingUnits[item.key]}</span>
                                </div>
                                {outOfRange && (
                                    <span className="settings-error">
                                        Use um número inteiro entre {item.min} e {item.max}.
                                    </span>
                                )}
                                <span className="table-secondary">
                                    {item.updated_at
                                        ? `Alterado em ${formatDate(item.updated_at)}${item.updated_by ? ` por ${item.updated_by.name}` : ""}`
                                        : "Usando o valor padrão"}
                                </span>
                            </div>
                        );
                    })}
                    <div className="settings-actions">
                        <button
                            className="button button-primary"
                            disabled={saving || invalid || Object.keys(changes).length === 0}
                            type="submit"
                        >
                            {saving ? "Salvando..." : "Salvar alterações"}
                        </button>
                        <button
                            className="button button-outline"
                            disabled={saving || Object.keys(changes).length === 0}
                            onClick={() => load(settings)}
                            type="button"
                        >
                            Descartar
                        </button>
                    </div>
                </form>
            )}
        </AdminShell>
    );
}
