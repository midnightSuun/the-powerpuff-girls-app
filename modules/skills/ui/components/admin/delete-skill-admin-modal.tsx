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
    const t = useTranslations("Admin.skills.delete")
    const tCommon = useTranslations("Admin.common")

    const { isDeleting, error, handleConfirm } = useDeleteSkillsModal(props)

    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            title={t("title")}
            description={t("confirmation", { name: skillName })}
            cancelText={tCommon("cancel")}
            confirmText={tCommon("confirm")}
            deletingText={tCommon("deleting")}
            isDeleting={isDeleting}
            error={error}
        />
    )
}
