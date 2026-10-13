import { cacheLife, cacheTag } from "next/cache"

import { getGql, GetUserDocument } from "@/gql"

export async function getUser(userId: string) {
    "use cache: private"
    cacheLife("hours")
    cacheTag(`user-${userId}`)
    const gql = await getGql()
    const data = await gql.request(GetUserDocument, { id: userId })

    return data.user
}
