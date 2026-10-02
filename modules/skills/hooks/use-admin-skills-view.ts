import { useState } from "react"

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
    const [skills, setSkills] = useState<AdminSkillItem[]>(initialSkills)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingSkill, setEditingSkill] = useState<AdminSkillItem | null>(
        null,
    )
    const [deletingSkill, setDeletingSkill] = useState<AdminSkillItem | null>(
        null,
    )

    const handleCreate = async (data: { name: string; categoryId: string }) => {
        const created = await createAdminSkill({
            name: data.name,
            categoryId: data.categoryId,
        })

        if (created) {
            setSkills((prev) => [
                ...prev,
                {
                    id: created.id,
                    name: created.name,
                    category: created.category?.name ?? "",
                    categoryId: created.category?.id ?? "",
                },
            ])
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
        } as unknown as Parameters<typeof updateAdminSkill>[0])

        if (updated) {
            setSkills((prev) =>
                prev.map((s) =>
                    s.id === id
                        ? {
                              ...s,
                              name: updated.name,
                              category: updated.category?.name ?? "",
                              categoryId: updated.category?.id ?? "",
                          }
                        : s,
                ),
            )
        }
    }

    const handleDeleteConfirm = async () => {
        if (!deletingSkill) return
        await deleteAdminSkill({
            skillId: deletingSkill.id,
        } as unknown as Parameters<typeof deleteAdminSkill>[0])
        setSkills((prev) => prev.filter((s) => s.id !== deletingSkill.id))
    }

    return {
        skills,
        isCreateOpen,
        setIsCreateOpen,
        editingSkill,
        setEditingSkill,
        deletingSkill,
        setDeletingSkill,
        handleCreate,
        handleUpdate,
        handleDeleteConfirm,
    }
}
