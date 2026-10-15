"use client"

import { MoreVertical } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import {
    memo,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react"

import { useHeaderToolbarAction } from "@/components/header-toolbar-action"
import { Button } from "@/components/ui/button"
import { AddItemButton } from "@/components/ui/list-management-buttons"
import { useColumnSort } from "@/hooks/use-column-sort"
import { sortByLocale } from "@/lib/sort"

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

function areRowPropsEqual<T extends { id: string | number }>(
    prev: AdminTableRowProps<T>,
    next: AdminTableRowProps<T>,
): boolean {
    if (prev.isMenuOpen !== next.isMenuOpen) return false
    if (prev.editText !== next.editText) return false
    if (prev.deleteText !== next.deleteText) return false
    if (JSON.stringify(prev.item) !== JSON.stringify(next.item)) return false
    return true
}

const AdminTableRow = memo(
    AdminTableRowComponent,
    areRowPropsEqual,
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

function AdminDataTableInner<T extends { id: string | number }>({
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
    defaultSortKey = "name",
}: AdminDataTableProps<T>) {
    const locale = useLocale()
    const tCommon = useTranslations("Admin.common")

    const {
        sortBy: sortColumnKey,
        sortOrder,
        toggleSort,
    } = useColumnSort(defaultSortKey)
    const [activeMenuId, setActiveMenuId] = useState<string | number | null>(
        null,
    )

    const menuRef = useRef<HTMLDivElement | null>(null)
    const headerActionLabel =
        !showSearchInput && createButtonLabel && onCreateClick
            ? createButtonLabel
            : null

    const callbacksRef = useRef({ onCreateClick, onEditClick, onDeleteClick })
    useLayoutEffect(() => {
        callbacksRef.current = { onCreateClick, onEditClick, onDeleteClick }
    })

    const stableOnCreate = useCallback(
        () => callbacksRef.current.onCreateClick?.(),
        [],
    )
    const stableOnEdit = useCallback(
        (item: T) => callbacksRef.current.onEditClick?.(item),
        [],
    )
    const stableOnDelete = useCallback(
        (item: T) => callbacksRef.current.onDeleteClick?.(item),
        [],
    )

    useHeaderToolbarAction(headerActionLabel, stableOnCreate)

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
                            onClick={stableOnCreate}
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
                                        className={`px-4 font-medium text-foreground align-middle ${col.className ?? ""}`}
                                    >
                                        {col.sortable ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleSort(col.key)
                                                }
                                                className="inline-flex w-fit items-center gap-1.5 bg-transparent p-0"
                                            >
                                                {col.label}
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
                                            </button>
                                        ) : (
                                            col.label
                                        )}
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
                                    onEditClick={stableOnEdit}
                                    onDeleteClick={stableOnDelete}
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

function areTablePropsEqual<T extends { id: string | number }>(
    prev: AdminDataTableProps<T>,
    next: AdminDataTableProps<T>,
) {
    if (prev.search !== next.search) return false
    if (prev.showSearchInput !== next.showSearchInput) return false
    if (prev.createButtonLabel !== next.createButtonLabel) return false
    if (prev.emptyMessage !== next.emptyMessage) return false

    if (JSON.stringify(prev.data) !== JSON.stringify(next.data)) return false

    if (
        JSON.stringify(prev.columns.map((c) => c.key)) !==
        JSON.stringify(next.columns.map((c) => c.key))
    )
        return false

    return true
}

export const AdminDataTable = memo(
    AdminDataTableInner,
    areTablePropsEqual,
) as typeof AdminDataTableInner
