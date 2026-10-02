"use client"

import { Button } from "@/components/ui/button"
import { RemoveItemsButton } from "@/components/ui/list-management-buttons"

import { useDeleteSkillsButton } from "../../../hooks/use-delete-skills-button"
import { DeleteSkillsModal } from "./delete-skill-modal"

interface DeleteSkillsButtonProps {
    cvId: string
    selectedSkills: string[]
    isSelectionMode: boolean
    onToggleSelectionMode: (active: boolean) => void
    onClearSelection: () => void
    disabled: boolean
}

export function DeleteSkillsButton({
    cvId,
    selectedSkills,
    isSelectionMode,
    onToggleSelectionMode,
    onClearSelection,
    disabled,
}: DeleteSkillsButtonProps) {
    const {
        t,
        isModalOpen,
        setIsModalOpen,
        isSubmitting,
        hasSelected,
        handleDeleteConfirm,
        handleCancel,
    } = useDeleteSkillsButton({
        cvId,
        selectedSkills,
        onToggleSelectionMode,
        onClearSelection,
    })

    if (isSelectionMode) {
        return (
            <>
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="rounded-none"
                    >
                        {t("cancel")}
                    </Button>

                    <Button
                        type="button"
                        variant="primary"
                        disabled={!hasSelected || isSubmitting}
                        onClick={() => setIsModalOpen(true)}
                    >
                        {t("deleteSelected", { count: selectedSkills.length })}
                    </Button>
                </div>

                <DeleteSkillsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    count={selectedSkills.length}
                />
            </>
        )
    }

    return (
        <RemoveItemsButton
            label={t("remove")}
            onClick={() => onToggleSelectionMode(true)}
            disabled={disabled}
        />
    )
}
