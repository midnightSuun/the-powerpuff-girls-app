import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useAdminCrudState } from "@/hooks/use-admin-crud-state"
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
    const crud = useAdminCrudState(initialLanguages)

    const handleCreate = async (data: { name: string; iso2: string }) => {
        const created = await createAdminLanguage(data)

        notifications.success("created")
        if (created) {
            crud.addItem({
                id: created.id,
                name: created.name,
                iso2: created.iso2,
            })
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
            crud.updateItem(id, {
                name: updated.name,
                iso2: updated.iso2,
            })
        }
    }

    const handleDeleteConfirm = async () => {
        if (!crud.deletingItem) return
        await deleteAdminLanguage({
            languageId: crud.deletingItem.id,
        } as unknown as Parameters<typeof deleteAdminLanguage>[0])

        notifications.success("deleted")
        crud.removeItem(crud.deletingItem.id)
    }

    return {
        languages: crud.items,
        isCreateOpen: crud.isCreateOpen,
        setIsCreateOpen: crud.setIsCreateOpen,
        editingLanguage: crud.editingItem,
        setEditingLanguage: crud.setEditingItem,
        deletingLanguage: crud.deletingItem,
        setDeletingLanguage: crud.setDeletingItem,
        handleCreate,
        handleUpdate,
        handleDeleteConfirm,
    }
}
