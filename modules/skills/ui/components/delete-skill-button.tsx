"use client"

import { Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { deleteCvSkills } from "@/modules/skills/api/skills"

import { DeleteSkillsModal } from "./delete-skill-modal"

interface DeleteSkillsButtonProps {
    cvId: string
    selectedSkills: string[]
    isSelectionMode: boolean
    onToggleSelectionMode: (active: boolean) => void
    onClearSelection: () => void
}

export function DeleteSkillsButton({
    cvId,
    selectedSkills,
    isSelectionMode,
    onToggleSelectionMode,
    onClearSelection,
}: DeleteSkillsButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const hasSelected = selectedSkills.length > 0

    const handleDeleteConfirm = async () => {
        await deleteCvSkills({
            cvId,
            name: selectedSkills,
        })

        onClearSelection()
        onToggleSelectionMode(false)
    }
    const handleCancel = () => {
        onClearSelection()
        onToggleSelectionMode(false)
    }

    if (isSelectionMode) {
        return (
            <>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={handleCancel}
                        className="rounded-none"
                    >
                        CANCEL
                    </Button>

                    <Button
                        variant="primary"
                        disabled={!hasSelected}
                        onClick={() => setIsModalOpen(true)}
                    >
                        DELETE ({selectedSkills.length})
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
        <Button
            variant="primaryV2"
            className="gap-2"
            onClick={() => onToggleSelectionMode(true)}
        >
            <Trash2 className="h-5 w-5" />
            REMOVE SKILLS
        </Button>
    )
}
