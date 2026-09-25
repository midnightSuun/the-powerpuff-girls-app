import { RefreshTokenDocument } from "@/gql"
import { getGraphQlClient } from "@/gql/graphql-client"

export const refreshTokens = async (refreshToken: string) => {
    const gql = getGraphQlClient(refreshToken)
    const data = await gql.request(RefreshTokenDocument)

    return {
        accessToken: data.updateToken.access_token,
        refreshToken: data.updateToken.refresh_token,
    }
}
