"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import type { Proficiency } from "@/gql/generated/graphql"
import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useUserSelectionState } from "@/hooks/use-user-selection-state"

import {
    addProfileLanguage,
    deleteProfileLanguages,
    updateProfileLanguage,
} from "../api/languages"

interface UseLanguagesPageProps {
    userId: string
    initialUserLanguages: Array<{ name: string; proficiency: Proficiency }>
}

export function useLanguagesPage({
    userId,
    initialUserLanguages,
}: UseLanguagesPageProps) {
    const router = useRouter()
    const notifications = useActionNotifications()
    const selection = useUserSelectionState<string>()

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingLang, setEditingLang] = useState<{
        name: string
        proficiency: Proficiency
    } | null>(null)
    const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false)

    const toggleSelectLanguage = (name: string) => {
        if (!selection.isSelectionMode) {
            const lang = initialUserLanguages.find((l) => l.name === name)
            if (lang) setEditingLang(lang)
            return
        }

        selection.toggleSelection(name)
    }

    const handleAdd = async (name: string, proficiency: Proficiency) => {
        await addProfileLanguage({
            userId,
            name,
            proficiency,
        })
        notifications.success("created")
        router.refresh()
    }

    const handleUpdate = async (proficiency: Proficiency) => {
        if (!editingLang) return
        await updateProfileLanguage({
            userId,
            name: editingLang.name,
            proficiency,
        })
        notifications.success("updated")
        router.refresh()
    }

    const handleDelete = async () => {
        await deleteProfileLanguages({
            userId,
            name: selection.selectedItems,
        })
        notifications.success("deleted")
        selection.resetSelection()
        router.refresh()
    }

    return {
        isRemovalMode: selection.isSelectionMode,
        setIsRemovalMode: selection.setIsSelectionMode,
        selectedLanguages: selection.selectedItems,
        setSelectedLanguages: selection.setSelectedItems,
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
    }
}
