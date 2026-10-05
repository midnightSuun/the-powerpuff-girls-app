import { useState } from "react"

import { useActionNotifications } from "@/hooks/use-action-notifications"
import {
    createAdminLanguage,
    deleteAdminLanguage,
    updateAdminLanguage,
} from "@/modules/languages/api/admin-languages"
import type { AdminLanguageItem } from "@/modules/languages/hooks/use-edit-language-admin-modal"

interface UseAdminLanguagesViewProps {
    initialLanguages: AdminLanguageItem[]
}

export function useAdminLanguagesView({
    initialLanguages,
}: UseAdminLanguagesViewProps) {
    const notifications = useActionNotifications()
    const [languages, setLanguages] =
        useState<AdminLanguageItem[]>(initialLanguages)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingLanguage, setEditingLanguage] =
        useState<AdminLanguageItem | null>(null)
    const [deletingLanguage, setDeletingLanguage] =
        useState<AdminLanguageItem | null>(null)

    const handleCreate = async (data: { name: string; iso2: string }) => {
        const created = await createAdminLanguage({
            name: data.name,
            iso2: data.iso2,
        })

        notifications.success("created")
        if (created) {
            setLanguages((prev) => [
                ...prev,
                {
                    id: created.id,
                    name: created.name,
                    iso2: created.iso2,
                },
            ])
        }
    }

    const handleUpdate = async (
        id: string,
        data: { name: string; iso2: string },
    ) => {
        const updated = await updateAdminLanguage({
            languageId: id,
            name: data.name,
            iso2: data.iso2,
        } as unknown as Parameters<typeof updateAdminLanguage>[0])

        notifications.success("updated")
        if (updated) {
            setLanguages((prev) =>
                prev.map((l) =>
                    l.id === id
                        ? {
                              ...l,
                              name: updated.name,
                              iso2: updated.iso2,
                          }
                        : l,
                ),
            )
        }
    }

    const handleDeleteConfirm = async () => {
        if (!deletingLanguage) return
        await deleteAdminLanguage({
            languageId: deletingLanguage.id,
        } as unknown as Parameters<typeof deleteAdminLanguage>[0])
        notifications.success("deleted")
        setLanguages((prev) => prev.filter((l) => l.id !== deletingLanguage.id))
    }

    return {
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
    }
}
