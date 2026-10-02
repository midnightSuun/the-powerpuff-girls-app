"use client"

import { useTranslations } from "next-intl"

import { DeleteModal } from "@/components/ui/delete-item-modal"

interface DeleteCvModalProps {
    isOpen: boolean
    onClose: () => void
    cvName: string
    onConfirm: () => Promise<void> | void
    isDeleting: boolean
    error?: string | null
}

export function DeleteCvModal({
    isOpen,
    onClose,
    cvName,
    onConfirm,
    isDeleting,
    error,
}: DeleteCvModalProps) {
    const t = useTranslations("CV.form")

    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title={t("deleteTitle")}
            description={t("deleteConfirmation", { name: cvName })}
            cancelText={t("cancel")}
            confirmText={t("confirm")}
            deletingText={t("deleting")}
            isDeleting={isDeleting}
            error={error}
        />
    )
}
