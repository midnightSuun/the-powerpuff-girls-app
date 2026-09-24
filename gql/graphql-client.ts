import { ACCESS_TOKEN_COOKIE } from "@/modules/consts"
import { GraphQLClient } from "graphql-request"
import { cookies } from "next/headers"

//const ACCESS_TOKEN_MOCK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYxMywiZW1haWwiOiJ5YW5pbmEuc3Zpcmlkb3ZhMjQrMkBnbWFpbC5jb20iLCJyb2xlIjoiRW1wbG95ZWUiLCJpYXQiOjE3OTAxNzI0MDAsImV4cCI6MTc5MDE3MzAwMH0.3rG50Ntx_rg1RzIEpfbP2ob3aOV7JnuI0WEjgRBhh0k"
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
