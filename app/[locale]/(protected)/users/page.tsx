import { Suspense } from "react"

import { parsePaginationSearchParams } from "@/lib/pagination-search-params"
import { UsersPage } from "@/modules/users"

type Props = {
    params: Promise<{ locale: string }>
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function UsersContent({
    searchParams,
}: {
    searchParams: Props["searchParams"]
}) {
    const resolvedSearchParams = await searchParams
    const { limit, page, search } =
        parsePaginationSearchParams(resolvedSearchParams)

    return <UsersPage limit={limit} page={page} search={search} />
}

export default async function UsersRoute({ params, searchParams }: Props) {
    await params

    return (
        <Suspense
            fallback={
                <p className="p-4 text-muted-foreground">Loading users...</p>
            }
        >
            <UsersContent searchParams={searchParams} />
        </Suspense>
    )
}
