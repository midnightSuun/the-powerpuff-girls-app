import { ACCESS_TOKEN_COOKIE } from "@/modules/auth/consts"
import { GraphQLClient } from "graphql-request"
import { cookies } from "next/headers"

export const getGraphQlClient = (token?: string) => {
  return new GraphQLClient(process.env.GRAPHQL_URL!, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export const getGql = async () => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

  return getGraphQlClient(accessToken)
}
