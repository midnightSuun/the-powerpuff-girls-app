"use client"

import type { ProjectTableItem } from "@/components/projects-table-view"
import { BaseModal } from "@/components/ui/base-modal"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ProjectFormData } from "@/modules/projects/hooks/use-admin-projects"
import { useProjectForm } from "@/modules/projects/hooks/use-project-form"

import { EnvironmentMultiselect } from "./environment-multiselect"

interface ProjectFormModalProps {
    isOpen: boolean
    project?: ProjectTableItem | null
    environmentOptions: string[]
    onClose: () => void
    onSave: (
        project: ProjectTableItem | null,
        data: ProjectFormData,
    ) => Promise<void>
}

const fieldClassName = (isEditing: boolean) =>
    `${isEditing ? "h-10" : "h-8"} rounded-none border-border bg-background px-2.5 text-xs text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring dark:bg-background`

export function ProjectFormModal(props: ProjectFormModalProps) {
    const { isOpen, project, environmentOptions, onClose } = props
    const isEditing = Boolean(project)
    const {
        t,
        name,
        setName,
        domain,
        setDomain,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        description,
        setDescription,
        environment,
        setEnvironment,
        error,
        isSubmitting,
        isValid,
        handleSubmit,
    } = useProjectForm(props)

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={project ? t("updateTitle") : t("createTitle")}
            error={error}
            isPending={isSubmitting}
            isValid={isValid}
            cancelText={t("cancel")}
            confirmText={project ? t("update") : t("create")}
            pendingText={project ? t("saving") : t("creating")}
            onSubmit={handleSubmit}
            formClassName={isEditing ? "max-w-[760px]" : "max-w-[620px]"}
            overlayClassName="items-start overflow-y-auto py-4 sm:items-center"
            dialogClassName={`max-h-[calc(100dvh-2rem)] ${
                isEditing ? "max-w-[760px]" : "max-w-[620px]"
            } overflow-y-auto rounded-none border-border bg-background p-4 text-foreground md:rounded-none md:p-4`}
            titleClassName="text-sm font-medium md:text-sm md:font-medium"
            footerClassName="mt-1 gap-3"
            cancelButtonClassName="h-10 w-[138px] rounded-full border-foreground px-0 py-0 text-[10px] text-foreground hover:bg-accent"
            confirmButtonClassName="h-10 w-[138px] rounded-full bg-[#cf2f32] px-0 py-0 text-[10px] text-white hover:bg-[#b92529]"
        >
            <div className="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-2">
                <div className="relative flex flex-col pt-4">
                    {Boolean(name) && (
                        <span className="absolute top-0 left-0 text-[10px] text-muted-foreground">
                            {t("name")}
                        </span>
                    )}
                    <Input
                        required
                        maxLength={255}
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder={Boolean(name) ? undefined : t("name")}
                        className={fieldClassName(isEditing)}
                    />
                </div>

                <div className="relative flex flex-col pt-4">
                    {Boolean(domain) && (
                        <span className="absolute top-0 left-0 text-[10px] text-muted-foreground">
                            {t("domain")}
                        </span>
                    )}
                    <Input
                        required
                        maxLength={255}
                        value={domain}
                        onChange={(event) => setDomain(event.target.value)}
                        placeholder={Boolean(domain) ? undefined : t("domain")}
                        className={fieldClassName(isEditing)}
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
                        className={fieldClassName(isEditing)}
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
                        className={fieldClassName(isEditing)}
                    />
                </div>

                <div className="relative flex flex-col pt-4 sm:col-span-2">
                    {Boolean(description) && (
                        <span className="absolute top-0 left-0 text-[10px] text-muted-foreground">
                            {t("description")}
                        </span>
                    )}
                    <Textarea
                        required
                        aria-label={t("description")}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder={
                            Boolean(description) ? undefined : t("description")
                        }
                        className={`resize-none rounded-none border-border bg-background px-2.5 py-2 text-xs text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring ${
                            isEditing ? "min-h-25.5" : "min-h-20"
                        }`}
                    />
                </div>

                <div className="relative flex flex-col pt-4 sm:col-span-2">
                    {environment.length > 0 && (
                        <span className="absolute top-0 left-0 text-[10px] text-muted-foreground">
                            {t("environment")}
                        </span>
                    )}
                    <EnvironmentMultiselect
                        options={environmentOptions}
                        value={environment}
                        onChange={setEnvironment}
                        placeholder={t("environment")}
                        addLabel={t("addEnvironment")}
                        removeLabel={(value) =>
                            t("removeEnvironment", { value })
                        }
                        compact={!isEditing}
                    />
                </div>
            </div>
        </BaseModal>
    )
}
