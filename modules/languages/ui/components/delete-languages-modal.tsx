"use client"

import { useTranslations } from "next-intl"

import { DeleteModal } from "@/components/ui/delete-item-modal"

import { useDeleteLanguages } from "../../hooks/use-delete-languages"

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

    const { error, isPending, handleConfirm } = useDeleteLanguages({
        onConfirm,
        onClose,
    })

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
