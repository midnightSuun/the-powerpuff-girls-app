"use client"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
    AddItemButton,
    RemoveItemsButton,
} from "@/components/ui/list-management-buttons"
import { ProgressListItem } from "@/components/ui/progress-list-item"
import type { Proficiency } from "@/gql/generated/graphql"

import { useLanguagesPage } from "../hooks/use-languages-page"
import { AddLanguageModal } from "./components/user/add-language-modal"
import { DeleteLanguagesModal } from "./components/user/delete-languages-modal"
import { EditLanguageModal } from "./components/user/edit-language-modal"

interface LanguagesPageProps {
    initialUserLanguages: Array<{ name: string; proficiency: Proficiency }>
    allSystemLanguages: Array<{ id: string; name: string; iso2?: string }>
    userId: string
    canManageLanguages: boolean
}

export function LanguagesPage({
    initialUserLanguages,
    allSystemLanguages,
    userId,
    canManageLanguages,
}: LanguagesPageProps) {
    const t = useTranslations("Languages")

    const {
        isRemovalMode,
        setIsRemovalMode,
        selectedLanguages,
        setSelectedLanguages,
        isAddOpen,
        setIsAddOpen,
        editingLang,
        setEditingLang,
        isRemoveConfirmOpen,
        setIsRemoveConfirmOpen,
        toggleSelectLanguage,
        handleAdd,
        handleUpdate,
        handleDelete,
    } = useLanguagesPage({
        userId,
        initialUserLanguages,
    })

    return (
        <div className="w-full max-w-6xl px-6 py-6 lg:pl-50">
            <div className="w-full">
                <p className="font-roboto text-[16px] font-normal leading-6 tracking-[0.15px] text-foreground mb-4">
                    {t("currentLanguages")}
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-12 lg:gap-x-16 gap-y-3.5">
                    {initialUserLanguages.map((language) => (
                        <ProgressListItem
                            key={language.name}
                            name={language.name}
                            mastery={language.proficiency}
                            isSelectionMode={
                                canManageLanguages && isRemovalMode
                            }
                            isSelected={selectedLanguages.includes(
                                language.name,
                            )}
                            onSelect={() => {
                                if (canManageLanguages) {
                                    toggleSelectLanguage(language.name)
                                }
                            }}
                            onEdit={() => {
                                if (canManageLanguages) {
                                    toggleSelectLanguage(language.name)
                                }
                            }}
                        />
                    ))}
                    {initialUserLanguages.length === 0 && (
                        <p className="col-span-full text-sm text-muted-foreground">
                            {t("empty")}
                        </p>
                    )}
                </div>

                {canManageLanguages && (
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
                )}
            </div>

            {canManageLanguages && (
                <>
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
                        selectedLanguages={selectedLanguages}
                        onConfirm={handleDelete}
                    />
                </>
            )}
        </div>
    )
}
