import { GraphQLClient } from "graphql-request"
import { cookies, headers } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/modules/auth/consts"

export async function getRequestOrigin() {
    const headersList = await headers()
    const host =
        headersList.get("x-forwarded-host") ||
        headersList.get("host") ||
        "localhost:3000"
    const protocol = headersList.get("x-forwarded-proto") || "http"

    return `${protocol}://${host}`
}

export const getGraphQlClient = (
    token?: string,
    headersObj?: Record<string, string>,
) => {
    return new GraphQLClient(process.env.GRAPHQL_URL!, {
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headersObj,
        },
    })
}

export const getGql = async (token?: string) => {
    const cookieStore = await cookies()
    const accessToken = token ?? cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
    const origin = await getRequestOrigin()

    return getGraphQlClient(accessToken, { origin })
}
