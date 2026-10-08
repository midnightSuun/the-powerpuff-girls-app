import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useAdminCrudState } from "@/hooks/use-admin-crud-state"
import {
    createAdminSkill,
    deleteAdminSkill,
    updateAdminSkill,
} from "@/modules/skills/api/admin-skills"
import type { AdminSkillItem } from "@/modules/skills/hooks/use-edit-skill-admin-modal"

interface UseAdminSkillsViewProps {
    initialSkills: AdminSkillItem[]
}

export function useAdminSkillsView({ initialSkills }: UseAdminSkillsViewProps) {
    const notifications = useActionNotifications()
    const crud = useAdminCrudState(initialSkills)

    const handleCreate = async (data: { name: string; categoryId: string }) => {
        const created = await createAdminSkill(data)

        notifications.success("created")
        if (created) {
            crud.addItem({
                id: created.id,
                name: created.name,
                category: created.category?.name ?? "",
                categoryId: created.category?.id ?? "",
            })
        }
    }

    const handleUpdate = async (
        id: string,
        data: { name: string; categoryId: string },
    ) => {
        const updated = await updateAdminSkill({
            skillId: id,
            name: data.name,
            categoryId: data.categoryId,
        })

        notifications.success("updated")
        if (updated) {
            crud.updateItem(id, {
                name: updated.name,
                category: updated.category?.name ?? "",
                categoryId: updated.category?.id ?? "",
            })
        }
    }

    const handleDeleteConfirm = async () => {
        if (!crud.deletingItem) return
        await deleteAdminSkill({
            skillId: crud.deletingItem.id,
        })

        notifications.success("deleted")
        crud.removeItem(crud.deletingItem.id)
    }

    return {
        skills: crud.items,
        isCreateOpen: crud.isCreateOpen,
        setIsCreateOpen: crud.setIsCreateOpen,
        editingSkill: crud.editingItem,
        setEditingSkill: crud.setEditingItem,
        deletingSkill: crud.deletingItem,
        setDeletingSkill: crud.setDeletingItem,
        handleCreate,
        handleUpdate,
        handleDeleteConfirm,
    }
}
