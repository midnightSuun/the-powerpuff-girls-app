"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { AddItemButton } from "@/components/ui/list-management-buttons"
import type { Proficiency } from "@/gql/generated/graphql"

import { AddLanguageModal } from "./add-language-modal"

interface AddLanguageButtonProps {
    availableLanguages: Array<{ id: string; name: string }>
    existingLanguages: Array<{ name: string }>
    onAdd: (name: string, proficiency: Proficiency) => Promise<void>
}

export function AddLanguageButton({
    availableLanguages,
    existingLanguages,
    onAdd,
}: AddLanguageButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const t = useTranslations("Languages.actions")

    return (
        <>
            <AddItemButton label={t("add")} onClick={() => setIsOpen(true)} />

            <AddLanguageModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                availableLanguages={availableLanguages}
                existingLanguages={existingLanguages}
                onAdd={onAdd}
            />
        </>
    )
}
