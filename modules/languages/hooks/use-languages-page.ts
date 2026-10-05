"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import type { Proficiency } from "@/gql/generated/graphql"
import { useActionNotifications } from "@/hooks/use-action-notifications"

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
            name: selectedLanguages,
        })
        notifications.success("deleted")
        setSelectedLanguages([])
        setIsRemovalMode(false)
        router.refresh()
    }

    return {
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
    }
}
