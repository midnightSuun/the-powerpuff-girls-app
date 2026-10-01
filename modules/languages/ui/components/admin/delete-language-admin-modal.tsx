"use client"

import { DeleteModal } from "@/components/ui/delete-item-modal"
import { useDeleteLanguageModal } from "@/modules/languages/hooks/use-delete-languages"

interface DeleteLanguageModalProps {
    isOpen: boolean
    onClose: () => void
    languageName: string
    onConfirm: () => Promise<void>
}

export function DeleteLanguageModal(props: DeleteLanguageModalProps) {
    const { isOpen, onClose, languageName } = props
    const { isDeleting, error, handleConfirm } = useDeleteLanguageModal(props)

    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            title="Delete language"
            description={`Are you sure you want to delete language "${languageName}"?`}
            cancelText="CANCEL"
            confirmText="CONFIRM"
            deletingText="DELETING..."
            isDeleting={isDeleting}
            error={error}
        />
    )
}
