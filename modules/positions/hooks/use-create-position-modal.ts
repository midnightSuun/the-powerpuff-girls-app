import { useState } from "react"

export interface UseCreatePositionModalProps {
    isOpen: boolean
    existingNames?: string[]
    onClose: () => void
    onSubmit: (data: { name: string }) => Promise<void>
}

export function useCreatePositionModal({
    isOpen,
    existingNames = [],
    onClose,
    onSubmit,
}: UseCreatePositionModalProps) {
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
    const [name, setName] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (prevIsOpen !== isOpen) {
        setPrevIsOpen(isOpen)
        if (!isOpen) {
            setName("")
            setError(null)
        }
    }

    const trimmedName = name.trim()
    const isDuplicate = existingNames.some(
        (n) => n.toLowerCase() === trimmedName.toLowerCase(),
    )

    const inlineError = isDuplicate ? "alreadyExists" : null
    const isValid = trimmedName.length > 0 && !inlineError

    const handleSubmit = async () => {
        if (!isValid) return

        try {
            setIsSubmitting(true)
            setError(null)
            await onSubmit({ name: trimmedName })
            setName("")
            onClose()
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create position",
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
