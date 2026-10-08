"use client"

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
    const { isOpen, onClose, count, selectedSkills = [] } = props
    const { t, isDeleting, error, handleConfirm } = useDeleteSkillsModal(props)

    const singleSkillName =
        count === 1 && selectedSkills.length === 1 ? selectedSkills[0] : null

    const description = singleSkillName ? (
        <>
            Are you sure you want to delete skill{" "}
            <strong className="font-bold text-foreground">
                {singleSkillName}
            </strong>
            ?
        </>
    ) : (
        <>
            Are you sure you want to delete{" "}
            <strong className="font-bold text-foreground">
                {count} {count === 1 ? "skill" : "skills"}
            </strong>
            ?
        </>
    )

    return (
        <DeleteModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            title={
                count > 1
                    ? t("titlePlural", { defaultValue: "Delete skills" })
                    : t("titleSingular", { defaultValue: "Delete skill" })
            }
            description={description}
            cancelText={t("cancel", { defaultValue: "CANCEL" })}
            confirmText={t("confirm", { defaultValue: "CONFIRM" })}
            deletingText={t("removing", { defaultValue: "Removing..." })}
            isDeleting={isDeleting}
            error={error}
        />
    )
}
