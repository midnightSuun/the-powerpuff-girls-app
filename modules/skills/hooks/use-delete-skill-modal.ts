"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

interface UseDeleteSkillsModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
}

export function useDeleteSkillsModal({
    isOpen,
    onClose,
    onConfirm,
}: UseDeleteSkillsModalProps) {
    const t = useTranslations("Skills.delete")
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        }
        return () => {
            document.body.style.overflow = "unset"
        }
    }, [isOpen])

    const handleConfirm = async () => {
        setIsDeleting(true)
        setError(null)
        try {
            await onConfirm()
            onClose()
        } catch (err: unknown) {
            const errorObj = err as Error
            setError(errorObj.message || t("errors.failed"))
        } finally {
            setIsDeleting(false)
        }
    }

    return {
        isOpen,
        t,
        isDeleting,
        error,
        handleConfirm,
    }
}
