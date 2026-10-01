"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

interface UseDeleteLanguagesProps {
    onConfirm: () => Promise<void>
    onClose: () => void
}

export function useDeleteLanguages({
    onConfirm,
    onClose,
}: UseDeleteLanguagesProps) {
    const t = useTranslations("Languages.delete")
    const [error, setError] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)

    const handleConfirm = async () => {
        try {
            setIsPending(true)
            setError(null)
            await onConfirm()
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : t("errors.failed"))
        } finally {
            setIsPending(false)
        }
    }

    return {
        error,
        isPending,
        handleConfirm,
    }
}
