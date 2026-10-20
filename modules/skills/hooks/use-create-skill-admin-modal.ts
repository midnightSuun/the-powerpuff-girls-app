import { useTranslations } from "next-intl"
import { useState } from "react"

import { isNameDuplicate, normalizeName } from "@/lib/validate-unique-name"

interface UseCreateSkillAdminModalProps {
    isOpen: boolean
    onClose: () => void
    existingSkillNames?: string[]
    onCreate: (data: { name: string; categoryId: string }) => Promise<void>
}

export function useCreateSkillAdminModal({
    isOpen,
    onClose,
    existingSkillNames = [],
    onCreate,
}: UseCreateSkillAdminModalProps) {
    const t = useTranslations("Skills.admin")
    const [name, setName] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
    if (prevIsOpen !== isOpen) {
        setPrevIsOpen(isOpen)
        if (!isOpen) {
            setName("")
            setCategoryId("")
            setError(null)
        }
    }

    const trimmedName = normalizeName(name)
    const isDuplicate = isNameDuplicate(name, existingSkillNames)

    const inlineError = isDuplicate && trimmedName ? t("duplicate") : null
    const isValid = Boolean(trimmedName && categoryId && !isDuplicate)

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!isValid || isSubmitting) return

        setIsSubmitting(true)
        setError(null)

        try {
            await onCreate({ name: trimmedName, categoryId })
            onClose()
        } catch (err: unknown) {
            console.error("Failed to create skill:", err)
            setError(t("createError"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        name,
        setName,
        categoryId,
        setCategoryId,
        inlineError,
        error,
        isSubmitting,
        isValid,
        handleSubmit,
    }
}
