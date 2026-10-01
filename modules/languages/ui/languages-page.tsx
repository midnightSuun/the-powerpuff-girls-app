"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
    AddItemButton,
    RemoveItemsButton,
} from "@/components/ui/list-management-buttons"
import { ProgressListItem } from "@/components/ui/progress-list-item"
import type { Proficiency } from "@/gql/generated/graphql"

import {
    addProfileLanguage,
    deleteProfileLanguages,
    updateProfileLanguage,
} from "../api/languages"
import { AddLanguageModal } from "./components/add-language-modal"
import { DeleteLanguagesModal } from "./components/delete-languages-modal"
import { EditLanguageModal } from "./components/edit-language-modal"

interface LanguagesPageProps {
    initialUserLanguages: Array<{ name: string; proficiency: Proficiency }>
    allSystemLanguages: Array<{ id: string; name: string; iso2?: string }>
    userId: string
}

export function LanguagesPage({
    initialUserLanguages,
    allSystemLanguages,
    userId,
}: LanguagesPageProps) {
    const t = useTranslations("Languages")
    const router = useRouter()

    const [isRemovalMode, setIsRemovalMode] = useState(false)
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingLang, setEditingLang] = useState<{
        name: string
        proficiency: Proficiency
    } | null>(null)
    const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false)

    const toggleSelectLanguage = (name: string) => {
        if (!isRemovalMode) {
            const lang = initialUserLanguages.find((l) => l.name === name)
            if (lang) setEditingLang(lang)
            return
        }

        setSelectedLanguages((prev) =>
            prev.includes(name)
                ? prev.filter((n) => n !== name)
                : [...prev, name],
        )
    }

    const handleAdd = async (name: string, proficiency: Proficiency) => {
        await addProfileLanguage({
            userId,
            name,
            proficiency,
        })
        router.refresh()
    }

    const handleUpdate = async (proficiency: Proficiency) => {
        if (!editingLang) return
        await updateProfileLanguage({
            userId,
            name: editingLang.name,
            proficiency,
        })
        router.refresh()
    }

    const handleDelete = async () => {
        await deleteProfileLanguages({
            userId,
            name: selectedLanguages,
        })
        setSelectedLanguages([])
        setIsRemovalMode(false)
        router.refresh()
    }

    return (
        <div className="flex items-start gap-16">
            <div className="flex-1 max-w-213 pl-50 pt-6">
                <p className="font-roboto text-[16px] font-normal leading-6 tracking-[0.15px] text-[#2E2E2E] mb-4">
                    {t("currentLanguages")}
                </p>

                <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2 md:grid-cols-3">
                    {initialUserLanguages.map((language) => (
                        <ProgressListItem
                            key={language.name}
                            name={language.name}
                            mastery={language.proficiency}
                            isSelectionMode={isRemovalMode}
                            isSelected={selectedLanguages.includes(
                                language.name,
                            )}
                            onSelect={() => toggleSelectLanguage(language.name)}
                            onEdit={() => toggleSelectLanguage(language.name)}
                        />
                    ))}
                    {initialUserLanguages.length === 0 && (
                        <p className="col-span-full text-sm text-muted-foreground">
                            {t("empty")}
                        </p>
                    )}
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-end gap-6 text-xs font-medium tracking-wider text-muted-foreground">
                    {!isRemovalMode ? (
                        <>
                            <AddItemButton
                                label={t("actions.add")}
                                onClick={() => setIsAddOpen(true)}
                            />
                            <RemoveItemsButton
                                label={t("actions.remove")}
                                onClick={() => setIsRemovalMode(true)}
                                disabled={initialUserLanguages.length === 0}
                            />
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsRemovalMode(false)
                                    setSelectedLanguages([])
                                }}
                            >
                                {t("actions.cancel")}
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                disabled={selectedLanguages.length === 0}
                                onClick={() => setIsRemoveConfirmOpen(true)}
                            >
                                {t("actions.deleteSelected", {
                                    count: selectedLanguages.length,
                                })}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <AddLanguageModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onAdd={handleAdd}
                availableLanguages={allSystemLanguages}
                existingLanguages={initialUserLanguages}
            />

            {editingLang && (
                <EditLanguageModal
                    key={editingLang.name}
                    isOpen={Boolean(editingLang)}
                    onClose={() => setEditingLang(null)}
                    languageName={editingLang.name}
                    currentProficiency={editingLang.proficiency}
                    onSave={handleUpdate}
                />
            )}

            <DeleteLanguagesModal
                isOpen={isRemoveConfirmOpen}
                onClose={() => setIsRemoveConfirmOpen(false)}
                count={selectedLanguages.length}
                onConfirm={handleDelete}
            />
        </div>
    )
}
