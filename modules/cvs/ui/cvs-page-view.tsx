"use client"

import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { memo, useCallback } from "react"

import { useHeaderToolbarAction } from "@/components/header-toolbar-action"
import { SearchInput } from "@/components/search-input"
import { SortArrow } from "@/components/sort-arrow"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link, usePathname } from "@/i18n/navigation"
import { buildListSearchParams } from "@/lib/list-search-params"
import { nextSortOrder, type SortOrder } from "@/lib/sort"

import { type CvSortField, defaultCvSortField } from "../cv-sort"
import { useCvsPage } from "../hooks/use-cvs-page"
import { CvItem } from "../types"
import { CreateCvTriggerButton } from "./components/add-cv-button"
import { CreateCvModal } from "./components/create-cv-modal"
import { DeleteCvModal } from "./components/delete-cv-modal"
import { UpdateCvModal } from "./components/update-cv-modal"

interface CvListItemProps {
    cv: CvItem
    onView: (id: string) => void
    onEdit: (cv: CvItem) => void
    onDelete: (cv: CvItem) => void
    t: (key: string) => string
}
const CvListItem = memo(function CvListItem({
    cv,
    onView,
    onEdit,
    onDelete,
    t,
}: CvListItemProps) {
    return (
        <div className="group hover:bg-muted/30 transition-colors px-2 py-4 space-y-2">
            <div className="grid grid-cols-[1fr_1fr_auto] lg:grid-cols-[35%_35%_25%_auto] items-start">
                <div className="text-sm font-medium text-foreground wrap-break-word pr-4">
                    {cv.name}
                </div>
                <div className="text-sm text-muted-foreground wrap-break-word pr-4">
                    {cv.education}
                </div>
                <div className="hidden lg:block text-sm text-muted-foreground wrap-break-word pr-4">
                    {cv.user?.email || "—"}
                </div>

                <div className="relative flex justify-end lg:justify-center items-start">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            type="button"
                            aria-label={`Actions for ${cv.name}`}
                            className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <MoreVertical
                                aria-hidden="true"
                                className="size-4"
                            />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="min-w-40 rounded-none border border-[#AEAEAE] dark:border-button-secondary-default text-left text-xs"
                        >
                            <DropdownMenuItem
                                onClick={() => onView(cv.id)}
                                className="gap-2 whitespace-nowrap px-3 py-2"
                            >
                                <Eye className="size-3" />
                                {t("view")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onEdit(cv)}
                                className="gap-2 whitespace-nowrap px-3 py-2"
                            >
                                <Pencil className="size-3" />
                                {t("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onDelete(cv)}
                                className="gap-2 whitespace-nowrap px-3 py-2"
                            >
                                <Trash2 className="size-3" />
                                {t("delete")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {cv.description && (
                <div className="text-sm text-muted-foreground leading-relaxed pt-1 wrap-break-word">
                    {cv.description}
                </div>
            )}
        </div>
    )
})

interface CvsPageViewProps {
    initialCvs: CvItem[]
    isAdmin: boolean
    search: string
    limit?: number
    sortBy?: CvSortField
    sortOrder?: SortOrder
    showSearch?: boolean
    targetUserId?: string
}

export function CvsPageView({
    initialCvs,
    isAdmin,
    search,
    limit = 10,
    sortBy,
    sortOrder = "asc",
    showSearch = true,
    targetUserId,
}: CvsPageViewProps) {
    const router = useRouter()
    const pathname = usePathname()
    const t = useTranslations("CV.list")
    const isSorted = sortBy === defaultCvSortField
    const sortHref = `${pathname}?${buildListSearchParams({
        page: 1,
        limit,
        search,
        sortBy: defaultCvSortField,
        sortOrder: nextSortOrder(sortBy, sortOrder, defaultCvSortField),
    })}`

    const {
        cvs,
        isCreateOpen,
        setIsCreateOpen,
        editingCv,
        setEditingCv,
        deletingCv,
        setDeletingCv,
        isSubmitting,
        error,
        handleCreate,
        handleUpdate,
        handleDelete,
    } = useCvsPage({ initialCvs, targetUserId })

    const handleView = useCallback(
        (id: string) => {
            router.push(`/cv/${id}`)
        },
        [router],
    )

    const handleEdit = useCallback(
        (cv: CvItem) => {
            setEditingCv(cv)
        },
        [setEditingCv],
    )

    const handleDeleteClick = useCallback(
        (cv: CvItem) => {
            setDeletingCv(cv)
        },
        [setDeletingCv],
    )

    const handleOpenCreate = useCallback(() => {
        setIsCreateOpen(true)
    }, [setIsCreateOpen])

    useHeaderToolbarAction(showSearch ? null : t("create"), handleOpenCreate)

    return (
        <div className="w-full space-y-6 px-5">
            {showSearch ? (
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <SearchInput limit={limit} search={search} />
                    <div className="sm:ml-auto">
                        <CreateCvTriggerButton onClick={handleOpenCreate} />
                    </div>
                </div>
            ) : null}

            <div className="w-full overflow-visible">
                <div className="grid grid-cols-[1fr_1fr_auto] lg:grid-cols-[35%_35%_25%_auto] items-center px-2 py-4 border-b border-border text-sm font-semibold text-muted-foreground">
                    <div
                        className="pr-2"
                        aria-sort={
                            isSorted
                                ? sortOrder === "desc"
                                    ? "descending"
                                    : "ascending"
                                : "none"
                        }
                    >
                        <Link
                            href={sortHref}
                            scroll={false}
                            className="inline-flex items-center gap-1.5 text-inherit no-underline hover:text-foreground"
                        >
                            {t("name")}
                            {isSorted ? (
                                <SortArrow descending={sortOrder === "desc"} />
                            ) : null}
                        </Link>
                    </div>
                    <div className="pr-2">{t("education")}</div>
                    <div className="hidden lg:block pr-2">{t("employee")}</div>
                    <div></div>
                </div>

                <div className="divide-y divide-border">
                    {cvs.length > 0 ? (
                        cvs.map((cv) => (
                            <CvListItem
                                key={cv.id}
                                cv={cv}
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                                t={t}
                            />
                        ))
                    ) : (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            {search || isAdmin ? t("noResults") : t("empty")}
                        </div>
                    )}
                </div>
            </div>

            <CreateCvModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreate={handleCreate}
                isSubmitting={isSubmitting}
                error={error}
            />

            <UpdateCvModal
                key={editingCv?.id ?? "closed"}
                isOpen={!!editingCv}
                onClose={() => setEditingCv(null)}
                cv={editingCv}
                onUpdate={handleUpdate}
                isSubmitting={isSubmitting}
                error={error}
            />

            <DeleteCvModal
                isOpen={!!deletingCv}
                onClose={() => setDeletingCv(null)}
                cvName={deletingCv?.name || ""}
                onConfirm={handleDelete}
                isDeleting={isSubmitting}
                error={error}
            />
        </div>
    )
}
