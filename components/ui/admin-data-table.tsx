"use client"

import { ArrowUpDown, MoreVertical, Plus, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface Column<T> {
    key: string
    label: string
    sortable?: boolean
    render?: (item: T) => React.ReactNode
}

interface AdminDataTableProps<T> {
    data: T[]
    columns: Column<T>[]
    searchPlaceholder?: string
    createButtonLabel?: string
    onCreateClick?: () => void
    onEditClick?: (item: T) => void
    onDeleteClick?: (item: T) => void
    getSearchableString?: (item: T) => string
    getSortValue?: (item: T) => string
    emptyMessage?: string
}

export function AdminDataTable<T extends { id: string | number }>({
    data,
    columns,
    searchPlaceholder,
    createButtonLabel,
    onCreateClick,
    onEditClick,
    onDeleteClick,
    getSearchableString,
    getSortValue,
    emptyMessage = "No items found",
}: AdminDataTableProps<T>) {
    const tCommon = useTranslations("Admin.common")

    const [searchQuery, setSearchQuery] = useState("")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
    const [activeMenuId, setActiveMenuId] = useState<string | number | null>(
        null,
    )

    const menuRef = useRef<HTMLDivElement | null>(null)

    const effectiveSearchPlaceholder = searchPlaceholder ?? tCommon("search")

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                setActiveMenuId(null)
            }
        }
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setActiveMenuId(null)
        }

        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleKeyDown)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [])

    const processedData = useMemo(() => {
        let result = [...data]

        if (searchQuery.trim() && getSearchableString) {
            const query = searchQuery.toLowerCase()
            result = result.filter((item) =>
                getSearchableString(item).toLowerCase().includes(query),
            )
        }

        if (getSortValue) {
            result.sort((a, b) => {
                const valA = getSortValue(a)
                const valB = getSortValue(b)
                return sortOrder === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA)
            })
        }

        return result
    }, [data, searchQuery, sortOrder, getSearchableString, getSortValue])

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <Input
                        placeholder={effectiveSearchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 w-full rounded-full border border-[#B8B8B8] dark:border-auth-card-border bg-transparent dark:bg-[#333333] pl-10 pr-4 text-sm text-foreground placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary transition-all outline-none"
                    />
                </div>

                {createButtonLabel && onCreateClick && (
                    <Button
                        type="button"
                        variant="primaryV2"
                        onClick={onCreateClick}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {createButtonLabel}
                    </Button>
                )}
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="h-[73px] border-b border-[#AEAEAE] dark:border-gray-700">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`px-4 font-medium text-foreground align-middle ${
                                        col.sortable
                                            ? "cursor-pointer select-none"
                                            : ""
                                    }`}
                                    onClick={
                                        col.sortable
                                            ? () =>
                                                  setSortOrder(
                                                      sortOrder === "asc"
                                                          ? "desc"
                                                          : "asc",
                                                  )
                                            : undefined
                                    }
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {col.sortable && (
                                            <ArrowUpDown className="h-3 w-3" />
                                        )}
                                    </div>
                                </th>
                            ))}
                            {(onEditClick || onDeleteClick) && (
                                <th className="px-4 w-10 align-middle"></th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {processedData.length > 0 ? (
                            processedData.map((item) => (
                                <tr
                                    key={item.id}
                                    className="h-[73px] border-b border-[#AEAEAE] dark:border-gray-700 hover:bg-muted/30 transition-colors"
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className="px-4 align-middle"
                                        >
                                            {col.render
                                                ? col.render(item)
                                                : String(
                                                      (
                                                          item as Record<
                                                              string,
                                                              unknown
                                                          >
                                                      )[col.key] ?? "",
                                                  )}
                                        </td>
                                    ))}
                                    {(onEditClick || onDeleteClick) && (
                                        <td className="px-4 text-right relative align-middle">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={() =>
                                                    setActiveMenuId(
                                                        activeMenuId === item.id
                                                            ? null
                                                            : item.id,
                                                    )
                                                }
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>

                                            {activeMenuId === item.id && (
                                                <div
                                                    ref={menuRef}
                                                    className="absolute right-4 top-10 z-50 w-32 border border-border bg-background p-1 shadow-md rounded-none text-left"
                                                >
                                                    {onEditClick && (
                                                        <button
                                                            type="button"
                                                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                                                            onClick={() => {
                                                                setActiveMenuId(
                                                                    null,
                                                                )
                                                                onEditClick(
                                                                    item,
                                                                )
                                                            }}
                                                        >
                                                            {tCommon("edit")}
                                                        </button>
                                                    )}
                                                    {onDeleteClick && (
                                                        <button
                                                            type="button"
                                                            className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                                            onClick={() => {
                                                                setActiveMenuId(
                                                                    null,
                                                                )
                                                                onDeleteClick(
                                                                    item,
                                                                )
                                                            }}
                                                        >
                                                            {tCommon("delete")}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr className="h-[73px] border-b border-[#AEAEAE] dark:border-gray-700">
                                <td
                                    colSpan={
                                        columns.length +
                                        (onEditClick || onDeleteClick ? 1 : 0)
                                    }
                                    className="px-4 text-center text-muted-foreground align-middle"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
