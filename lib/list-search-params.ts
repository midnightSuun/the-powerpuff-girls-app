import { type SortOrder } from "@/lib/sort"

type ListQuery = {
    page: number
    limit: number
    search: string
    sortBy?: string
    sortOrder?: SortOrder
}

type RawSearchParam = string | string[] | null | undefined

export const readListSearch = (search: RawSearchParam) => {
    const value = Array.isArray(search) ? search[0] : search

    return value?.trim() ?? ""
}

export const buildListSearchParams = ({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
}: ListQuery) => {
    const params = new URLSearchParams()

    const normalizedSearch = search.trim()

    params.set("page", String(page))
    params.set("limit", String(limit))

    if (normalizedSearch) {
        params.set("search", normalizedSearch)
    }

    if (sortBy) {
        params.set("sortBy", sortBy)
        params.set("sortOrder", sortOrder ?? "asc")
    }

    return params.toString()
}
