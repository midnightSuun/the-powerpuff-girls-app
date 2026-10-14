import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"

import { getUser } from "../api/get-user"

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    GetUserDocument: "GetUserDocument",
}))

vi.mock("next/cache", () => ({
    cacheLife: vi.fn(),
    cacheTag: vi.fn(),
}))

describe("getUser Server Action", () => {
    const userId = "user-123"

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it("successfully fetches user by id", async () => {
        const mockUser = {
            id: userId,
            email: "test@example.com",
            firstName: "John",
            lastName: "Doe",
        }

        const mockRequest = vi.fn().mockResolvedValueOnce({
            user: mockUser,
        })

        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await getUser(userId)

        expect(mockRequest).toHaveBeenCalledTimes(1)
        expect(mockRequest).toHaveBeenCalledWith("GetUserDocument", {
            id: userId,
        })
        expect(result).toEqual(mockUser)
    })

    it("throws an error when GraphQL request fails", async () => {
        const mockRequest = vi
            .fn()
            .mockRejectedValueOnce(new Error("User not found"))

        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        await expect(getUser(userId)).rejects.toThrow("User not found")
    })
})
