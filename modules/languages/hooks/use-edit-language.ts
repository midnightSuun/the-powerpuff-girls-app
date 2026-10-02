"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import type { Proficiency } from "@/gql/generated/graphql"

interface UseEditLanguageProps {
    currentProficiency: Proficiency
    onSave: (proficiency: Proficiency) => Promise<void>
    onClose: () => void
}

export function useEditLanguage({
    currentProficiency,
    onSave,
    onClose,
}: UseEditLanguageProps) {
    const t = useTranslations("Languages.edit")
    const [proficiency, setProficiency] =
        useState<Proficiency>(currentProficiency)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        try {
            setIsSubmitting(true)
            setError(null)
            await onSave(proficiency)
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : t("errors.failed"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        proficiency,
        setProficiency,
        error,
        isSubmitting,
        handleSubmit,
    }
}
