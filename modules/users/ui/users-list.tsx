import { getTranslations } from "next-intl/server"

import { PaginationComponent } from "@/components/pagination"
import { TableComponent } from "@/components/table"
import { type PaginationSearchParams } from "@/lib/pagination-search-params"

import { getUsers } from "../api/get-users"
import { getUsersColumns } from "./users-columns"

type Props = PaginationSearchParams

export async function UsersList({ limit, page, search }: Props) {
    const t = await getTranslations("Users.columns")
    const { users, totalPages } = await getUsers(limit, page, search)
    const columns = getUsersColumns(t)

    return (
        <>
            <TableComponent
                data={users}
                columns={columns}
                getRowHref={(user) => `/users/${user.id}`}
            />
            <PaginationComponent
                totalPages={totalPages}
                page={page}
                limit={limit}
                search={search}
                path="users"
            />
        </>
    )
}
