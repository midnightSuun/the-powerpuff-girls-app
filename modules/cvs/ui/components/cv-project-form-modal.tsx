"use client"

import { useTranslations } from "next-intl"
import { type SyntheticEvent, useState } from "react"

import { BaseModal } from "@/components/ui/base-modal"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"
import type { CvProjectItem, ProjectOption } from "@/modules/cvs/types"

import { addCvProject, updateCvProject } from "../../api/projects"

interface CvProjectFormModalProps {
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
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
}

export function CvProjectFormModal({
    isOpen,
    onClose,
    onSaved,
    cvId,
    project,
    projects,
    existingProjectIds,
}: CvProjectFormModalProps) {
    const t = useTranslations("CV.projects.form")
    const [projectId, setProjectId] = useState(project?.project.id ?? "")
    const [startDate, setStartDate] = useState(
        toDateInputValue(project?.start_date),
    )
    const [endDate, setEndDate] = useState(toDateInputValue(project?.end_date))
    const [roles, setRoles] = useState(project?.roles.join("\n") ?? "")
    const [responsibilities, setResponsibilities] = useState(
        project?.responsibilities.join("\n") ?? "",
    )
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useBodyScrollLock(isOpen)

    const availableProjects = projects.filter(
        (item) =>
            item.id === project?.project.id ||
            !existingProjectIds.includes(item.id),
    )
    const isValid = Boolean(projectId && startDate)

    const handleSubmit = async (event: SyntheticEvent) => {
        event.preventDefault()
        if (!isValid) return

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
            onSaved()
            onClose()
        } catch (caughtError) {
            console.error("Failed to save project on CV:", caughtError)
            setError(t("saveError"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={project ? t("editTitle") : t("addTitle")}
            error={error}
            isPending={isSubmitting}
            isValid={isValid}
            cancelText={t("cancel")}
            confirmText={project ? t("update") : t("add")}
            pendingText={project ? t("updating") : t("adding")}
            onSubmit={handleSubmit}
        >
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                {t("project")}
                <Select
                    value={projectId}
                    onValueChange={(value) => setProjectId(value ?? "")}
                >
                    <SelectTrigger className="w-full rounded-none border-[#cccccc] bg-background px-3 text-sm dark:border-border">
                        <SelectValue placeholder={t("selectProject")} />
                    </SelectTrigger>
                    <SelectContent align="start" className="rounded-none">
                        {availableProjects.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                                {item.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {availableProjects.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                        {t("noAvailableProjects")}
                    </span>
                )}
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                    {t("startDate")}
                    <Input
                        type="date"
                        required
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        className="rounded-none border-[#cccccc] bg-background text-foreground dark:border-border"
                    />
                </label>
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                    {t("endDate")}
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        className="rounded-none border-[#cccccc] bg-background text-foreground dark:border-border"
                    />
                </label>
            </div>

            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                {t("roles")}
                <Textarea
                    value={roles}
                    onChange={(event) => setRoles(event.target.value)}
                    className="min-h-20 rounded-none border-[#cccccc] bg-background text-foreground dark:border-border"
                />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                {t("responsibilities")}
                <Textarea
                    value={responsibilities}
                    onChange={(event) =>
                        setResponsibilities(event.target.value)
                    }
                    className="min-h-20 rounded-none border-[#cccccc] bg-background text-foreground dark:border-border"
                />
            </label>
        </BaseModal>
    )
}
