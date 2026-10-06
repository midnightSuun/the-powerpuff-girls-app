import { useTranslations } from "next-intl"
import { useState } from "react"

interface UseDeleteDepartmentModalProps {
    onConfirm: () => Promise<void>
    onClose: () => void
}

export function useDeleteDepartmentModal({
    onConfirm,
    onClose,
}: UseDeleteDepartmentModalProps) {
    const t = useTranslations("Admin.departments.delete")
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
