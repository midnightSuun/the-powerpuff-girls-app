"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

export interface AdminSkillItem {
    id: string
    name: string
    type?: string
    category: string
    categoryId: string
}

interface UseEditSkillAdminModalProps {
    skill: AdminSkillItem | null
    onClose: () => void
    onUpdate: (
        id: string,
        data: { name: string; categoryId: string },
    ) => Promise<void>
}

export function useEditSkillAdminModal({
    skill,
    onClose,
    onUpdate,
}: UseEditSkillAdminModalProps) {
    const t = useTranslations("Skills.admin")

    const [name, setName] = useState(skill?.name ?? "")
    const [categoryId, setCategoryId] = useState(skill?.categoryId ?? "")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [prevSkillId, setPrevSkillId] = useState(skill?.id)

    if (skill?.id !== prevSkillId) {
        setPrevSkillId(skill?.id)
        setName(skill?.name ?? "")
        setCategoryId(skill?.categoryId ?? "")
        setError(null)
    }

    const isValid = Boolean(name.trim() && categoryId)

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!skill || !isValid || isSubmitting) return

        setIsSubmitting(true)
        setError(null)

        try {
            await onUpdate(skill.id, { name: name.trim(), categoryId })
            onClose()
        } catch (err: unknown) {
            console.error("Failed to update skill:", err)
            setError(t("updateError"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        name,
        setName,
        categoryId,
        setCategoryId,
        error,
        isSubmitting,
        isValid,
        handleSubmit,
    }
}
