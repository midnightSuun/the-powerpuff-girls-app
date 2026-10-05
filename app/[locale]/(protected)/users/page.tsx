import { Suspense } from "react"

import { LoadingText } from "@/components/loading-text"
import { parsePaginationSearchParams } from "@/lib/pagination-search-params"
import { UsersPage } from "@/modules/users"

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

export default function UsersRoute({ searchParams }: Props) {
    return (
        <Suspense
            fallback={
                <p className="p-4 text-muted-foreground">
                    <LoadingText namespace="Users" />
                </p>
            }
        >
            <UsersContent searchParams={searchParams} />
        </Suspense>
    )
}
