import { cacheLife } from "next/cache"

import { getGql, GetUserDocument } from "@/gql"

export async function getUser(userId: string) {
    "use cache: private"
    cacheLife("hours")
    const gql = await getGql()
    const data = await gql.request(GetUserDocument, { id: userId })

    return data.user
}
