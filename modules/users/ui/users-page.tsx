import { type PaginationSearchParams } from "@/lib/pagination-search-params"

import { UsersList } from "./components/list/users-list"

type Props = PaginationSearchParams

export function UsersPage({ limit, page, search, sortBy, sortOrder }: Props) {
    return (
        <UsersList
            limit={limit}
            page={page}
            search={search}
            sortBy={sortBy}
            sortOrder={sortOrder}
        />
    )
}
