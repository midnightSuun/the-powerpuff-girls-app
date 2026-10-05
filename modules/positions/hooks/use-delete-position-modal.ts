import { useTranslations } from "next-intl"
import { useState } from "react"

interface UseDeletePositionModalProps {
    onConfirm: () => Promise<void>
    onClose: () => void
}

export function useDeletePositionModal({
    onConfirm,
    onClose,
}: UseDeletePositionModalProps) {
    const t = useTranslations("Admin.positions.delete")
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleConfirm = async () => {
        try {
            setIsDeleting(true)
            setError(null)
            await onConfirm()
            onClose()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t("inUseError"))
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
