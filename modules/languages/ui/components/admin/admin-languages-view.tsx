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

    const columns: Column<AdminLanguageItem>[] = [
        { key: "name", label: t("columns.name"), sortable: true },
        { key: "iso2", label: t("columns.isoCode") },
    ]

    return (
        <div className="w-full">
            <AdminDataTable
                data={languages}
                columns={columns}
                searchPlaceholder={t("search")}
                createButtonLabel={t("createButton")}
                onCreateClick={() => setIsCreateOpen(true)}
                onEditClick={(lang) => setEditingLanguage(lang)}
                onDeleteClick={(lang) => setDeletingLanguage(lang)}
                getSearchableString={(lang) => `${lang.name} ${lang.iso2}`}
                getSortValue={(lang) => lang.name}
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
