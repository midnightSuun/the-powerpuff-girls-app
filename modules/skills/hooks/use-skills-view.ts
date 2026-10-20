"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import type { Mastery } from "@/gql/generated/graphql"
import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useUserSelectionState } from "@/hooks/use-user-selection-state"
import { updateCvSkill } from "@/modules/skills/api/skills"

import { Skill } from "../ui/components/user/skill-category"

interface UseSkillsViewProps {
    cvId: string
}

export function useSkillsView({ cvId }: UseSkillsViewProps) {
    const router = useRouter()
    const notifications = useActionNotifications()
    const selection = useUserSelectionState<string>()
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null)

    const handleUpdateSkill = async (newMastery: Mastery) => {
        if (!editingSkill) return

        await updateCvSkill({
            cvId,
            name: editingSkill.name,
            mastery: newMastery,
        })

        notifications.success("updated")
        router.refresh()
        setEditingSkill(null)
    }

    return {
        isSelectionMode: selection.isSelectionMode,
        setIsSelectionMode: selection.setIsSelectionMode,
        selectedSkills: selection.selectedItems,
        clearSelection: selection.clearSelection,
        editingSkill,
        setEditingSkill,
        handleToggleSkill: selection.toggleSelection,
        handleUpdateSkill,
    }
}
