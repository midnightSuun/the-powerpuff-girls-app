"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"

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

    useBodyScrollLock(isOpen)

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
