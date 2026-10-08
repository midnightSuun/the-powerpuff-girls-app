"use client"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { RemoveItemsButton } from "@/components/ui/list-management-buttons"

import { DeleteLanguagesModal } from "./delete-languages-modal"

interface DeleteLanguageButtonProps {
    selectedLanguages: string[]
    isSelectionMode: boolean
    onToggleSelectionMode: (active: boolean) => void
    onConfirmDelete: () => Promise<void>
    isModalOpen: boolean
    setIsModalOpen: (open: boolean) => void
    disabled: boolean
}

export function DeleteLanguageButton({
    selectedLanguages,
    isSelectionMode,
    onToggleSelectionMode,
    onConfirmDelete,
    isModalOpen,
    setIsModalOpen,
    disabled,
}: DeleteLanguageButtonProps) {
    const tActions = useTranslations("Languages.actions")
    const tDelete = useTranslations("Languages.delete")

    const hasSelected = selectedLanguages.length > 0

    if (isSelectionMode) {
        return (
            <>
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onToggleSelectionMode(false)}
                    >
                        {tDelete("cancel")}
                    </Button>

                    <Button
                        type="button"
                        variant="primary"
                        disabled={!hasSelected}
                        onClick={() => setIsModalOpen(true)}
                    >
                        {tDelete("deleteSelected", {
                            count: selectedLanguages.length,
                        })}
                    </Button>
                </div>

                <DeleteLanguagesModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    count={selectedLanguages.length}
                    onConfirm={onConfirmDelete}
                />
            </>
        )
    }

    return (
        <RemoveItemsButton
            label={tActions("remove")}
            onClick={() => onToggleSelectionMode(true)}
            disabled={disabled}
        />
    )
}
