import { cacheLife } from "next/cache"

import { getGql } from "@/gql"
import { GetUserSkillsDocument } from "@/gql/generated/graphql"

export async function getUserSkills(userId: string) {
    "use cache: private"
    cacheLife("hours")
    const gql = await getGql()
    const data = await gql.request(GetUserSkillsDocument, {
        userId,
    })
    return data.profile.skills
}
