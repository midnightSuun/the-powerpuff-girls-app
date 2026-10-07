import { type SortOrder } from "@/lib/sort"

type ListQuery = {
    page: number
    limit: number
    search: string
    sortBy?: string
    sortOrder?: SortOrder
}

export const buildListSearchParams = ({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
}: ListQuery) => {
    const params = new URLSearchParams()

    params.set("page", String(page))
    params.set("limit", String(limit))
    params.set("search", search)

    if (sortBy) {
        params.set("sortBy", sortBy)
        params.set("sortOrder", sortOrder ?? "asc")
    }

    return params.toString()
}
