"use client"

import { MoreVertical } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"

import { useHeaderToolbarAction } from "@/components/header-toolbar-action"
import { Button } from "@/components/ui/button"
import { AddItemButton } from "@/components/ui/list-management-buttons"
import { sortByLocale, type SortOrder } from "@/lib/sort"

import { SearchInput } from "../search-input"
import { SortArrow } from "../sort-arrow"

export interface Column<T> {
    key: string
    label: string
    sortable?: boolean
    className?: string
    render?: (item: T) => React.ReactNode
}

interface AdminTableRowProps<T> {
    item: T
    columns: Column<T>[]
    isMenuOpen: boolean
    onToggleMenu: (id: string | number) => void
    onEditClick?: (item: T) => void
    onDeleteClick?: (item: T) => void
    menuRef?: React.RefObject<HTMLDivElement | null>
    editText: string
    deleteText: string
}

function AdminTableRowComponent<T extends { id: string | number }>({
    item,
    columns,
    isMenuOpen,
    onToggleMenu,
    onEditClick,
    onDeleteClick,
    menuRef,
    editText,
    deleteText,
}: AdminTableRowProps<T>) {
    return (
        <tr className="h-14 border-b border-[#AEAEAE] dark:border-[#383838] hover:bg-muted/10 transition-colors">
            {columns.map((col) => (
                <td
                    key={col.key}
                    className={`px-4 align-middle text-muted-foreground ${col.className ?? ""}`}
                >
                    {col.render
                        ? col.render(item)
                        : String(
                              (item as Record<string, unknown>)[col.key] ?? "",
                          )}
                </td>
            ))}
            {(onEditClick || onDeleteClick) && (
                <td className="px-4 text-right relative align-middle">
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-8 min-w-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => onToggleMenu(item.id)}
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>

                    {isMenuOpen && (
                        <div
                            ref={menuRef}
                            className="absolute right-4 top-10 z-50 w-32 border border-border bg-background p-1 shadow-md rounded-none text-left"
                        >
                            {onEditClick && (
                                <button
                                    type="button"
                                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                                    onClick={() => {
                                        onToggleMenu(item.id)
                                        onEditClick(item)
                                    }}
                                >
                                    {editText}
                                </button>
                            )}
                            {onDeleteClick && (
                                <button
                                    type="button"
                                    className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                    onClick={() => {
                                        onToggleMenu(item.id)
                                        onDeleteClick(item)
                                    }}
                                >
                                    {deleteText}
                                </button>
                            )}
                        </div>
                    )}
                </td>
            )}
        </tr>
    )
}

const AdminTableRow = memo(
    AdminTableRowComponent,
) as typeof AdminTableRowComponent

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
    showSearchInput?: boolean
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
    showSearchInput = true,
    defaultSortKey = "type",
}: AdminDataTableProps<T>) {
    const locale = useLocale()
    const tCommon = useTranslations("Admin.common")

    const [sortColumnKey, setSortColumnKey] = useState<string>(defaultSortKey)
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
    const [activeMenuId, setActiveMenuId] = useState<string | number | null>(
        null,
    )

    const menuRef = useRef<HTMLDivElement | null>(null)
    const headerActionLabel =
        !showSearchInput && createButtonLabel && onCreateClick
            ? createButtonLabel
            : null

    useHeaderToolbarAction(headerActionLabel, () => {
        onCreateClick?.()
    })

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
    const handleToggleMenu = useCallback((id: string | number) => {
        setActiveMenuId((prev) => (prev === id ? null : id))
    }, [])

    const processedData = useMemo(() => {
        let result = [...data]

        if (search.trim() && getSearchableString) {
            const query = search.toLowerCase()
            result = result.filter((item) =>
                getSearchableString(item).toLowerCase().includes(query),
            )
        }

        if (getSortValue) {
            result = sortByLocale(
                result,
                (item) => getSortValue(item, sortColumnKey),
                sortOrder,
                locale,
            )
        }

        return result
    }, [
        data,
        locale,
        search,
        sortColumnKey,
        sortOrder,
        getSearchableString,
        getSortValue,
    ])

    return (
        <div className="flex flex-col gap-4">
            {showSearchInput ? (
                <div className="flex items-center justify-between gap-4">
                    <SearchInput limit={limit} search={search} />
                    {createButtonLabel && onCreateClick ? (
                        <AddItemButton
                            label={createButtonLabel}
                            onClick={onCreateClick}
                            variant="primaryV2"
                            className="cursor-pointer text-[#d7352c] hover:text-[#b5332b] dark:text-[#f06b65] dark:hover:text-[#ff8a84] lg:h-auto! lg:min-w-40! lg:px-7.5! lg:py-4!"
                        />
                    ) : null}
                </div>
            ) : null}

            <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="h-12 border-b border-[#AEAEAE] dark:border-[#383838]">
                            {columns.map((col) => {
                                const isSorted = sortColumnKey === col.key
                                return (
                                    <th
                                        key={col.key}
                                        className={`px-4 font-medium text-foreground align-middle ${
                                            col.sortable
                                                ? "cursor-pointer select-none"
                                                : ""
                                        } ${col.className ?? ""}`}
                                        onClick={
                                            col.sortable
                                                ? () => handleSort(col.key)
                                                : undefined
                                        }
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {col.label}
                                            {col.sortable && (
                                                <span
                                                    className={
                                                        isSorted
                                                            ? "opacity-100"
                                                            : "opacity-30 group-hover:opacity-70 transition-opacity"
                                                    }
                                                >
                                                    <SortArrow
                                                        descending={
                                                            isSorted
                                                                ? sortOrder ===
                                                                  "desc"
                                                                : false
                                                        }
                                                    />
                                                </span>
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
                                <AdminTableRow
                                    key={item.id}
                                    item={item}
                                    columns={columns}
                                    isMenuOpen={activeMenuId === item.id}
                                    onToggleMenu={handleToggleMenu}
                                    onEditClick={onEditClick}
                                    onDeleteClick={onDeleteClick}
                                    menuRef={menuRef}
                                    editText={tCommon("edit")}
                                    deleteText={tCommon("delete")}
                                />
                            ))
                        ) : (
                            <tr className="h-14 border-b border-[#AEAEAE] dark:border-[#383838]">
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
