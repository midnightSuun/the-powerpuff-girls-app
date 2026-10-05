import { useTranslations } from "next-intl"
import { useState } from "react"

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

    const isDuplicate = existingSkillNames.some(
        (s) => s.toLowerCase() === name.trim().toLowerCase(),
    )

    const inlineError = isDuplicate && name.trim() ? t("duplicate") : null
    const isValid = Boolean(name.trim() && categoryId && !isDuplicate)

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!isValid || isSubmitting) return

        setIsSubmitting(true)
        setError(null)

        try {
            await onCreate({ name: name.trim(), categoryId })
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
