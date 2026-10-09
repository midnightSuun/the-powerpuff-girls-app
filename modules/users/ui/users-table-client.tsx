"use client"

import { useTranslations } from "next-intl"
import { useCallback } from "react"

import { TableComponent } from "@/components/table"
import { buildListSearchParams } from "@/lib/list-search-params"
import { type SortOrder } from "@/lib/sort"

import { type getUsers } from "../api/get-users"
import { getUsersColumns } from "./users-columns"

export type UserItem = Awaited<ReturnType<typeof getUsers>>["users"][number]

interface UsersTableClientProps {
    users: UserItem[]
    isAdmin: boolean
    limit: number
    search: string
    sortBy?: string
    sortOrder?: SortOrder
    emptyMessage: string
}

export function UsersTableClient({
    users,
    isAdmin,
    limit,
    search,
    sortBy,
    sortOrder,
    emptyMessage,
}: UsersTableClientProps) {
    const t = useTranslations("Users.columns")

    const columns = getUsersColumns(t, isAdmin)

    const getSortHref = useCallback(
        (sortKey: string) => {
            const nextOrder =
                sortBy === sortKey && sortOrder === "asc" ? "desc" : "asc"

            return `/users?${buildListSearchParams({
                page: 1,
                limit,
                search,
                sortBy: sortKey,
                sortOrder: nextOrder,
            })}`
        },
        [limit, search, sortBy, sortOrder],
    )

    return (
        <TableComponent
            data={users}
            columns={columns}
            sortBy={sortBy}
            sortOrder={sortOrder}
            getSortHref={getSortHref}
            getRowHref={(user: UserItem) => `/users/${user.id}`}
            emptyMessage={emptyMessage}
        />
    )
}
