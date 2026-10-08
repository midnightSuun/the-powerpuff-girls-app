"use client"

import { useTranslations } from "next-intl"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const columns = [
    { id: "avatar", label: "", className: undefined },
    { id: "firstName", labelKey: "firstName", className: undefined },
    { id: "lastName", labelKey: "lastName", className: undefined },
    { id: "email", labelKey: "email", className: "hidden lg:table-cell" },
    { id: "department", labelKey: "department", className: undefined },
    {
        id: "position",
        labelKey: "position",
        className: "hidden lg:table-cell",
    },
    { id: "open", label: "", className: undefined },
] as const

export const UsersTableSkeleton = () => {
    const t = useTranslations("Users.columns")

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {columns.map((column) => (
                        <TableHead key={column.id} className={column.className}>
                            {"labelKey" in column ? t(column.labelKey) : ""}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={columns.length} className="h-32" />
                </TableRow>
            </TableBody>
        </Table>
    )
}
