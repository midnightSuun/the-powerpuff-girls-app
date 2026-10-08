"use client"

import type { ProjectTableItem } from "@/components/projects-table-view"
import { BaseModal } from "@/components/ui/base-modal"
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
            <div className="grid grid-cols-1 gap-x-2 gap-y-5 sm:grid-cols-2">
                <Input
                    required
                    maxLength={255}
                    label={t("name")}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={fieldClassName(isEditing)}
                />

                <Input
                    required
                    maxLength={255}
                    label={t("domain")}
                    value={domain}
                    onChange={(event) => setDomain(event.target.value)}
                    className={fieldClassName(isEditing)}
                />

                <div className="relative">
                    <Input
                        required
                        type="date"
                        label={t("startDate")}
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        className={`${fieldClassName(isEditing)} scheme-lightolor-scheme:dark]`}
                    />
                </div>

                <div className="relative">
                    <Input
                        type="date"
                        label={t("endDate")}
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        className={`${fieldClassName(isEditing)} scheme-light dark:scheme-dark`}
                    />
                </div>

                <label
                    className={`relative flex flex-col gap-1 text-xs text-muted-foreground sm:col-span-2 ${
                        isEditing ? "pt-2" : ""
                    }`}
                >
                    {isEditing && (
                        <span className="absolute left-2 top-0 z-10 bg-background px-1 text-[10px]">
                            {t("description")}
                        </span>
                    )}
                    <Textarea
                        required
                        aria-label={t("description")}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder={isEditing ? undefined : t("description")}
                        className={`resize-none rounded-none border-border bg-background px-2.5 py-2 text-xs text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring ${
                            isEditing ? "min-h-25.5" : "min-h-20"
                        }`}
                    />
                </label>

                <div
                    className={`relative flex flex-col gap-1 text-xs text-muted-foreground sm:col-span-2 ${
                        isEditing ? "pt-2" : ""
                    }`}
                >
                    {isEditing && (
                        <span className="absolute left-2 top-0 z-10 bg-background px-1 text-[10px]">
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
