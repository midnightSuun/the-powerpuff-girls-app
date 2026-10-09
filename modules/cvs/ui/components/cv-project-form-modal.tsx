"use client"

import { BaseModal } from "@/components/ui/base-modal"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { CvProjectItem, ProjectOption } from "@/modules/cvs/types"

import { useCvProjectForm } from "../../hooks/use-cv-project-form"

interface CvProjectFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSaved: () => void
    cvId: string
    project?: CvProjectItem | null
    projects: ProjectOption[]
    existingProjectIds: string[]
}

const fieldClassName =
    "h-9 rounded-none border-[#cccccc] bg-background px-2.5 text-xs text-foreground shadow-none dark:border-border"
const disabledFieldClassName =
    "disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100"

export function CvProjectFormModal(props: CvProjectFormModalProps) {
    const { isOpen, onClose, project } = props

    const {
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
    } = useCvProjectForm(props)

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
                <div className="relative flex flex-col pt-4">
                    {Boolean(projectId) && (
                        <span className="absolute top-0 left-0 text-[10px] text-muted-foreground">
                            {t("project")}
                        </span>
                    )}
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
                </div>

                <div className="relative flex flex-col pt-4">
                    {Boolean(selectedProject?.domain) && (
                        <span className="absolute top-0 left-0 text-[10px] text-muted-foreground">
                            {t("domain")}
                        </span>
                    )}
                    <Input
                        value={selectedProject?.domain ?? ""}
                        placeholder={
                            selectedProject?.domain ? undefined : t("domain")
                        }
                        readOnly
                        disabled
                        className={`${fieldClassName} ${disabledFieldClassName}`}
                    />
                </div>
                <div className="relative flex flex-col pt-4">
                    {Boolean(startDate) && (
                        <span className="absolute top-0 left-0 text-[10px] text-muted-foreground">
                            {t("startDate")}
                        </span>
                    )}
                    <DatePicker
                        value={startDate}
                        onChange={(newStart) => {
                            setStartDate(newStart)
                            if (endDate && newStart > endDate) {
                                setEndDate("")
                            }
                        }}
                        maxDate={endDate || undefined}
                        placeholder={t("startDate")}
                        className={fieldClassName}
                    />
                </div>

                <div className="relative flex flex-col pt-4">
                    {Boolean(endDate) && (
                        <span className="absolute top-0 left-0 text-[10px] text-muted-foreground">
                            {t("endDate")}
                        </span>
                    )}
                    <DatePicker
                        value={endDate}
                        onChange={setEndDate}
                        minDate={startDate || undefined}
                        placeholder={t("endDate")}
                        className={fieldClassName}
                    />
                </div>
                <div className="relative flex flex-col pt-4 sm:col-span-2">
                    {Boolean(selectedProject?.description) && (
                        <span className="absolute top-0 left-0 text-[10px] text-muted-foreground">
                            {t("description")}
                        </span>
                    )}
                    <Textarea
                        value={selectedProject?.description ?? ""}
                        placeholder={
                            selectedProject?.description
                                ? undefined
                                : t("description")
                        }
                        readOnly
                        disabled
                        className={`${disabledFieldClassName} min-h-20 resize-none rounded-none border-[#cccccc] bg-muted p-2.5 text-xs leading-5 shadow-none dark:border-border`}
                    />
                </div>

                <div className="relative flex flex-col pt-4 sm:col-span-2">
                    {Boolean(selectedProject?.environment?.length) && (
                        <span className="absolute top-0 left-0 text-[10px] text-muted-foreground">
                            {t("environment")}
                        </span>
                    )}
                    <div className="flex min-h-9 flex-wrap items-center gap-1.5 border border-[#cccccc] bg-muted px-2.5 py-1.5 dark:border-border">
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
                </div>

                <div className="relative flex flex-col pt-4 sm:col-span-2">
                    {Boolean(roles) && (
                        <span className="absolute top-0 left-0 text-[10px] text-muted-foreground">
                            {t("roles")}
                        </span>
                    )}
                    <Input
                        value={roles}
                        onChange={(event) => setRoles(event.target.value)}
                        placeholder={Boolean(roles) ? undefined : t("roles")}
                        className={fieldClassName}
                    />
                </div>

                <div className="relative flex flex-col pt-4 sm:col-span-2">
                    {Boolean(responsibilities) && (
                        <span className="absolute top-0 left-0 text-[10px] text-muted-foreground">
                            {t("responsibilities")}
                        </span>
                    )}
                    <Textarea
                        value={responsibilities}
                        onChange={(event) =>
                            setResponsibilities(event.target.value)
                        }
                        placeholder={
                            Boolean(responsibilities)
                                ? undefined
                                : t("responsibilities")
                        }
                        className="min-h-20 resize-y rounded-none border-[#cccccc] bg-background px-2.5 py-2 text-xs text-foreground shadow-none dark:border-border"
                    />
                </div>
            </div>
        </BaseModal>
    )
}
