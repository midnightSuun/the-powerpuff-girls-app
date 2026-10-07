import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { useActionNotifications } from "@/hooks/use-action-notifications"

import { createCvAction } from "../api/create-cv"
import { deleteCvAction } from "../api/delete-cv"
import { updateCvAction } from "../api/update-cv"
import { CvItem } from "../types"

interface UseCvsPageProps {
    initialCvs: CvItem[]
    targetUserId?: string
}

export function useCvsPage({ initialCvs, targetUserId }: UseCvsPageProps) {
    const router = useRouter()
    const t = useTranslations("CV.list")
    const notifications = useActionNotifications()

    const [cvs, setCvs] = useState<CvItem[]>(initialCvs)
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingCv, setEditingCv] = useState<CvItem | null>(null)
    const [deletingCv, setDeletingCv] = useState<CvItem | null>(null)
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const sortedCvs = [...cvs].sort((a, b) => {
        if (sortOrder === "asc") {
            return a.name.localeCompare(b.name)
        }
        return b.name.localeCompare(a.name)
    })

    const toggleSort = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    }

    const handleCreate = async (data: {
        name: string
        education: string
        description: string
    }) => {
        try {
            setIsSubmitting(true)
            setError(null)

            const result = await createCvAction({
                name: data.name,
                education: data.education,
                description: data.description,
                userId: targetUserId,
            })

            if (result?.error) {
                console.error("Failed to create CV:", result.error)
                setError(t("createError"))
                return
            }

            notifications.success("created")
            setIsCreateOpen(false)
            router.refresh()
        } catch {
            setError(t("createError"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (data: {
        name: string
        education: string
        description: string
    }) => {
        if (!editingCv) return
        try {
            setIsSubmitting(true)
            setError(null)
            const result = await updateCvAction({
                cvId: editingCv.id,
                ...data,
            })

            if (result.error) {
                console.error("Failed to update CV:", result.error)
                setError(t("updateError"))
                return
            }

            notifications.success("updated")
            setCvs(
                cvs.map((cv) =>
                    cv.id === editingCv.id ? { ...cv, ...data } : cv,
                ),
            )
            setEditingCv(null)
            router.refresh()
        } catch {
            setError(t("updateError"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingCv) return
        try {
            setIsSubmitting(true)
            setError(null)
            const result = await deleteCvAction(deletingCv.id)

            if (result.error) {
                console.error("Failed to delete CV:", result.error)
                setError(t("deleteError"))
                return
            }

            notifications.success("deleted")
            setCvs(cvs.filter((cv) => cv.id !== deletingCv.id))
            setDeletingCv(null)
            router.refresh()
        } catch {
            setError(t("deleteError"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        sortedCvs,
        sortOrder,
        toggleSort,
        isCreateOpen,
        setIsCreateOpen,
        editingCv,
        setEditingCv,
        deletingCv,
        setDeletingCv,
        activeMenuId,
        setActiveMenuId,
        isSubmitting,
        error,
        handleCreate,
        handleUpdate,
        handleDelete,
    }
}
