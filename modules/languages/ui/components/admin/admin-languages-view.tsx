"use client"

import { useTranslations } from "next-intl"

import { AdminDataTable, type Column } from "@/components/ui/admin-data-table"
import { useAdminLanguagesView } from "@/modules/languages/hooks/use-admin-languages-view"
import type { AdminLanguageItem } from "@/modules/languages/hooks/use-edit-language-admin-modal"

import { CreateLanguageModal } from "./create-language-admin-modal"
import { DeleteLanguageModal } from "./delete-language-admin-modal"
import { EditLanguageModal } from "./edit-language-admin-modal"

interface AdminLanguagesViewProps {
    initialLanguages: AdminLanguageItem[]
}

const NATIVE_LANGUAGE_NAMES: Record<string, string> = {
    en: "English",
    ru: "Русский",
    de: "Deutsch",
    pl: "Język polski",
    pt: "Português",
    it: "Lingua italiana",
    be: "Беларуская мова",
    es: "Español",
    fr: "Français",
    uk: "Українська",
}

function getNativeLanguageName(iso2: string, fallbackName: string): string {
    const code = iso2?.toLowerCase()
    if (code && NATIVE_LANGUAGE_NAMES[code]) {
        return NATIVE_LANGUAGE_NAMES[code]
    }
    if (code) {
        try {
            const displayNames = new Intl.DisplayNames([code], {
                type: "language",
            })
            const native = displayNames.of(code)
            if (native) {
                return native.charAt(0).toUpperCase() + native.slice(1)
            }
        } catch {}
    }
    return fallbackName
}

export function AdminLanguagesView({
    initialLanguages,
}: AdminLanguagesViewProps) {
    const t = useTranslations("Languages.admin")

    const {
        languages,
        isCreateOpen,
        setIsCreateOpen,
        editingLanguage,
        setEditingLanguage,
        deletingLanguage,
        setDeletingLanguage,
        handleCreate,
        handleUpdate,
        handleDeleteConfirm,
    } = useAdminLanguagesView({ initialLanguages })

    const formattedLanguages = languages.map((lang) => {
        const isoUpper = lang.iso2?.toUpperCase() ?? ""
        return {
            ...lang,
            iso2: isoUpper,
            nativeName:
                lang.nativeName || getNativeLanguageName(lang.iso2, lang.name),
        }
    })

    const columns: Column<AdminLanguageItem>[] = [
        { key: "name", label: t("columns.name"), sortable: true },
        {
            key: "iso2",
            label: t("columns.isoCode", { defaultValue: "ISO" }),
            sortable: true,
        },
        {
            key: "nativeName",
            label: t("columns.nativeName", { defaultValue: "Native name" }),
            sortable: true,
        },
    ]

    return (
        <div className="w-full">
            <AdminDataTable
                data={formattedLanguages}
                columns={columns}
                defaultSortKey="name"
                searchPlaceholder={t("search")}
                createButtonLabel={t("createButton")}
                onCreateClick={() => setIsCreateOpen(true)}
                onEditClick={(lang) => setEditingLanguage(lang)}
                onDeleteClick={(lang) => setDeletingLanguage(lang)}
                getSearchableString={(lang) =>
                    `${lang.name} ${lang.iso2} ${lang.nativeName ?? ""}`
                }
                getSortValue={(lang, key) => {
                    if (key === "iso2") return lang.iso2 ?? ""
                    if (key === "nativeName")
                        return lang.nativeName ?? lang.name
                    return lang.name
                }}
                emptyMessage={t("empty")}
            />

            <CreateLanguageModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                existingLanguageNames={languages.map((l) => l.name)}
                onCreate={handleCreate}
            />

            <EditLanguageModal
                isOpen={Boolean(editingLanguage)}
                onClose={() => setEditingLanguage(null)}
                language={editingLanguage}
                onUpdate={handleUpdate}
            />

            <DeleteLanguageModal
                isOpen={Boolean(deletingLanguage)}
                onClose={() => setDeletingLanguage(null)}
                languageName={deletingLanguage?.name ?? ""}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    )
}
