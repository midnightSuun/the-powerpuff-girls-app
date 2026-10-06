import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"

import type { ProjectTableItem } from "@/components/projects-table-view"
import { useActionNotifications } from "@/hooks/use-action-notifications"
import {
    createProject,
    deleteProject,
    updateProject,
} from "@/modules/cvs/api/projects"

export interface ProjectFormData {
    name: string
    domain: string
    start_date: string
    end_date: string | null
    description: string
    environment: string[]
}

export function useAdminProjects() {
    const router = useRouter()
    const t = useTranslations("Admin.projects")
    const notifications = useActionNotifications()
    const [isRemoving, setIsRemoving] = useState(false)
    const [removeError, setRemoveError] = useState<string | null>(null)

    const handleSave = async (
        project: ProjectTableItem | null,
        data: ProjectFormData,
    ) => {
        if (project) {
            await updateProject({ ...data, projectId: project.id })
            notifications.success("updated")
        } else {
            await createProject(data)
            notifications.success("created")
        }
        router.refresh()
    }

    const handleDelete = async (project: ProjectTableItem) => {
        setIsRemoving(true)
        setRemoveError(null)

        try {
            await deleteProject({ projectId: project.id })
            notifications.success("deleted")
            router.refresh()
            return true
        } catch (error) {
            console.error("Failed to delete project:", error)
            setRemoveError(t("removeError"))
            return false
        } finally {
            setIsRemoving(false)
        }
    }

    return {
        isRemoving,
        removeError,
        setRemoveError,
        handleSave,
        handleDelete,
    }
}
