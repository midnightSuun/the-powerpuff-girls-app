import { beforeEach, describe, expect, it, vi } from "vitest"

import { RefreshTokenDocument } from "@/gql"
import { getGraphQlClient } from "@/gql/graphql-client"

import { refreshTokens } from "../refresh"

vi.mock("@/gql/graphql-client", () => ({
    getGraphQlClient: vi.fn(),
}))

vi.mock("@/gql", () => ({
    RefreshTokenDocument: "RefreshTokenDocument",
}))

describe("refreshTokens utility", () => {
    const mockRequest = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        ;(getGraphQlClient as ReturnType<typeof vi.fn>).mockReturnValue({
            request: mockRequest,
        })
    })

    it("successfully refreshes tokens using the provided refresh token", async () => {
        mockRequest.mockResolvedValueOnce({
            updateToken: {
                access_token: "new-access-token",
                refresh_token: "new-refresh-token",
            },
        })

        const result = await refreshTokens("old-refresh-token")

        expect(getGraphQlClient).toHaveBeenCalledTimes(1)
        expect(getGraphQlClient).toHaveBeenCalledWith("old-refresh-token")
        expect(mockRequest).toHaveBeenCalledTimes(1)
        expect(mockRequest).toHaveBeenCalledWith(RefreshTokenDocument)
        expect(result).toEqual({
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token",
        })
    })

    it("propagates error when GraphQL request fails", async () => {
        mockRequest.mockRejectedValueOnce(new Error("Token expired"))

        await expect(refreshTokens("expired-refresh-token")).rejects.toThrow(
            "Token expired",
        )

        expect(getGraphQlClient).toHaveBeenCalledWith("expired-refresh-token")
        expect(mockRequest).toHaveBeenCalledWith(RefreshTokenDocument)
    })
})
