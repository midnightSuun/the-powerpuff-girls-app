"use client"

import {
    ArrowDown,
    ArrowUp,
    MoreVertical,
    Pencil,
    Search,
    Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Fragment, useMemo, useState } from "react"

import { DeleteModal } from "@/components/ui/delete-item-modal"
import { Input } from "@/components/ui/input"
import { AddItemButton } from "@/components/ui/list-management-buttons"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"
import { removeCvProject } from "@/modules/cvs/api/projects"
import type { CvProjectItem, ProjectOption } from "@/modules/cvs/types"

import { CvProjectFormModal } from "./cv-project-form-modal"

type SortField = "name" | "start_date" | "end_date"

interface CvProjectsViewProps {
    cvId: string
    projects: CvProjectItem[]
    availableProjects: ProjectOption[]
    canManageProjects: boolean
}

function formatDate(value: string | null, locale: string, tillNow: string) {
    if (!value) return tillNow

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    return new Intl.DateTimeFormat(locale, {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        timeZone: "UTC",
    }).format(date)
}

export function CvProjectsView({
    cvId,
    projects,
    availableProjects,
    canManageProjects,
}: CvProjectsViewProps) {
    const router = useRouter()
    const locale = useLocale()
    const t = useTranslations("CV.projects")
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

    const existingProjectIds = projects.map((project) => project.project.id)
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

    const renderSortIcon = (field: SortField) => {
        const SortIcon =
            sortField === field && sortDirection === "asc" ? ArrowUp : ArrowDown
        return <SortIcon aria-hidden="true" className="size-3" />
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
            setProjectToRemove(null)
            router.refresh()
        } catch (error) {
            console.error("Failed to remove project from CV:", error)
            setRemoveError(t("removeError"))
        } finally {
            setIsRemoving(false)
        }
    }

    const availableToAdd = availableProjects.some(
        (project) => !existingProjectIds.includes(project.id),
    )

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="relative block w-full sm:max-w-[310px]">
                    <Search
                        aria-hidden="true"
                        className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t("search")}
                        aria-label={t("searchLabel")}
                        className="h-[30px] rounded-full border-[#cccccc] pl-8 text-xs dark:border-border"
                    />
                </label>

                {canManageProjects && (
                    <AddItemButton
                        label={t("addProject")}
                        onClick={() => setIsAddOpen(true)}
                        disabled={!availableToAdd}
                        className="self-end text-xs font-medium text-[#d7352c] hover:text-[#b5332b] dark:text-[#f06b65] dark:hover:text-[#ff8a84] sm:self-auto"
                    />
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                    <thead>
                        <tr className="h-10 border-b border-border text-foreground">
                            <th className="w-[31%] px-2 font-medium">
                                <button
                                    type="button"
                                    onClick={() => toggleSort("name")}
                                    className="inline-flex items-center gap-1"
                                    aria-label={t("sortByName", {
                                        direction:
                                            sortField === "name" &&
                                            sortDirection === "desc"
                                                ? t("ascending")
                                                : t("descending"),
                                    })}
                                >
                                    {t("name")}
                                    {renderSortIcon("name")}
                                </button>
                            </th>
                            <th className="w-[25%] px-2 font-medium">
                                {t("domain")}
                            </th>
                            <th className="w-[20%] px-2 font-medium">
                                <button
                                    type="button"
                                    onClick={() => toggleSort("start_date")}
                                    className="inline-flex items-center gap-1"
                                >
                                    {t("startDate")}
                                    {renderSortIcon("start_date")}
                                </button>
                            </th>
                            <th className="w-[20%] px-2 font-medium">
                                <button
                                    type="button"
                                    onClick={() => toggleSort("end_date")}
                                    className="inline-flex items-center gap-1"
                                >
                                    {t("endDate")}
                                    {renderSortIcon("end_date")}
                                </button>
                            </th>
                            <th
                                className="w-[4%] px-2"
                                aria-label={t("actions")}
                            />
                        </tr>
                    </thead>
                    <tbody>
                        {visibleProjects.map((project) => (
                            <Fragment key={project.id}>
                                <tr className="h-10 text-foreground">
                                    <td className="truncate px-2 font-medium">
                                        {project.name}
                                    </td>
                                    <td className="px-2">{project.domain}</td>
                                    <td className="px-2">
                                        {formatDate(
                                            project.start_date,
                                            locale,
                                            t("tillNow"),
                                        )}
                                    </td>
                                    <td className="px-2">
                                        {formatDate(
                                            project.end_date,
                                            locale,
                                            t("tillNow"),
                                        )}
                                    </td>
                                    <td className="relative px-2 text-right">
                                        {canManageProjects && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setActiveMenuId(
                                                            activeMenuId ===
                                                                project.id
                                                                ? null
                                                                : project.id,
                                                        )
                                                    }
                                                    aria-label={t(
                                                        "actionsFor",
                                                        {
                                                            name: project.name,
                                                        },
                                                    )}
                                                    aria-haspopup="menu"
                                                    aria-expanded={
                                                        activeMenuId ===
                                                        project.id
                                                    }
                                                    className="text-muted-foreground hover:text-foreground"
                                                >
                                                    <MoreVertical
                                                        aria-hidden="true"
                                                        className="size-4"
                                                    />
                                                </button>
                                                {activeMenuId ===
                                                    project.id && (
                                                    <div
                                                        role="menu"
                                                        className="absolute right-2 top-8 z-10 min-w-28 rounded border border-border bg-popover py-1 text-left text-popover-foreground shadow-md"
                                                    >
                                                        <button
                                                            type="button"
                                                            role="menuitem"
                                                            onClick={() => {
                                                                setEditingProject(
                                                                    project,
                                                                )
                                                                setActiveMenuId(
                                                                    null,
                                                                )
                                                            }}
                                                            className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-accent"
                                                        >
                                                            <Pencil className="size-3" />
                                                            {t("edit")}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            role="menuitem"
                                                            onClick={() => {
                                                                setProjectToRemove(
                                                                    project,
                                                                )
                                                                setRemoveError(
                                                                    null,
                                                                )
                                                                setActiveMenuId(
                                                                    null,
                                                                )
                                                            }}
                                                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-accent"
                                                        >
                                                            <Trash2 className="size-3" />
                                                            {t("remove")}
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </td>
                                </tr>
                                <tr className="border-b border-border">
                                    <td colSpan={5} className="px-2 pb-4 pt-1">
                                        <p className="mb-2 text-xs leading-5 text-muted-foreground">
                                            {project.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {[...project.responsibilities].map(
                                                (tag, index) => (
                                                    <span
                                                        key={`${tag}-${index}`}
                                                        className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                                                    >
                                                        {tag}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {visibleProjects.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                    {search.trim() ? t("noSearchResults") : t("empty")}
                </p>
            )}

            {canManageProjects && (
                <>
                    {(isAddOpen || editingProject) && (
                        <CvProjectFormModal
                            isOpen
                            onClose={() => {
                                setIsAddOpen(false)
                                setEditingProject(null)
                            }}
                            onSaved={() => router.refresh()}
                            cvId={cvId}
                            project={editingProject}
                            projects={availableProjects}
                            existingProjectIds={existingProjectIds}
                        />
                    )}
                    <DeleteModal
                        isOpen={Boolean(projectToRemove)}
                        onClose={() => {
                            setProjectToRemove(null)
                            setRemoveError(null)
                        }}
                        onConfirm={handleRemove}
                        title={t("removeTitle")}
                        description={t.rich("removeConfirmation", {
                            name: projectToRemove?.name ?? "",
                            strong: (chunks) => <strong>{chunks}</strong>,
                        })}
                        cancelText={t("cancel")}
                        confirmText={t("remove")}
                        deletingText={t("removing")}
                        isDeleting={isRemoving}
                        error={removeError}
                        formClassName="max-w-[450px]"
                        dialogClassName="max-w-[450px] rounded-none p-5 md:rounded-none md:p-5"
                        titleClassName="text-base font-medium md:text-base md:font-medium"
                        footerClassName="mt-4 gap-4"
                        cancelButtonClassName="h-9 w-[116px] px-0 py-0 text-[10px]"
                        confirmButtonClassName="h-9 w-[116px] px-0 py-0 text-[10px]"
                        descriptionClassName="text-xs"
                    />
                </>
            )}
        </div>
    )
}
