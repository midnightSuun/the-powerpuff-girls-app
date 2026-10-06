"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import {
    ProjectsTableView,
    type ProjectTableItem,
} from "@/components/projects-table-view"
import { useAdminProjects } from "@/modules/projects/hooks/use-admin-projects"
import { ProjectFormModal } from "@/modules/projects/ui/components/project-form-modal"

interface AdminProjectsViewProps {
    projects: ProjectTableItem[]
    searchPlaceholder: string
    searchLabel: string
}

export function AdminProjectsView({
    projects,
    searchPlaceholder,
    searchLabel,
}: AdminProjectsViewProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingProject, setEditingProject] =
        useState<ProjectTableItem | null>(null)
    const t = useTranslations("Admin.projects")
    const {
        isRemoving,
        removeError,
        setRemoveError,
        handleSave,
        handleDelete,
    } = useAdminProjects()

    return (
        <>
            <ProjectsTableView
                projects={projects}
                canManage
                addLabel={t("createProject")}
                searchPlaceholder={searchPlaceholder}
                searchLabel={searchLabel}
                onAdd={() => setIsCreateOpen(true)}
                onEdit={setEditingProject}
                onDelete={handleDelete}
                onDeleteClose={() => setRemoveError(null)}
                isDeleting={isRemoving}
                deleteError={removeError}
                emptyMessage={t("empty")}
                showDates
                manageCopy={{
                    edit: t("edit"),
                    remove: t("remove"),
                    removeTitle: t("removeTitle"),
                    removeConfirmation: (name) =>
                        t("removeConfirmation", { name }),
                    cancel: t("cancel"),
                    removing: t("removing"),
                }}
            />

            {(isCreateOpen || editingProject) && (
                <ProjectFormModal
                    key={editingProject?.id ?? "create"}
                    isOpen
                    project={editingProject}
                    environmentOptions={[
                        ...new Set(
                            projects.flatMap((project) => project.environment),
                        ),
                    ]}
                    onClose={() => {
                        setIsCreateOpen(false)
                        setEditingProject(null)
                    }}
                    onSave={handleSave}
                />
            )}
        </>
    )
}
