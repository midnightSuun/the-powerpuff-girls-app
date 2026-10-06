"use server"

import { getGql, GetProfileOptionsDocument } from "@/gql"

export async function getProfileOptions() {
    const gql = await getGql()
    const data = await gql.request(GetProfileOptionsDocument, {
        params: { limit: 100, page: 1 },
    })

    return {
        departments: data.departments.items,
        positions: data.positions.items,
    }
}
