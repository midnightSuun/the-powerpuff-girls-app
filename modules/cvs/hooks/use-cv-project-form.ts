import { useTranslations } from "next-intl"
import { type SyntheticEvent, useState } from "react"

import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"
import type { CvProjectItem, ProjectOption } from "@/modules/cvs/types"

import { addCvProject, updateCvProject } from "../api/projects"

interface UseCvProjectFormProps {
    isOpen: boolean
    onClose: () => void
    onSaved: () => void
    cvId: string
    project?: CvProjectItem | null
    projects: ProjectOption[]
    existingProjectIds: string[]
}

function toDateInputValue(value?: string | null) {
    if (!value) return ""
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)

    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10)
}

function linesToList(value: string) {
    return value
        .split(/[,\r\n]/)
        .map((line) => line.trim())
        .filter(Boolean)
}

export function useCvProjectForm({
    isOpen,
    onClose,
    onSaved,
    cvId,
    project,
    projects,
    existingProjectIds,
}: UseCvProjectFormProps) {
    const t = useTranslations("CV.projects.form")
    const notifications = useActionNotifications()

    const [projectId, setProjectId] = useState(project?.project.id ?? "")
    const [startDate, setStartDate] = useState(
        toDateInputValue(project?.start_date),
    )
    const [endDate, setEndDate] = useState(toDateInputValue(project?.end_date))
    const [roles, setRoles] = useState(project?.roles.join(", ") ?? "")
    const [responsibilities, setResponsibilities] = useState(
        project?.responsibilities.join(", ") ?? "",
    )
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useBodyScrollLock(isOpen)

    const availableProjects = projects.filter(
        (item) =>
            item.id === project?.project.id ||
            !existingProjectIds.includes(item.id),
    )

    const selectedProject =
        projects.find((item) => item.id === projectId) ?? project

    const isDuplicate = !project && existingProjectIds.includes(projectId)
    const isValid = Boolean(projectId && startDate && !isDuplicate)

    const handleSubmit = async (event: SyntheticEvent) => {
        event.preventDefault()
        if (!isValid) {
            if (isDuplicate) setError(t("duplicateProjectError"))
            return
        }

        setIsSubmitting(true)
        setError(null)

        const projectInput = {
            cvId,
            projectId,
            start_date: startDate,
            end_date: endDate || null,
            roles: linesToList(roles),
            responsibilities: linesToList(responsibilities),
        }

        try {
            if (project) {
                await updateCvProject(projectInput)
            } else {
                await addCvProject(projectInput)
            }
            notifications.success(project ? "updated" : "created")
            onSaved()
            onClose()
        } catch (caughtError) {
            console.error("Failed to save project on CV:", caughtError)
            setError(t("saveError"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        t,
        projectId,
        setProjectId,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        roles,
        setRoles,
        responsibilities,
        setResponsibilities,
        error,
        isSubmitting,
        availableProjects,
        selectedProject,
        isValid,
        handleSubmit,
    }
}
