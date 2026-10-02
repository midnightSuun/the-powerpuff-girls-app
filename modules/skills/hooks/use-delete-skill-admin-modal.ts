import { useState } from "react"

interface UseDeleteSkillAdminModalProps {
    onClose: () => void
    onConfirm: () => Promise<void>
}

export function useDeleteSkillAdminModal({
    onClose,
    onConfirm,
}: UseDeleteSkillAdminModalProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleConfirm = async () => {
        setIsDeleting(true)
        setError(null)

        try {
            await onConfirm()
            onClose()
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to delete skill"
            setError(message)
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
