import { useTranslations } from "next-intl"
import { useState } from "react"

export interface AdminLanguageItem {
    id: string
    name: string
    iso2: string
    nativeName?: string
}

interface UseEditLanguageAdminModalProps {
    language: AdminLanguageItem | null
    onClose: () => void
    onUpdate: (
        id: string,
        data: { name: string; iso2: string; nativeName: string },
    ) => Promise<void>
}

export function useEditLanguageAdminModal({
    language,
    onClose,
    onUpdate,
}: UseEditLanguageAdminModalProps) {
    const t = useTranslations("Languages.admin")
    const [name, setName] = useState(language?.name ?? "")
    const [iso2, setIso2] = useState(language?.iso2 ?? "")
    const [nativeName, setNativeName] = useState(language?.nativeName ?? "")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [prevLanguage, setPrevLanguage] = useState(language)
    if (prevLanguage !== language) {
        setPrevLanguage(language)
        setName(language?.name ?? "")
        setIso2(language?.iso2 ?? "")
        setNativeName(language?.nativeName ?? "")
        setError(null)
    }

    const trimmedIso2 = iso2.trim().toUpperCase()
    const isValid = Boolean(
        name.trim() && trimmedIso2.length >= 2 && trimmedIso2.length <= 5,
    )

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        if (!language || !isValid || isSubmitting) return

        setIsSubmitting(true)
        setError(null)

        try {
            await onUpdate(language.id, {
                name: name.trim(),
                iso2: trimmedIso2,
                nativeName: nativeName.trim(),
            })
            onClose()
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : t("errors.updateFailed")
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
        nativeName,
        setNativeName,
        error,
        isSubmitting,
        isValid,
        handleSubmit,
    }
}
