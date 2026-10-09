import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import { PaginationComponent } from "@/components/pagination"
import { type PaginationSearchParams } from "@/lib/pagination-search-params"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import { getUsers } from "../../../api/get-users"
import { UsersTableClient } from "./users-table-client"

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
    const [locale, tUsers] = await Promise.all([
        getLocale(),
        getTranslations("Users"),
    ])

    const { users, totalPages } = await getUsers(
        limit,
        page,
        search,
        sortBy,
        sortOrder,
        locale,
    )

    return (
        <>
            <UsersTableClient
                users={users}
                isAdmin={isAdmin}
                limit={limit}
                search={search}
                sortBy={sortBy}
                sortOrder={sortOrder}
                emptyMessage={tUsers("noResults")}
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
