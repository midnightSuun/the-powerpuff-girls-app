"use client"

import { AdminDataTable, type Column } from "@/components/ui/admin-data-table"
import { useAdminLanguagesView } from "@/modules/languages/hooks/use-admin-languages-view"
import type { AdminLanguageItem } from "@/modules/languages/hooks/use-edit-language-admin-modal"

import { CreateLanguageModal } from "./create-language-admin-modal"
import { DeleteLanguageModal } from "./delete-language-admin-modal"
import { EditLanguageModal } from "./edit-language-admin-modal"

interface AdminLanguagesViewProps {
    initialLanguages: AdminLanguageItem[]
}

const LANGUAGE_COLUMNS: Column<AdminLanguageItem>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "iso2", label: "ISO Code" },
]

export function AdminLanguagesView({
    initialLanguages,
}: AdminLanguagesViewProps) {
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

    return (
        <div className="w-full">
            <AdminDataTable
                data={languages}
                columns={LANGUAGE_COLUMNS}
                searchPlaceholder="Search"
                createButtonLabel="CREATE LANGUAGE"
                onCreateClick={() => setIsCreateOpen(true)}
                onEditClick={(lang) => setEditingLanguage(lang)}
                onDeleteClick={(lang) => setDeletingLanguage(lang)}
                getSearchableString={(lang) => `${lang.name} ${lang.iso2}`}
                getSortValue={(lang) => lang.name}
                emptyMessage="No languages found"
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
