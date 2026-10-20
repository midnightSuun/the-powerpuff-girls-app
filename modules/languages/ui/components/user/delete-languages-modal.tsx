"use client"

import { useTranslations } from "next-intl"

import { DeleteModal } from "@/components/ui/delete-item-modal"

import { useDeleteLanguageModal } from "../../../hooks/use-delete-language-modal"

interface DeleteLanguagesModalProps {
    isOpen: boolean
    onClose: () => void
    count: number
    selectedLanguages?: string[]
    onConfirm: () => Promise<void>
}

export function DeleteLanguagesModal({
    isOpen,
    onClose,
    count,
    onConfirm,
}: DeleteLanguagesModalProps) {
    const t = useTranslations("Languages.delete")

    const { error, isDeleting, handleConfirm } = useDeleteLanguageModal({
        onConfirm,
        onClose,
    })

    const description = (
        <span className="font-normal text-foreground">
            {t("confirmationText")}
            <strong className="font-bold">
                {" "}
                {t("countLanguages", { count })}{" "}
            </strong>
            {t("questionMark")}
        </span>
    )

    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            title={count === 1 ? t("titleSingular") : t("titlePlural")}
            description={description}
            cancelText={t("cancel")}
            confirmText={t("confirm")}
            deletingText={t("removing")}
            isDeleting={isDeleting}
            error={error}
            onConfirm={handleConfirm}
        />
    )
}
