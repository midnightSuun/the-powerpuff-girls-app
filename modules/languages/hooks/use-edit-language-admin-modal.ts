import { useState } from "react"

export interface AdminLanguageItem {
    id: string
    name: string
    iso2: string
}

interface UseEditLanguageAdminModalProps {
    language: AdminLanguageItem | null
    onClose: () => void
    onUpdate: (
        id: string,
        data: { name: string; iso2: string },
    ) => Promise<void>
}

export function useEditLanguageAdminModal({
    language,
    onClose,
    onUpdate,
}: UseEditLanguageAdminModalProps) {
    const [name, setName] = useState("")
    const [iso2, setIso2] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [prevLanguage, setPrevLanguage] = useState(language)
    if (prevLanguage !== language) {
        setPrevLanguage(language)
        if (language) {
            setName(language.name)
            setIso2(language.iso2)
            setError(null)
        }
    }

    const isValid = Boolean(name.trim() && iso2.trim())

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!language || !isValid || isSubmitting) return

        setIsSubmitting(true)
        setError(null)

        try {
            await onUpdate(language.id, {
                name: name.trim(),
                iso2: iso2.trim(),
            })
            onClose()
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to update language"
            setError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        name,
        setName,
        iso2,
        setIso2,
        error,
        isSubmitting,
        isValid,
        handleSubmit,
    }
}
