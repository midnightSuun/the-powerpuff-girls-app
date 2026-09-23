import { cacheLife } from "next/cache"

import { getGql, GetUsersDocument } from "@/gql"

export async function getUsers(limit: number, page: number, search: string) {
    "use cache: private"
    cacheLife("hours")

    const gql = await getGql()
    const data = await gql.request(GetUsersDocument, {
        params: { limit, page, search },
    })

    return {
        users: data.users.items,
        totalPages: data.users.total_pages,
    }
}
