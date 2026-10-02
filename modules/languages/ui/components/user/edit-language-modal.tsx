"use client"

import { useTranslations } from "next-intl"

import { EditItemModal } from "@/components/ui/edit-item-modal"
import type { Proficiency } from "@/gql/generated/graphql"

import { useEditLanguage } from "../../../hooks/use-edit-language"
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

    const { proficiency, setProficiency, error, isSubmitting, handleSubmit } =
        useEditLanguage({
            currentProficiency,
            onSave,
            onClose,
        })

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
