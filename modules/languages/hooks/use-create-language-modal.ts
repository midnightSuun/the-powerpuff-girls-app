import { useState } from "react"

interface UseCreateLanguageModalProps {
    isOpen: boolean
    onClose: () => void
    existingLanguageNames?: string[]
    onCreate: (data: { name: string; iso2: string }) => Promise<void>
}

export function useCreateLanguageModal({
    isOpen,
    onClose,
    existingLanguageNames = [],
    onCreate,
}: UseCreateLanguageModalProps) {
    const [name, setName] = useState("")
    const [iso2, setIso2] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
    if (prevIsOpen !== isOpen) {
        setPrevIsOpen(isOpen)
        if (!isOpen) {
            setName("")
            setIso2("")
            setError(null)
        }
    }

    const isDuplicate = existingLanguageNames.some(
        (l) => l.toLowerCase() === name.trim().toLowerCase(),
    )

    const inlineError =
        isDuplicate && name.trim() ? "Language already exists" : null
    const isValid = Boolean(name.trim() && iso2.trim() && !isDuplicate)

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!isValid || isSubmitting) return

        setIsSubmitting(true)
        setError(null)

        try {
            await onCreate({ name: name.trim(), iso2: iso2.trim() })
            onClose()
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create language",
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        name,
        setName,
        iso2,
        setIso2,
        inlineError,
        error,
        isSubmitting,
        isValid,
        handleSubmit,
    }
}
