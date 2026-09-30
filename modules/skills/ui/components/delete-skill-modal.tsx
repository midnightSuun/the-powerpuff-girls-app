"use client"

import { X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

interface DeleteSkillsModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    count: number
}

export function DeleteSkillsModal({
    isOpen,
    onClose,
    onConfirm,
    count,
}: DeleteSkillsModalProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleConfirm = async () => {
        setIsDeleting(true)
        setError(null)
        try {
            await onConfirm()
            onClose()
        } catch (err: unknown) {
            const errorObj = err as Error
            setError(
                errorObj.message ||
                    "Failed to remove skills. Please try again.",
            )
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="relative w-full max-w-155 rounded-none bg-background p-6 shadow-2xl border border-border">
                {/* Заголовок и крестик */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">
                        {count > 1 ? "Remove skills" : "Remove skill"}
                    </h2>
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
                    Are you sure you want to remove{" "}
                    <span className="font-bold text-foreground">
                        {count} {count === 1 ? "skill" : "skills"}?
                    </span>
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
                        CANCEL
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "REMOVING..." : "CONFIRM"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
