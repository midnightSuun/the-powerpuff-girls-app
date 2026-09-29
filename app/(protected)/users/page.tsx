import { Suspense } from "react"

import { parsePaginationSearchParams } from "@/lib/pagination-search-params"
import { UsersPage } from "@/modules/users"

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function UsersRoute({ searchParams }: Props) {
    const params = await searchParams
    const { limit, page, search } = parsePaginationSearchParams(params)

    return <UsersPage limit={limit} page={page} search={search} />
}

export default function Users({ searchParams }: Props) {
    return (
        <Suspense fallback={<p className="p-4">Loading users...</p>}>
            <UsersRoute searchParams={searchParams} />
        </Suspense>
    )
}
