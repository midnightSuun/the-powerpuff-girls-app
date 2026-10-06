import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"

import { useActionNotifications } from "@/hooks/use-action-notifications"
import { removeCvProject } from "@/modules/cvs/api/projects"
import type { CvProjectItem, ProjectOption } from "@/modules/cvs/types"

interface UseCvProjectsProps {
    cvId: string
    projects: CvProjectItem[]
    availableProjects: ProjectOption[]
}

export function useCvProjects({
    cvId,
    projects,
    availableProjects,
}: UseCvProjectsProps) {
    const router = useRouter()
    const t = useTranslations("CV.projects")
    const notifications = useActionNotifications()

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<CvProjectItem | null>(
        null,
    )
    const [isRemoving, setIsRemoving] = useState(false)
    const [removeError, setRemoveError] = useState<string | null>(null)

    const existingProjectIds = useMemo(
        () => projects.map((project) => project.project.id),
        [projects],
    )

    const handleRemove = async (project: CvProjectItem) => {
        setIsRemoving(true)
        setRemoveError(null)

        try {
            await removeCvProject({
                cvId,
                projectId: project.project.id,
            })
            notifications.success("deleted")
            router.refresh()
            return true
        } catch (error) {
            console.error("Failed to remove project from CV:", error)
            setRemoveError(t("removeError"))
            return false
        } finally {
            setIsRemoving(false)
        }
    }

    const availableToAdd = useMemo(
        () =>
            availableProjects.some(
                (project) => !existingProjectIds.includes(project.id),
            ),
        [availableProjects, existingProjectIds],
    )

    return {
        isAddOpen,
        setIsAddOpen,
        editingProject,
        setEditingProject,
        isRemoving,
        removeError,
        setRemoveError,
        existingProjectIds,
        availableToAdd,
        handleRemove,
        refresh: () => router.refresh(),
    }
}
