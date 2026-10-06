import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"

import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"
import { removeCvProject } from "@/modules/cvs/api/projects"
import type { CvProjectItem, ProjectOption } from "@/modules/cvs/types"

export type SortField = "name" | "start_date" | "end_date"

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

    const [search, setSearch] = useState("")
    const [sortField, setSortField] = useState<SortField>("name")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<CvProjectItem | null>(
        null,
    )
    const [projectToRemove, setProjectToRemove] =
        useState<CvProjectItem | null>(null)
    const [isRemoving, setIsRemoving] = useState(false)
    const [removeError, setRemoveError] = useState<string | null>(null)

    useBodyScrollLock(Boolean(projectToRemove))

    const existingProjectIds = useMemo(
        () => projects.map((project) => project.project.id),
        [projects],
    )

    const visibleProjects = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase()

        return projects
            .filter((project) =>
                [
                    project.name,
                    project.domain,
                    project.description,
                    ...project.environment,
                ]
                    .join(" ")
                    .toLocaleLowerCase()
                    .includes(normalizedSearch),
            )
            .sort((left, right) => {
                const comparison = (left[sortField] ?? "").localeCompare(
                    right[sortField] ?? "",
                )
                return sortDirection === "asc" ? comparison : -comparison
            })
    }, [projects, search, sortDirection, sortField])

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((direction) =>
                direction === "asc" ? "desc" : "asc",
            )
        } else {
            setSortField(field)
            setSortDirection("desc")
        }
    }

    const handleRemove = async () => {
        if (!projectToRemove) return

        setIsRemoving(true)
        setRemoveError(null)

        try {
            await removeCvProject({
                cvId,
                projectId: projectToRemove.project.id,
            })
            notifications.success("deleted")
            setProjectToRemove(null)
            router.refresh()
        } catch (error) {
            console.error("Failed to remove project from CV:", error)
            setRemoveError(t("removeError"))
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
        search,
        setSearch,
        sortField,
        sortDirection,
        activeMenuId,
        setActiveMenuId,
        isAddOpen,
        setIsAddOpen,
        editingProject,
        setEditingProject,
        projectToRemove,
        setProjectToRemove,
        isRemoving,
        removeError,
        setRemoveError,
        visibleProjects,
        existingProjectIds,
        availableToAdd,
        toggleSort,
        handleRemove,
        refresh: () => router.refresh(),
    }
}
