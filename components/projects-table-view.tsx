"use client"

import {
    ArrowDown,
    ArrowUp,
    MoreVertical,
    Pencil,
    Search,
    Trash2,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { Fragment } from "react"

import { DeleteModal } from "@/components/ui/delete-item-modal"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { AddItemButton } from "@/components/ui/list-management-buttons"
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock"
import { type SortField, useProjectsTable } from "@/hooks/use-projects-table"

export interface ProjectTableItem {
    id: string
    name: string
    domain: string
    description: string
    start_date?: string | null
    end_date?: string | null
    environment: string[]
}

interface ProjectsTableViewProps<T extends ProjectTableItem> {
    projects: T[]
    canManage: boolean
    addLabel?: string
    searchPlaceholder: string
    searchLabel?: string
    emptyMessage?: string
    showDates?: boolean
    addDisabled?: boolean
    getTags?: (project: T) => string[]
    onAdd?: () => void
    onEdit?: (project: T) => void
    onDelete?: (project: T) => Promise<boolean>
    onDeleteClose?: () => void
    isDeleting?: boolean
    deleteError?: string | null
    manageCopy?: {
        edit: string
        remove: string
        removeTitle: string
        removeConfirmation: (name: string) => ReactNode
        cancel: string
        removing: string
    }
}

function formatDate(
    value: string | null | undefined,
    locale: string,
    tillNow: string,
) {
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

export function ProjectsTableView<T extends ProjectTableItem>({
    projects,
    canManage,
    addLabel,
    searchPlaceholder,
    searchLabel,
    emptyMessage,
    showDates = true,
    addDisabled = false,
    getTags,
    onAdd,
    onEdit,
    onDelete,
    onDeleteClose,
    isDeleting = false,
    deleteError = null,
    manageCopy,
}: ProjectsTableViewProps<T>) {
    const locale = useLocale()
    const t = useTranslations("CV.projects")

    const {
        search,
        setSearch,
        sortField,
        sortDirection,
        itemToRemove,
        setItemToRemove,
        visibleItems,
        toggleSort,
    } = useProjectsTable({ items: projects, locale })
    useBodyScrollLock(Boolean(itemToRemove))

    const actionCopy = manageCopy ?? {
        edit: t("edit"),
        remove: t("remove"),
        removeTitle: t("removeTitle"),
        removeConfirmation: (name: string) =>
            t.rich("removeConfirmation", {
                name,
                strong: (chunks) => <strong>{chunks}</strong>,
            }),
        cancel: t("cancel"),
        removing: t("removing"),
    }

    const renderSortIcon = (field: SortField) => {
        const SortIcon =
            sortField === field && sortDirection === "asc" ? ArrowUp : ArrowDown
        return <SortIcon aria-hidden="true" className="size-3" />
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="relative block w-full sm:max-w-77.5">
                    <Search
                        aria-hidden="true"
                        className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={searchPlaceholder}
                        aria-label={searchLabel ?? searchPlaceholder}
                        className="h-7.5 rounded-full border-[#cccccc] pl-8 text-xs dark:border-border"
                    />
                </label>

                {canManage && onAdd && addLabel && (
                    <AddItemButton
                        label={addLabel}
                        onClick={onAdd}
                        disabled={addDisabled}
                    />
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-120 border-collapse text-left text-sm">
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
                            {showDates && (
                                <>
                                    <th className="w-[20%] px-2 font-medium">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleSort("start_date")
                                            }
                                            className="inline-flex items-center gap-1"
                                        >
                                            {t("startDate")}
                                            {renderSortIcon("start_date")}
                                        </button>
                                    </th>
                                    <th className="w-[20%] px-2 font-medium">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleSort("end_date")
                                            }
                                            className="inline-flex items-center gap-1"
                                        >
                                            {t("endDate")}
                                            {renderSortIcon("end_date")}
                                        </button>
                                    </th>
                                </>
                            )}
                            {canManage && onEdit && onDelete && (
                                <th className="w-[4%] px-2">
                                    <span className="sr-only">
                                        {t("actions")}
                                    </span>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {visibleItems.map((project) => (
                            <Fragment key={project.id}>
                                <tr className="h-10 text-foreground">
                                    <td className="truncate px-2 font-medium">
                                        {project.name}
                                    </td>
                                    <td className="px-2">{project.domain}</td>
                                    {showDates && (
                                        <>
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
                                        </>
                                    )}
                                    {canManage && onEdit && onDelete && (
                                        <td className="relative px-2 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    type="button"
                                                    aria-label={t(
                                                        "actionsFor",
                                                        { name: project.name },
                                                    )}
                                                    className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                                >
                                                    <MoreVertical
                                                        aria-hidden="true"
                                                        className="size-4"
                                                    />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="min-w-40 rounded border border-border text-left text-xs"
                                                >
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            onEdit(project)
                                                        }
                                                        className="gap-2 whitespace-nowrap px-3 py-2"
                                                    >
                                                        <Pencil className="size-3" />
                                                        {actionCopy.edit}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() =>
                                                            setItemToRemove(
                                                                project,
                                                            )
                                                        }
                                                        className="gap-2 whitespace-nowrap px-3 py-2"
                                                    >
                                                        <Trash2 className="size-3" />
                                                        {actionCopy.remove}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    )}
                                </tr>
                                <tr className="border-b border-border">
                                    <td
                                        colSpan={
                                            2 +
                                            Number(showDates) * 2 +
                                            Number(
                                                canManage &&
                                                    Boolean(onEdit && onDelete),
                                            )
                                        }
                                        className="px-2 pb-4 pt-1"
                                    >
                                        <p className="mb-2 text-xs leading-5 text-muted-foreground">
                                            {project.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(
                                                getTags?.(project) ??
                                                project.environment
                                            ).map((tag, index) => (
                                                <span
                                                    key={`${tag}-${index}`}
                                                    className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {visibleItems.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                    {search.trim()
                        ? t("noSearchResults")
                        : (emptyMessage ?? t("empty"))}
                </p>
            )}

            {itemToRemove && canManage && onDelete && (
                <DeleteModal
                    isOpen={Boolean(itemToRemove)}
                    onClose={() => {
                        setItemToRemove(null)
                        onDeleteClose?.()
                    }}
                    onConfirm={async () => {
                        const removed = await onDelete(itemToRemove)
                        if (removed) {
                            setItemToRemove(null)
                            onDeleteClose?.()
                        }
                    }}
                    title={actionCopy.removeTitle}
                    description={actionCopy.removeConfirmation(
                        itemToRemove.name,
                    )}
                    cancelText={actionCopy.cancel}
                    confirmText={actionCopy.remove}
                    deletingText={actionCopy.removing}
                    isDeleting={isDeleting}
                    error={deleteError}
                />
            )}
        </div>
    )
}
