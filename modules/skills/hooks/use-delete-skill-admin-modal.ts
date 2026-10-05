import { useTranslations } from "next-intl"
import { useState } from "react"

interface UseDeleteSkillAdminModalProps {
    onClose: () => void
    onConfirm: () => Promise<void>
}

export function useDeleteSkillAdminModal({
    onClose,
    onConfirm,
}: UseDeleteSkillAdminModalProps) {
    const t = useTranslations("Skills.admin")
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleConfirm = async () => {
        setIsDeleting(true)
        setError(null)

        try {
            await onConfirm()
            onClose()
        } catch (err: unknown) {
            console.error("Failed to delete skill:", err)
            setError(t("deleteError"))
        } finally {
            setIsDeleting(false)
        }
    }

    return {
        isDeleting,
        error,
        handleConfirm,
    }
}
