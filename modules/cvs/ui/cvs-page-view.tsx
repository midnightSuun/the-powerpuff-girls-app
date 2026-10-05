"use client"

import { ArrowUpDown, MoreVertical } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import React, { useState } from "react"

import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"

import { createCvAction } from "../api/create-cv"
import { deleteCvAction } from "../api/delete-cv"
import { updateCvAction } from "../api/update-cv"
import { CvItem } from "../types"
import { CreateCvTriggerButton } from "./components/add-cv-button"
import { CreateCvModal } from "./components/create-cv-modal"
import { DeleteCvModal } from "./components/delete-cv-modal"
import { UpdateCvModal } from "./components/update-cv-modal"

interface CvsPageViewProps {
    initialCvs: CvItem[]
    isAdmin: boolean
    search: string
    limit: number
}

export function CvsPageView({
    initialCvs,
    isAdmin,
    search,
    limit,
}: CvsPageViewProps) {
    const router = useRouter()
    const t = useTranslations("CV.list")
    const [cvs, setCvs] = useState<CvItem[]>(initialCvs)
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingCv, setEditingCv] = useState<CvItem | null>(null)
    const [deletingCv, setDeletingCv] = useState<CvItem | null>(null)
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const sortedCvs = [...cvs].sort((a, b) => {
        if (sortOrder === "asc") {
            return a.name.localeCompare(b.name)
        }
        return b.name.localeCompare(a.name)
    })

    const toggleSort = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    }

    const handleCreate = async (data: {
        name: string
        education: string
        description: string
    }) => {
        try {
            setIsSubmitting(true)
            setError(null)

            const result = await createCvAction({
                name: data.name,
                education: data.education,
                description: data.description,
            })

            if (result?.error) {
                console.error("Failed to create CV:", result.error)
                setError(t("createError"))
                return
            }

            setIsCreateOpen(false)
            router.refresh()
        } catch {
            setError(t("createError"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (data: {
        name: string
        education: string
        description: string
    }) => {
        if (!editingCv) return
        try {
            setIsSubmitting(true)
            setError(null)
            const result = await updateCvAction({
                cvId: editingCv.id,
                ...data,
            })

            if (result.error) {
                console.error("Failed to update CV:", result.error)
                setError(t("updateError"))
                return
            }

            setCvs(
                cvs.map((cv) =>
                    cv.id === editingCv.id ? { ...cv, ...data } : cv,
                ),
            )
            setEditingCv(null)
            router.refresh()
        } catch {
            setError(t("updateError"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingCv) return
        try {
            setIsSubmitting(true)
            setError(null)
            const result = await deleteCvAction(deletingCv.id)

            if (result.error) {
                console.error("Failed to delete CV:", result.error)
                setError(t("deleteError"))
                return
            }

            setCvs(cvs.filter((cv) => cv.id !== deletingCv.id))
            setDeletingCv(null)
            router.refresh()
        } catch {
            setError(t("deleteError"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <SearchInput limit={limit} search={search} />
                <CreateCvTriggerButton onClick={() => setIsCreateOpen(true)} />
            </div>

            <div className="w-full overflow-visible">
                <div className="grid grid-cols-[35%_35%_25%_5%] items-center px-2 py-4 border-b border-border text-xs font-semibold text-muted-foreground">
                    <div
                        className="flex items-center gap-1.5 cursor-pointer hover:text-foreground select-none"
                        onClick={toggleSort}
                    >
                        {t("name")}
                        <ArrowUpDown className="size-3" />
                    </div>
                    <div>{t("education")}</div>
                    <div>{t("employee")}</div>
                    <div></div>
                </div>

                <div className="divide-y divide-border">
                    {sortedCvs.length > 0 ? (
                        sortedCvs.map((cv) => (
                            <div
                                key={cv.id}
                                className="group hover:bg-muted/30 transition-colors px-2 py-4 space-y-2"
                            >
                                <div className="grid grid-cols-[35%_35%_25%_5%] items-center">
                                    <div className="text-sm font-medium text-foreground truncate pr-2">
                                        {cv.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground truncate pr-2">
                                        {cv.education}
                                    </div>
                                    <div className="text-sm text-muted-foreground truncate pr-2">
                                        {cv.user?.email || "—"}
                                    </div>
                                    <div className="text-right relative">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            onClick={() =>
                                                setActiveMenuId(
                                                    activeMenuId === cv.id
                                                        ? null
                                                        : cv.id,
                                                )
                                            }
                                        >
                                            <MoreVertical className="size-4" />
                                        </Button>

                                        {activeMenuId === cv.id && (
                                            <div className="absolute right-0 mt-2 w-36 bg-popover border border-border shadow-md rounded-none z-50 py-1 text-sm">
                                                <button
                                                    className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                                                    onClick={() => {
                                                        setActiveMenuId(null)
                                                        router.push(
                                                            `/cv/${cv.id}`,
                                                        )
                                                    }}
                                                >
                                                    {t("view")}
                                                </button>
                                                <button
                                                    className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                                                    onClick={() => {
                                                        setActiveMenuId(null)
                                                        setEditingCv(cv)
                                                    }}
                                                >
                                                    {t("edit")}
                                                </button>
                                                <button
                                                    className="w-full text-left px-4 py-2 text-destructive hover:bg-destructive/10"
                                                    onClick={() => {
                                                        setActiveMenuId(null)
                                                        setDeletingCv(cv)
                                                    }}
                                                >
                                                    {t("delete")}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {cv.description && (
                                    <div className="text-sm text-muted-foreground leading-relaxed pt-1">
                                        {cv.description}
                                    </div>
                                )}
                            </div>
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
