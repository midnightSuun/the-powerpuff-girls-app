"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { EditItemModal } from "@/components/ui/edit-item-modal"
import type { Proficiency } from "@/gql/generated/graphql"

import { LanguageProficiencySelect } from "./language-proficiency-select"

interface EditLanguageModalProps {
    isOpen: boolean
    onClose: () => void
    languageName: string
    currentProficiency: Proficiency
    onSave: (proficiency: Proficiency) => Promise<void>
}

export function EditLanguageModal({
    isOpen,
    onClose,
    languageName,
    currentProficiency,
    onSave,
}: EditLanguageModalProps) {
    const t = useTranslations("Languages.edit")
    const [proficiency, setProficiency] =
        useState<Proficiency>(currentProficiency)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            setIsSubmitting(true)
            setError(null)
            await onSave(proficiency)
            onClose()
        } catch (error) {
            setError(
                error instanceof Error ? error.message : t("errors.failed"),
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <EditItemModal
            isOpen={isOpen}
            onClose={onClose}
            title={t("title")}
            itemNameLabel={t("language")}
            itemNameValue={languageName}
            levelSelectLabel={t("proficiency")}
            cancelText={t("cancel")}
            submitText={t("submit")}
            updatingText={t("updating")}
            error={error}
            isSubmitting={isSubmitting}
            isValid
            levelSelectNode={
                <LanguageProficiencySelect
                    value={proficiency}
                    onValueChange={setProficiency}
                />
            }
            onSubmit={handleSubmit}
        />
    )
}
