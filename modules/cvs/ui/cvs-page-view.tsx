"use client"

import { ArrowUpDown, MoreVertical } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { memo, useCallback } from "react"

import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"

import { useCvsPage } from "../hooks/use-cvs-page"
import { CvItem } from "../types"
import { CreateCvTriggerButton } from "./components/add-cv-button"
import { CreateCvModal } from "./components/create-cv-modal"
import { DeleteCvModal } from "./components/delete-cv-modal"
import { UpdateCvModal } from "./components/update-cv-modal"

interface CvListItemProps {
    cv: CvItem
    isActiveMenu: boolean
    onToggleMenu: (id: string) => void
    onView: (id: string) => void
    onEdit: (cv: CvItem) => void
    onDelete: (cv: CvItem) => void
    t: (key: string) => string
}
const CvListItem = memo(function CvListItem({
    cv,
    isActiveMenu,
    onToggleMenu,
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
                    <Button
                        variant="ghost"
                        size="icon"
                        className="min-w-0! p-0! rounded-md! border-transparent! hover:border-transparent! text-muted-foreground hover:text-foreground shrink-0"
                        onClick={() => onToggleMenu(cv.id)}
                    >
                        <MoreVertical className="size-4" />
                    </Button>

                    {isActiveMenu && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-popover border border-border shadow-md rounded-none z-50 py-1 text-sm">
                            <button
                                className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                                onClick={() => onView(cv.id)}
                            >
                                {t("view")}
                            </button>
                            <button
                                className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                                onClick={() => onEdit(cv)}
                            >
                                {t("edit")}
                            </button>
                            <button
                                className="w-full text-left px-4 py-2 text-destructive hover:bg-destructive/10"
                                onClick={() => onDelete(cv)}
                            >
                                {t("delete")}
                            </button>
                        </div>
                    )}
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
    limit: number
    targetUserId?: string
}

export function CvsPageView({
    initialCvs,
    isAdmin,
    search,
    limit,
    targetUserId,
}: CvsPageViewProps) {
    const router = useRouter()
    const t = useTranslations("CV.list")

    const {
        sortedCvs,
        toggleSort,
        isCreateOpen,
        setIsCreateOpen,
        editingCv,
        setEditingCv,
        deletingCv,
        setDeletingCv,
        activeMenuId,
        setActiveMenuId,
        isSubmitting,
        error,
        handleCreate,
        handleUpdate,
        handleDelete,
    } = useCvsPage({ initialCvs, targetUserId })

    const handleToggleMenu = useCallback(
        (id: string) => {
            setActiveMenuId(activeMenuId === id ? null : id)
        },
        [activeMenuId, setActiveMenuId],
    )

    const handleView = useCallback(
        (id: string) => {
            setActiveMenuId(null)
            router.push(`/cv/${id}`)
        },
        [router, setActiveMenuId],
    )

    const handleEdit = useCallback(
        (cv: CvItem) => {
            setActiveMenuId(null)
            setEditingCv(cv)
        },
        [setActiveMenuId, setEditingCv],
    )

    const handleDeleteClick = useCallback(
        (cv: CvItem) => {
            setActiveMenuId(null)
            setDeletingCv(cv)
        },
        [setActiveMenuId, setDeletingCv],
    )

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <SearchInput limit={limit} search={search} />
                <CreateCvTriggerButton onClick={() => setIsCreateOpen(true)} />
            </div>

            <div className="w-full overflow-visible">
                <div className="grid grid-cols-[1fr_1fr_auto] lg:grid-cols-[35%_35%_25%_auto] items-center px-2 py-4 border-b border-border text-sm font-semibold text-muted-foreground">
                    <div
                        className="flex items-center gap-1.5 cursor-pointer hover:text-foreground select-none pr-2"
                        onClick={toggleSort}
                    >
                        {t("name")}
                        <ArrowUpDown className="size-3 shrink-0" />
                    </div>
                    <div className="pr-2">{t("education")}</div>
                    <div className="hidden lg:block pr-2">{t("employee")}</div>
                    <div></div>
                </div>

                <div className="divide-y divide-border">
                    {sortedCvs.length > 0 ? (
                        sortedCvs.map((cv) => (
                            <CvListItem
                                key={cv.id}
                                cv={cv}
                                isActiveMenu={activeMenuId === cv.id}
                                onToggleMenu={handleToggleMenu}
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                                t={t}
                            />
                        ))
                    ) : (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            {search
                                ? t("noResults")
                                : isAdmin
                                  ? t("noResults")
                                  : t("empty")}
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
