"use client"

import { useTranslations } from "next-intl"

import { DeleteModal } from "@/components/ui/delete-item-modal"
import { useDeletePositionModal } from "@/modules/positions/hooks/use-delete-position-modal"

interface DeletePositionModalProps {
    isOpen: boolean
    onClose: () => void
    positionName: string
    onConfirm: () => Promise<void>
}

export function DeletePositionModal(props: DeletePositionModalProps) {
    const { isOpen, onClose, positionName } = props
    const t = useTranslations("Admin.positions.delete")
    const tCommon = useTranslations("Admin.common")

    const { isDeleting, error, handleConfirm } = useDeletePositionModal(props)

    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            title={t("title")}
            description={t("confirmation", { name: positionName })}
            cancelText={tCommon("cancel")}
            confirmText={tCommon("confirm")}
            deletingText={tCommon("deleting")}
            isDeleting={isDeleting}
            error={error}
        />
    )
}
