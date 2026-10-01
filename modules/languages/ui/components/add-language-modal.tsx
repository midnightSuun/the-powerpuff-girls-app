"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { AddItemModal } from "@/components/ui/add-item-modal"
import type { Proficiency } from "@/gql/generated/graphql"

import { LanguageProficiencySelect } from "./language-proficiency-select"

interface AddLanguageModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (name: string, proficiency: Proficiency) => Promise<void>
    availableLanguages: Array<{ id: string; name: string }>
    existingLanguages: Array<{ name: string }>
}

export function AddLanguageModal({
    isOpen,
    onClose,
    onAdd,
    availableLanguages,
    existingLanguages,
}: AddLanguageModalProps) {
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        } catch (error) {
            setError(
                error instanceof Error ? error.message : t("errors.failed"),
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AddItemModal
            isOpen={isOpen}
            onClose={handleClose}
            title={t("title")}
            itemPlaceholder={t("languagePlaceholder")}
            allItemsAddedText={t("allLanguagesAdded")}
            addingText={t("adding")}
            submitText={t("submit")}
            cancelText={t("cancel")}
            error={error}
            isSubmitting={isSubmitting}
            isValid={Boolean(selectedLanguageId && proficiency)}
            selectedId={selectedLanguageId}
            onSelectChange={(value) => setSelectedLanguageId(value ?? "")}
            availableOptions={availableOptions}
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
