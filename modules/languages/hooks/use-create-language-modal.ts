import { useTranslations } from "next-intl"
import { useState } from "react"

import { isNameDuplicate, normalizeName } from "@/lib/validate-unique-name"

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
    const t = useTranslations("Languages.admin")
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

    const trimmedName = normalizeName(name)
    const trimmedIso2 = iso2.trim()
    const isDuplicate = isNameDuplicate(name, existingLanguageNames)

    const inlineError =
        isDuplicate && trimmedName ? t("errors.duplicate") : null
    const isValid = Boolean(trimmedName && trimmedIso2 && !isDuplicate)

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!isValid || isSubmitting) return

        setIsSubmitting(true)
        setError(null)

        try {
            await onCreate({ name: trimmedName, iso2: trimmedIso2 })
            onClose()
        } catch (err: unknown) {
            setError(
                err instanceof Error ? err.message : t("errors.createFailed"),
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
