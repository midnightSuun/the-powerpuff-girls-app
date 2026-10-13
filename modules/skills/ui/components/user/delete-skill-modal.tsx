"use client"

import { useTranslations } from "next-intl"

import { DeleteModal } from "@/components/ui/delete-item-modal"

import { useDeleteSkillsModal } from "../../../hooks/use-delete-skill-modal"

interface DeleteSkillsModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    count: number
    selectedSkills?: string[]
}

export function DeleteSkillsModal(props: DeleteSkillsModalProps) {
    const { isOpen, onClose, count } = props

    const t = useTranslations("Skills.delete")
    const { isDeleting, error, handleConfirm } = useDeleteSkillsModal(props)

    const description = (
        <span className="font-normal text-foreground">
            {t("confirmationText")}
            <strong className="font-bold">
                {" "}
                {t("countSkills", { count })}{" "}
            </strong>
            {t("questionMark")}
        </span>
    )

    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            title={count === 1 ? t("titleSingular") : t("titlePlural")}
            description={description}
            cancelText={t("cancel")}
            confirmText={t("confirm")}
            deletingText={t("removing")}
            isDeleting={isDeleting}
            error={error}
        />
    )
}
