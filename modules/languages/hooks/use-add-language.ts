"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import type { Proficiency } from "@/gql/generated/graphql"

interface UseAddLanguageProps {
    onAdd: (name: string, proficiency: Proficiency) => Promise<void>
    availableLanguages: Array<{ id: string; name: string }>
    existingLanguages: Array<{ name: string }>
    onClose: () => void
}

export function useAddLanguage({
    onAdd,
    availableLanguages,
    existingLanguages,
    onClose,
}: UseAddLanguageProps) {
    const t = useTranslations("Languages.add")
    const [selectedLanguageId, setSelectedLanguageId] = useState("")
    const [proficiency, setProficiency] = useState<Proficiency | "">("")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const availableOptions = availableLanguages.filter(
        (language) =>
            !existingLanguages.some(
                (existingLanguage) => existingLanguage.name === language.name,
            ),
    )

    const handleClose = () => {
        setSelectedLanguageId("")
        setProficiency("")
        setError(null)
        onClose()
    }

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        const selectedLanguage = availableOptions.find(
            (language) => language.id === selectedLanguageId,
        )
        if (!selectedLanguage || !proficiency) {
            return
        }

        try {
            setIsSubmitting(true)
            setError(null)
            await onAdd(selectedLanguage.name, proficiency)
            handleClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : t("errors.failed"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        selectedLanguageId,
        setSelectedLanguageId,
        proficiency,
        setProficiency,
        error,
        isSubmitting,
        availableOptions,
        handleClose,
        handleSubmit,
        isValid: Boolean(selectedLanguageId && proficiency),
    }
}
