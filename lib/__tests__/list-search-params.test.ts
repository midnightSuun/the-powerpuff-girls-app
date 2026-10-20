import { describe, expect, it } from "vitest"

import { buildListSearchParams, readListSearch } from "../list-search-params"

describe("List Search Params Utilities", () => {
    describe("readListSearch", () => {
        it("returns trimmed string when single string is provided", () => {
            expect(readListSearch("  hello world  ")).toBe("hello world")
        })

        it("returns first element trimmed when array of strings is provided", () => {
            expect(readListSearch(["  first item  ", "second item"])).toBe(
                "first item",
            )
        })

        it("returns empty string when null, undefined, or empty array is provided", () => {
            expect(readListSearch(null)).toBe("")
            expect(readListSearch(undefined)).toBe("")
            expect(readListSearch([])).toBe("")
        })
    })

    describe("buildListSearchParams", () => {
        it("builds basic search params with page and limit", () => {
            const query = {
                page: 1,
                limit: 10,
                search: "",
            }

            const result = buildListSearchParams(query)
            expect(result).toBe("page=1&limit=10")
        })

        it("includes trimmed search parameter when search query is provided", () => {
            const query = {
                page: 2,
                limit: 20,
                search: "  react typescript  ",
            }

            const result = buildListSearchParams(query)
            expect(result).toBe("page=2&limit=20&search=react+typescript")
        })

        it("includes sortBy and defaults sortOrder to 'asc' when sortOrder is omitted", () => {
            const query = {
                page: 1,
                limit: 10,
                search: "",
                sortBy: "name",
            }

            const result = buildListSearchParams(query)
            expect(result).toBe("page=1&limit=10&sortBy=name&sortOrder=asc")
        })

        it("includes sortBy and explicit sortOrder when provided", () => {
            const query = {
                page: 1,
                limit: 10,
                search: "test",
                sortBy: "createdAt",
                sortOrder: "desc" as const,
            }

            const result = buildListSearchParams(query)
            expect(result).toBe(
                "page=1&limit=10&search=test&sortBy=createdAt&sortOrder=desc",
            )
        })
    })
})
