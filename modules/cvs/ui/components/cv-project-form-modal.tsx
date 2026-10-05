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
        .split(/[,\r\n]/)
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
            onSaved()
            onClose()
        } catch (caughtError) {
            console.error("Failed to save project on CV:", caughtError)
            setError(t("saveError"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const fieldClassName =
        "h-9 rounded-none border-[#cccccc] bg-background px-2.5 text-xs text-foreground shadow-none dark:border-border"
    const disabledFieldClassName =
        "disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100"

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
            formClassName="max-w-[680px]"
            overlayClassName="items-start overflow-y-auto py-4 sm:items-center"
            dialogClassName="max-h-[calc(100dvh-2rem)] max-w-[680px] overflow-y-auto rounded-none p-5 md:rounded-none md:p-5"
            titleClassName="text-base font-medium md:text-base md:font-medium"
            footerClassName="mt-5 gap-4"
            cancelButtonClassName="h-9 w-[120px] px-0 py-0 text-[10px]"
            confirmButtonClassName="h-9 w-[120px] px-0 py-0 text-[10px]"
        >
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                <label className="relative flex flex-col gap-1 text-xs text-muted-foreground">
                    <span className="absolute -top-1.5 left-2 z-10 bg-background px-1 text-[10px]">
                        {t("project")}
                    </span>
                    <Select
                        value={projectId}
                        onValueChange={(value) => setProjectId(value ?? "")}
                        disabled={Boolean(project)}
                    >
                        <SelectTrigger
                            className={`${fieldClassName} ${disabledFieldClassName} w-full pr-8`}
                        >
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
                </label>

                <label className="relative flex flex-col gap-1 text-xs text-muted-foreground">
                    <span className="absolute -top-1.5 left-2 z-10 bg-background px-1 text-[10px]">
                        {t("domain")}
                    </span>
                    <Input
                        value={selectedProject?.domain ?? ""}
                        readOnly
                        disabled
                        className={`${fieldClassName} ${disabledFieldClassName}`}
                    />
                </label>

                <label className="relative flex flex-col gap-1 text-xs text-muted-foreground">
                    <span className="absolute -top-1.5 left-2 z-10 bg-background px-1 text-[10px]">
                        {t("startDate")}
                    </span>
                    <Input
                        type="date"
                        required
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        className={fieldClassName}
                    />
                </label>

                <label className="relative flex flex-col gap-1 text-xs text-muted-foreground">
                    <span className="absolute -top-1.5 left-2 z-10 bg-background px-1 text-[10px]">
                        {t("endDate")}
                    </span>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        className={fieldClassName}
                    />
                </label>

                <label className="relative flex flex-col gap-1 text-xs text-muted-foreground sm:col-span-2">
                    <span className="absolute -top-1.5 left-2 z-10 bg-background px-1 text-[10px]">
                        {t("description")}
                    </span>
                    <Textarea
                        value={selectedProject?.description ?? ""}
                        readOnly
                        disabled
                        className={`${disabledFieldClassName} min-h-20 resize-none rounded-none border-[#cccccc] bg-muted p-2.5 text-xs leading-5 shadow-none dark:border-border`}
                    />
                </label>

                <div className="relative flex min-h-9 flex-wrap items-center gap-1.5 border border-[#cccccc] bg-muted px-2.5 py-1.5 sm:col-span-2 dark:border-border">
                    <span className="absolute -top-1.5 left-2 z-10 bg-background px-1 text-[10px] text-muted-foreground">
                        {t("environment")}
                    </span>
                    {selectedProject?.environment.map((environment) => (
                        <span
                            key={environment}
                            className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                            {environment}
                        </span>
                    ))}
                    <span className="ml-auto text-muted-foreground">⌄</span>
                </div>

                <label className="relative flex flex-col gap-1 text-xs text-muted-foreground sm:col-span-2">
                    <span className="sr-only">{t("roles")}</span>
                    <Input
                        value={roles}
                        onChange={(event) => setRoles(event.target.value)}
                        placeholder={t("roles")}
                        className={fieldClassName}
                    />
                </label>

                <label className="relative flex flex-col gap-1 text-xs text-muted-foreground sm:col-span-2">
                    <span className="sr-only">{t("responsibilities")}</span>
                    <Textarea
                        value={responsibilities}
                        onChange={(event) =>
                            setResponsibilities(event.target.value)
                        }
                        placeholder={t("responsibilities")}
                        className="min-h-20 resize-y rounded-none border-[#cccccc] bg-background px-2.5 py-2 text-xs text-foreground shadow-none dark:border-border"
                    />
                </label>
            </div>
        </BaseModal>
    )
}
