"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { DeleteModal } from "@/components/ui/delete-item-modal"

interface DeleteLanguagesModalProps {
    isOpen: boolean
    onClose: () => void
    count: number
    onConfirm: () => Promise<void>
}

export function DeleteLanguagesModal({
    isOpen,
    onClose,
    count,
    onConfirm,
}: DeleteLanguagesModalProps) {
    const t = useTranslations("Languages.delete")
    const [error, setError] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)

    const handleConfirm = async () => {
        try {
            setIsPending(true)
            setError(null)
            await onConfirm()
            onClose()
        } catch (error) {
            setError(
                error instanceof Error ? error.message : t("errors.failed"),
            )
        } finally {
            setIsPending(false)
        }
    }

    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            title={count === 1 ? t("titleSingular") : t("titlePlural")}
            description={t("confirmation", { count })}
            cancelText={t("cancel")}
            confirmText={t("confirm")}
            deletingText={t("removing")}
            isDeleting={isPending}
            error={error}
            onConfirm={handleConfirm}
        />
    )
}
