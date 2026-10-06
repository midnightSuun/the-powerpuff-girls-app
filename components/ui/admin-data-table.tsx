"use client"

import { MoreVertical, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"

import { SearchInput } from "../search-input"
import { SortArrow } from "../sort-arrow"

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
    getSortValue?: (item: T, key?: string) => string
    emptyMessage?: string
    limit?: number
    search?: string
    createButtonClassName?: string
    defaultSortKey?: string
}

export function AdminDataTable<T extends { id: string | number }>({
    data,
    columns,
    createButtonLabel,
    onCreateClick,
    onEditClick,
    onDeleteClick,
    getSearchableString,
    getSortValue,
    emptyMessage = "No items found",
    limit = 10,
    search = "",
    defaultSortKey = "type",
}: AdminDataTableProps<T>) {
    const tCommon = useTranslations("Admin.common")

    const [sortColumnKey, setSortColumnKey] = useState<string>(defaultSortKey)
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
    const [activeMenuId, setActiveMenuId] = useState<string | number | null>(
        null,
    )

    const menuRef = useRef<HTMLDivElement | null>(null)

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

    const handleSort = (key: string) => {
        if (sortColumnKey === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortColumnKey(key)
            setSortOrder("asc")
        }
    }

    const processedData = useMemo(() => {
        let result = [...data]

        if (search.trim() && getSearchableString) {
            const query = search.toLowerCase()
            result = result.filter((item) =>
                getSearchableString(item).toLowerCase().includes(query),
            )
        }

        if (getSortValue) {
            result.sort((a, b) => {
                const valA = getSortValue(a, sortColumnKey)
                const valB = getSortValue(b, sortColumnKey)
                return sortOrder === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA)
            })
        }

        return result
    }, [
        data,
        search,
        sortColumnKey,
        sortOrder,
        getSearchableString,
        getSortValue,
    ])

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
                <SearchInput limit={limit} search={search} />

                {createButtonLabel && onCreateClick && (
                    <Button
                        type="button"
                        variant="primaryV2"
                        onClick={onCreateClick}
                        className="flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        {createButtonLabel}
                    </Button>
                )}
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="h-12 border-b border-[#383838]">
                            {columns.map((col) => {
                                const isSorted = sortColumnKey === col.key
                                return (
                                    <th
                                        key={col.key}
                                        className={`px-4 font-semibold text-foreground align-middle ${
                                            col.sortable
                                                ? "cursor-pointer select-none"
                                                : ""
                                        }`}
                                        onClick={
                                            col.sortable
                                                ? () => handleSort(col.key)
                                                : undefined
                                        }
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {col.label}
                                            {col.sortable && isSorted && (
                                                <SortArrow
                                                    descending={
                                                        sortOrder === "desc"
                                                    }
                                                />
                                            )}
                                        </div>
                                    </th>
                                )
                            })}
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
                                    className="h-14 border-b border-[#383838] hover:bg-muted/10 transition-colors"
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className="px-4 align-middle text-muted-foreground"
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
                                                className="h-8 min-w-8 p-0 text-muted-foreground hover:text-foreground"
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
                            <tr className="h-14 border-b border-[#383838]">
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
