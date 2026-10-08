import { useState } from "react"

import { isNameDuplicate, normalizeName } from "@/lib/validate-unique-name"

export interface UseCreateDepartmentModalProps {
    isOpen: boolean
    existingNames?: string[]
    onClose: () => void
    onSubmit: (data: { name: string }) => Promise<void>
}

export function useCreateDepartmentModal({
    isOpen,
    existingNames = [],
    onClose,
    onSubmit,
}: UseCreateDepartmentModalProps) {
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

    const trimmedName = normalizeName(name)
    const isDuplicate = isNameDuplicate(name, existingNames)
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
                    : "Failed to create department",
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
