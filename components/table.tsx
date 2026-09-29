import Link from "next/link"
import type { ReactNode } from "react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export type TableColumn<T> = {
    label: string
    render: (data: T) => ReactNode
}

type Props<T> = {
    data: T[]
    columns: TableColumn<T>[]
    getRowHref?: (item: T) => string
    getRowLabel?: (item: T) => string
}

export const TableComponent = <T,>(props: Props<T>) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {props.columns.map((column) => (
                        <TableHead key={column.label}>{column.label}</TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
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
                                <TableCell key={column.label}>
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
