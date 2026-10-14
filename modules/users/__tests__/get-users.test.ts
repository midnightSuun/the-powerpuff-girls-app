import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"

import { getUsers } from "../api/get-users"

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    GetUsersDocument: "GetUsersDocument",
}))

vi.mock("next/cache", () => ({
    cacheLife: vi.fn(),
    cacheTag: vi.fn(),
}))

vi.mock("@lib/sort", () => ({
    sortByLocale: vi.fn((items) => items),
}))

describe("getUsers Server Action", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it("fetches users directly via API when sort field is not a relation", async () => {
        const mockUsers = [{ id: "1", email: "test@example.com" }]
        const mockRequest = vi.fn().mockResolvedValueOnce({
            users: {
                items: mockUsers,
                total_pages: 3,
            },
        })

        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await getUsers(10, 1, "test", "email", "asc", "en")

        expect(mockRequest).toHaveBeenCalledTimes(1)
        expect(mockRequest).toHaveBeenCalledWith("GetUsersDocument", {
            params: {
                limit: 10,
                page: 1,
                search: "test",
                sort_by: "email",
                sort_order: "asc",
            },
        })
        expect(result).toEqual({
            users: mockUsers,
            totalPages: 3,
        })
    })

    it("fetches all pages and sorts on client side when sorting by department relation", async () => {
        const mockFirstPage = {
            users: {
                items: [{ id: "1", department: { name: "B" } }],
                total_pages: 2,
            },
        }
        const mockSecondPage = {
            users: {
                items: [{ id: "2", department: { name: "A" } }],
                total_pages: 2,
            },
        }

        const mockRequest = vi
            .fn()
            .mockResolvedValueOnce(mockFirstPage)
            .mockResolvedValueOnce(mockSecondPage)

        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await getUsers(10, 1, "", "department", "asc", "en")

        expect(mockRequest).toHaveBeenCalledTimes(2)
        expect(mockRequest).toHaveBeenCalledWith("GetUsersDocument", {
            params: { limit: 100, page: 1 },
        })
        expect(mockRequest).toHaveBeenCalledWith("GetUsersDocument", {
            params: { limit: 100, page: 2 },
        })
        expect(result.users).toHaveLength(2)
        expect(result.totalPages).toBe(1)
    })

    it("returns zero totalPages when sorted items list is empty", async () => {
        const mockEmptyPage = {
            users: {
                items: [],
                total_pages: 0,
            },
        }

        const mockRequest = vi.fn().mockResolvedValueOnce(mockEmptyPage)

        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await getUsers(10, 1, "", "position", "desc", "en")

        expect(result).toEqual({
            users: [],
            totalPages: 0,
        })
    })
})
