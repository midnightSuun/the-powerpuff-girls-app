import type { ReactNode } from "react"

import { SortArrow } from "@/components/sort-arrow"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Link } from "@/i18n/navigation"
import { type SortOrder } from "@/lib/sort"

export type TableColumn<T> = {
    id: string
    label: string
    className?: string
    sortKey?: string
    sortLabel?: string
    render: (data: T) => ReactNode
}

type Props<T> = {
    data: T[]
    columns: TableColumn<T>[]
    getRowHref?: (item: T) => string
    getRowLabel?: (item: T) => string
    sortBy?: string
    sortOrder?: SortOrder
    getSortHref?: (sortKey: string) => string
    emptyMessage?: string
}

export const TableComponent = <T,>(props: Props<T>) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {props.columns.map((column) => {
                        const isSorted = Boolean(
                            column.sortKey && column.sortKey === props.sortBy,
                        )
                        const href =
                            column.sortKey && props.getSortHref
                                ? props.getSortHref(column.sortKey)
                                : undefined
                        const ariaSort = !column.sortKey
                            ? undefined
                            : isSorted
                              ? props.sortOrder === "desc"
                                  ? "descending"
                                  : "ascending"
                              : "none"

                        return (
                            <TableHead
                                key={column.id}
                                aria-sort={ariaSort}
                                className={column.className}
                            >
                                {href ? (
                                    <Link
                                        href={href}
                                        scroll={false}
                                        aria-label={
                                            column.sortLabel ?? column.label
                                        }
                                        className="inline-flex items-center gap-1"
                                    >
                                        {column.label}
                                        {isSorted ? (
                                            <SortArrow
                                                descending={
                                                    props.sortOrder === "desc"
                                                }
                                            />
                                        ) : null}
                                    </Link>
                                ) : (
                                    column.label
                                )}
                            </TableHead>
                        )
                    })}
                </TableRow>
            </TableHeader>
            <TableBody>
                {props.data.length === 0 && props.emptyMessage ? (
                    <TableRow className="hover:bg-transparent">
                        <TableCell
                            colSpan={props.columns.length}
                            className="h-14 text-center text-[#626262] dark:text-[#aeaeae]"
                        >
                            {props.emptyMessage}
                        </TableCell>
                    </TableRow>
                ) : null}
                {props.data.map((item, index) => {
                    const href = props.getRowHref?.(item)
                    const label = props.getRowLabel?.(item)

                    return (
                        <TableRow
                            key={index}
                            className={
                                href ? "relative cursor-pointer" : undefined
                            }
                        >
                            {props.columns.map((column, columnIndex) => (
                                <TableCell
                                    key={column.id}
                                    className={column.className}
                                >
                                    {href && columnIndex === 0 ? (
                                        <Link
                                            href={href}
                                            aria-label={label}
                                            className="after:absolute after:inset-0 after:z-10 after:content-['']"
                                        >
                                            {column.render(item)}
                                        </Link>
                                    ) : (
                                        column.render(item)
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}
