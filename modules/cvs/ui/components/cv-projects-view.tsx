"use client"

import { useTranslations } from "next-intl"

import { ProjectsTableView } from "@/components/projects-table-view"
import type { CvProjectItem, ProjectOption } from "@/modules/cvs/types"

import { useCvProjects } from "../../hooks/use-cv-projects"
import { CvProjectFormModal } from "./cv-project-form-modal"

interface CvProjectsViewProps {
    cvId: string
    projects: CvProjectItem[]
    availableProjects: ProjectOption[]
    canManageProjects: boolean
}

export function CvProjectsView({
    cvId,
    projects,
    availableProjects,
    canManageProjects,
}: CvProjectsViewProps) {
    const t = useTranslations("CV.projects")

    const {
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
        refresh,
    } = useCvProjects({ cvId, projects, availableProjects })

    return (
        <div className="space-y-3">
            <ProjectsTableView
                projects={projects}
                canManage={canManageProjects}
                addLabel={t("addProject")}
                searchPlaceholder={t("search")}
                searchLabel={t("searchLabel")}
                addDisabled={!availableToAdd}
                onAdd={() => setIsAddOpen(true)}
                onEdit={setEditingProject}
                onDelete={handleRemove}
                onDeleteClose={() => setRemoveError(null)}
                isDeleting={isRemoving}
                deleteError={removeError}
                getTags={(project) => project.responsibilities}
                emptyMessage={t("empty")}
            />

            {canManageProjects && (
                <>
                    {(isAddOpen || editingProject) && (
                        <CvProjectFormModal
                            isOpen
                            onClose={() => {
                                setIsAddOpen(false)
                                setEditingProject(null)
                            }}
                            onSaved={refresh}
                            cvId={cvId}
                            project={editingProject}
                            projects={availableProjects}
                            existingProjectIds={existingProjectIds}
                        />
                    )}
                </>
            )}
        </div>
    )
}
