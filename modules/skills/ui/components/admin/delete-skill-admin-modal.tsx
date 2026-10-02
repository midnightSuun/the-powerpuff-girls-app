"use client"

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
    const { isDeleting, error, handleConfirm } = useDeleteSkillsModal(props)

    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            title="Delete skill"
            description={`Are you sure you want to delete skill "${skillName}"?`}
            cancelText="CANCEL"
            confirmText="CONFIRM"
            deletingText="DELETING..."
            isDeleting={isDeleting}
            error={error}
        />
    )
}
