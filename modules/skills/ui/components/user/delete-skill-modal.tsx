"use client"

import { DeleteModal } from "@/components/ui/delete-item-modal"

import { useDeleteSkillsModal } from "../../../hooks/use-delete-skill-modal"

interface DeleteSkillsModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    count: number
}

export function DeleteSkillsModal(props: DeleteSkillsModalProps) {
    const { isOpen, onClose, count } = props
    const { t, isDeleting, error, handleConfirm } = useDeleteSkillsModal(props)

    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            title={count > 1 ? t("titlePlural") : t("titleSingular")}
            description={t("confirmation", { count })}
            cancelText={t("cancel")}
            confirmText={t("confirm")}
            deletingText={t("removing")}
            isDeleting={isDeleting}
            error={error}
        />
    )
}
