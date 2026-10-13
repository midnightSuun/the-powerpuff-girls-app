import { Suspense } from "react"

import { parsePaginationSearchParams } from "@/lib/pagination-search-params"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"
import { CreateUserDialog, UsersPage, UsersTableFrame } from "@/modules/users"

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

const UsersAdminAction = async () => {
    const session = await getCurrentSession()
    if (session?.role !== "Admin") return null

    return <CreateUserDialog />
}

const UsersContent = async ({
    searchParams,
}: {
    searchParams: Props["searchParams"]
}) => {
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
    return (
        <>
            <Suspense fallback={null}>
                <UsersAdminAction />
            </Suspense>
            <UsersTableFrame>
                <UsersContent searchParams={searchParams} />
            </UsersTableFrame>
        </>
    )
}
