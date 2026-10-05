import { useTranslations } from "next-intl"
import { useState } from "react"

interface UseDeleteLanguageModalProps {
    onClose: () => void
    onConfirm: () => Promise<void>
}

export function useDeleteLanguageModal({
    onClose,
    onConfirm,
}: UseDeleteLanguageModalProps) {
    const t = useTranslations("Languages.delete")
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
                err instanceof Error ? err.message : t("errors.failed")
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
