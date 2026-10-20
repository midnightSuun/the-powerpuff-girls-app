import { useState } from "react"

import { AdminPositionItem } from "./use-admin-positions-view"

export interface UseEditPositionModalProps {
    isOpen: boolean
    position: AdminPositionItem | null
    existingNames?: string[]
    onClose: () => void
    onUpdate: (id: string, data: { name: string }) => Promise<void>
}

export function useEditPositionModal({
    isOpen,
    position,
    existingNames = [],
    onClose,
    onUpdate,
}: UseEditPositionModalProps) {
    const [prevPosition, setPrevPosition] = useState(position)
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
    const [name, setName] = useState(position?.name ?? "")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (prevPosition !== position || prevIsOpen !== isOpen) {
        setPrevPosition(position)
        setPrevIsOpen(isOpen)
        setName(position?.name ?? "")
        setError(null)
    }

    const trimmedName = name.trim()
    const isDuplicate = existingNames.some(
        (n) =>
            position &&
            n.toLowerCase() === trimmedName.toLowerCase() &&
            n.toLowerCase() !== position.name.toLowerCase(),
    )

    const inlineError = isDuplicate ? "alreadyExists" : null
    const isValid = trimmedName.length > 0 && !inlineError

    const handleSubmit = async () => {
        if (!position || !isValid) return

        try {
            setIsSubmitting(true)
            setError(null)
            await onUpdate(position.id, { name: trimmedName })
            onClose()
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update position",
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        name,
        setName,
        inlineError,
        error,
        isSubmitting,
        isValid,
        handleSubmit,
    }
}
