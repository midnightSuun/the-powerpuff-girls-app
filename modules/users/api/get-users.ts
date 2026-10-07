import { cacheLife, cacheTag } from "next/cache"

import { getGql, GetUsersDocument } from "@/gql"
import { type SortOrder } from "@/lib/sort"
import { type UserSortField } from "@/lib/user-sort"

export async function getUsers(
    limit: number,
    page: number,
    search: string,
    sortBy: UserSortField | undefined,
    sortOrder: SortOrder,
) {
    "use cache: private"
    cacheLife("hours")
    cacheTag("users")

    const gql = await getGql()
    const data = await gql.request(GetUsersDocument, {
        params: {
            limit,
            page,
            search,
            sort_by: sortBy,
            sort_order: sortBy ? sortOrder : undefined,
        },
    })

    return {
        users: data.users.items,
        totalPages: data.users.total_pages,
    }
}
