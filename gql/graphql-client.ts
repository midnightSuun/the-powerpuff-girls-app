import { GraphQLClient } from "graphql-request"
import { cookies, headers } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/modules/auth/consts"

export const getGraphQlClient = (token?: string, headersObj?: Record<string, string>) => {
    return new GraphQLClient(process.env.GRAPHQL_URL!, {
        headers: {
            ...(token ? { Authorization: ["Bearer", token].join(" ") } : {}),
            ...headersObj,
        },
    })
}

export const getGql = async () => {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

    const headersList = await headers()
    const host = headersList.get("host") || "localhost:3000"
    const protocol = headersList.get("x-forwarded-proto") || "http"
    const currentOrigin = `${protocol}://${host}`

    return getGraphQlClient(accessToken, {
        origin: currentOrigin,
        referer: `${currentOrigin}/`,
    })
}