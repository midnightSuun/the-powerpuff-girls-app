"use client"

import { useTranslations } from "next-intl"

import { AddItemModal } from "@/components/ui/add-item-modal"
import type { Proficiency } from "@/gql/generated/graphql"

import { useAddLanguage } from "../../hooks/use-add-language"
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

    const {
        selectedLanguageId,
        setSelectedLanguageId,
        proficiency,
        setProficiency,
        error,
        isSubmitting,
        availableOptions,
        handleClose,
        handleSubmit,
        isValid,
    } = useAddLanguage({
        onAdd,
        availableLanguages,
        existingLanguages,
        onClose,
    })

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
            isValid={isValid}
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
