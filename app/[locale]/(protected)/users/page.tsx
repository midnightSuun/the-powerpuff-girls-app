import { parsePaginationSearchParams } from "@/lib/pagination-search-params"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"
import { CreateUserDialog, UsersPage, UsersTableFrame } from "@/modules/users"

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function UsersContent({
    searchParams,
}: {
    searchParams: Props["searchParams"]
}) {
    const resolvedSearchParams = await searchParams
    const { limit, page, search, sortBy, sortOrder } =
        parsePaginationSearchParams(resolvedSearchParams)

    return (
        <UsersPage
            limit={limit}
            page={page}
            search={search}
            sortBy={sortBy}
            sortOrder={sortOrder}
        />
    )
}

export default async function UsersRoute({ searchParams }: Props) {
    const session = await getCurrentSession()

    return (
        <>
            {session?.role === "Admin" ? <CreateUserDialog /> : null}
            <UsersTableFrame>
                <UsersContent searchParams={searchParams} />
            </UsersTableFrame>
        </>
    )
}
