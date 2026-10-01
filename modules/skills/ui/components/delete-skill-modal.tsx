"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useDeleteSkillsModal } from "../../hooks/use-delete-skill-modal"

interface DeleteSkillsModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    count: number
}

export function DeleteSkillsModal(props: DeleteSkillsModalProps) {
    const { isOpen, onClose, count } = props
    const { t, isDeleting, error, handleConfirm } = useDeleteSkillsModal(props)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="relative w-full max-w-155 rounded-none bg-background p-6 shadow-2xl border border-border">
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-lg font-semibold text-foreground">
                        {count > 1 ? t("titlePlural") : t("titleSingular")}
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <p className="mb-8 text-sm text-muted-foreground">
                    {t("confirmation", { count })}
                </p>

                {error && (
                    <div className="mb-4 rounded-none bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? t("removing") : t("confirm")}
                    </Button>
                </div>
            </div>
        </div>
    )
}
