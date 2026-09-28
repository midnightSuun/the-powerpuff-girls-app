import { Suspense } from "react"
import { z } from "zod"

import { UsersPage } from "@/modules/users"

const searchParamsSchema = z.object({
    limit: z.coerce.number().min(1).optional().catch(10).default(10),
    page: z.coerce.number().min(1).optional().catch(1).default(1),
    search: z.string().optional().catch("").default(""),
})

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function UsersRoute({ searchParams }: Props) {
    const params = await searchParams
    const { limit, page, search } = searchParamsSchema.parse(params)

    return <UsersPage limit={limit} page={page} search={search} />
}

export default function Users({ searchParams }: Props) {
    return (
        <Suspense fallback={<p className="p-4">Loading users...</p>}>
            <UsersRoute searchParams={searchParams} />
        </Suspense>
    )
}
