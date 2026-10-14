import { describe, expect, it, vi } from "vitest"

import {
    paginationSearchParamsSchema,
    parsePaginationSearchParams,
} from "../pagination-search-params"

vi.mock("@/lib/user-sort", () => ({
    userSortFields: ["name", "email", "createdAt"] as const,
}))

describe("Pagination Search Params Schema & Parser", () => {
    describe("paginationSearchParamsSchema", () => {
        it("applies default values when empty object or invalid values are passed", () => {
            const result = paginationSearchParamsSchema.parse({})

            expect(result).toEqual({
                limit: 10,
                page: 1,
                search: "",
                sortBy: undefined,
                sortOrder: "asc",
            })
        })

        it("coerces and validates valid query parameters correctly", () => {
            const input = {
                limit: "25",
                page: "3",
                search: "  admin user  ",
                sortBy: "email",
                sortOrder: "desc",
            }

            const result = paginationSearchParamsSchema.parse(input)

            expect(result).toEqual({
                limit: 25,
                page: 3,
                search: "  admin user  ",
                sortBy: "email",
                sortOrder: "desc",
            })
        })

        it("falls back to default limit and page when numbers are out of range (< 1)", () => {
            const input = {
                limit: "0",
                page: "-5",
            }

            const result = paginationSearchParamsSchema.parse(input)

            expect(result.limit).toBe(10)
            expect(result.page).toBe(1)
        })

        it("falls back to undefined for invalid sortBy enum and defaults sortOrder", () => {
            const input = {
                sortBy: "invalid_field",
                sortOrder: "invalid_order",
            }

            const result = paginationSearchParamsSchema.parse(input)

            expect(result.sortBy).toBeUndefined()
            expect(result.sortOrder).toBe("asc")
        })
    })

    describe("parsePaginationSearchParams", () => {
        it("parses raw search params record successfully", () => {
            const rawParams = {
                limit: "50",
                page: "2",
                search: "test",
                sortBy: "name",
            }

            const result = parsePaginationSearchParams(rawParams)

            expect(result).toEqual({
                limit: 50,
                page: 2,
                search: "test",
                sortBy: "name",
                sortOrder: "asc",
            })
        })
    })
})
