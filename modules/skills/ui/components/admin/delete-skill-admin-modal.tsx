"use client"

import { useTranslations } from "next-intl"

import { DeleteModal } from "@/components/ui/delete-item-modal"
import { useDeleteSkillsModal } from "@/modules/skills/hooks/use-delete-skill-modal"

interface DeleteSkillModalProps {
    isOpen: boolean
    onClose: () => void
    skillName: string
    onConfirm: () => Promise<void>
}

export function DeleteSkillModal(props: DeleteSkillModalProps) {
    const { isOpen, onClose, skillName } = props
    const t = useTranslations("Skills.admin")

    const { isDeleting, error, handleConfirm } = useDeleteSkillsModal(props)

    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            title={t("deleteTitle")}
            description={t("deleteConfirmation", { name: skillName })}
            cancelText={t("cancel")}
            confirmText={t("confirm")}
            deletingText={t("deleting")}
            isDeleting={isDeleting}
            error={error}
        />
    )
}
