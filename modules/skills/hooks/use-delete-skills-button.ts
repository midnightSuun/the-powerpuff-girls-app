"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { useActionNotifications } from "@/hooks/use-action-notifications"
import { deleteCvSkills } from "@/modules/skills/api/skills"

interface UseDeleteSkillsButtonProps {
    cvId: string
    selectedSkills: string[]
    onToggleSelectionMode: (active: boolean) => void
    onClearSelection: () => void
}

export function useDeleteSkillsButton({
    cvId,
    selectedSkills,
    onToggleSelectionMode,
    onClearSelection,
}: UseDeleteSkillsButtonProps) {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const t = useTranslations("Skills.actions")
    const notifications = useActionNotifications()

    const hasSelected = selectedSkills.length > 0

    const handleDeleteConfirm = async () => {
        setIsSubmitting(true)
        try {
            await deleteCvSkills({ cvId, name: selectedSkills })
            notifications.success("deleted")
            router.refresh()
            onClearSelection()
            onToggleSelectionMode(false)
            setIsModalOpen(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        onClearSelection()
        onToggleSelectionMode(false)
    }

    return {
        t,
        isModalOpen,
        setIsModalOpen,
        isSubmitting,
        hasSelected,
        handleDeleteConfirm,
        handleCancel,
    }
}
