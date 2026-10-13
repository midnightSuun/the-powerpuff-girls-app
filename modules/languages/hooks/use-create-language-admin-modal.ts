import { useTranslations } from "next-intl"
import { useState } from "react"

import { isNameDuplicate, normalizeName } from "@/lib/validate-unique-name"

interface UseCreateLanguageAdminModalProps {
    isOpen: boolean
    onClose: () => void
    existingLanguageNames?: string[]
    onCreate: (data: {
        name: string
        iso2: string
        nativeName: string
    }) => Promise<void>
}

export function useCreateLanguageAdminModal({
    isOpen,
    onClose,
    existingLanguageNames = [],
    onCreate,
}: UseCreateLanguageAdminModalProps) {
    const t = useTranslations("Languages.admin")
    const [name, setName] = useState("")
    const [iso2, setIso2] = useState("")
    const [nativeName, setNativeName] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
    if (prevIsOpen !== isOpen) {
        setPrevIsOpen(isOpen)
        if (!isOpen) {
            setName("")
            setIso2("")
            setNativeName("")
            setError(null)
        }
    }

    const trimmedName = normalizeName(name)
    const trimmedIso2 = iso2.trim().toUpperCase()
    const trimmedNativeName = nativeName.trim()
    const isDuplicate = isNameDuplicate(name, existingLanguageNames)

    const inlineError =
        isDuplicate && trimmedName ? t("errors.duplicate") : null

    const isValid = Boolean(
        trimmedName && trimmedIso2.length === 2 && !isDuplicate,
    )

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!isValid || isSubmitting) return

        setIsSubmitting(true)
        setError(null)

        try {
            await onCreate({
                name: trimmedName,
                iso2: trimmedIso2,
                nativeName: trimmedNativeName,
            })
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
        nativeName,
        setNativeName,
        inlineError,
        error,
        isSubmitting,
        isValid,
        handleSubmit,
    }
}
