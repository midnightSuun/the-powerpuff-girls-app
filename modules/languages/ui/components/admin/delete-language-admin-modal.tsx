"use client"

import { useTranslations } from "next-intl"

import { DeleteModal } from "@/components/ui/delete-item-modal"
import { useDeleteLanguageModal } from "@/modules/languages/hooks/use-delete-languages"

interface DeleteLanguageModalProps {
    isOpen: boolean
    onClose: () => void
    languageName: string
    onConfirm: () => Promise<void>
}

export function DeleteLanguageModal(props: DeleteLanguageModalProps) {
    const t = useTranslations("Languages.admin.delete")
    const { isOpen, onClose, languageName } = props
    const { isDeleting, error, handleConfirm } = useDeleteLanguageModal(props)

    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            title={t("title")}
            description={t("confirmation", { name: languageName })}
            cancelText={t("cancel")}
            confirmText={t("confirm")}
            deletingText={t("deleting")}
            isDeleting={isDeleting}
            error={error}
        />
    )
}
