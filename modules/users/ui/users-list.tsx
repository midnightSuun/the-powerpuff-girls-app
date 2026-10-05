import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import { PaginationComponent } from "@/components/pagination"
import { TableComponent } from "@/components/table"
import { buildListSearchParams } from "@/lib/list-search-params"
import { type PaginationSearchParams } from "@/lib/pagination-search-params"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import { getUsers } from "../api/get-users"
import { getUsersColumns } from "./users-columns"

type Props = PaginationSearchParams

export async function UsersList({
    limit,
    page,
    search,
    sortBy,
    sortOrder,
}: Props) {
    const session = await getCurrentSession()

    if (!session) {
        redirect("/login")
    }

    const isAdmin = session.role === "Admin"
    const t = await getTranslations("Users.columns")
    const locale = await getLocale()
    const { users, totalPages } = await getUsers(
        limit,
        page,
        search,
        sortBy,
        sortOrder,
        locale,
    )
    const columns = getUsersColumns(t, isAdmin)
    const getSortHref = (sortKey: string) => {
        const nextOrder =
            sortBy === sortKey && sortOrder === "asc" ? "desc" : "asc"

        return `/users?${buildListSearchParams({
            page: 1,
            limit,
            search,
            sortBy: sortKey,
            sortOrder: nextOrder,
        })}`
    }

    return (
        <>
            <TableComponent
                data={users}
                columns={columns}
                sortBy={sortBy}
                sortOrder={sortOrder}
                getSortHref={getSortHref}
                getRowHref={(user) => `/users/${user.id}`}
            />
            <PaginationComponent
                totalPages={totalPages}
                page={page}
                limit={limit}
                search={search}
                sortBy={sortBy}
                sortOrder={sortOrder}
                path="users"
            />
        </>
    )
}
