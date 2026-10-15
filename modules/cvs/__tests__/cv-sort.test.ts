import { describe, expect, it } from "vitest"

import { parseCvSort } from "../cv-sort"

describe("parseCvSort", () => {
    it("parses single sortBy string correctly", () => {
        const result = parseCvSort({
            sortBy: "name",
            sortOrder: "asc",
        })

        expect(result).toEqual({
            sortBy: "name",
            sortOrder: "asc",
        })
    })

    it("parses sortBy array and takes first element", () => {
        const result = parseCvSort({
            sortBy: ["name", "other"],
            sortOrder: "desc",
        })

        expect(result).toEqual({
            sortBy: "name",
            sortOrder: "desc",
        })
    })

    it("returns undefined sortBy for invalid field", () => {
        const result = parseCvSort({
            sortBy: "invalid",
            sortOrder: "asc",
        })

        expect(result).toEqual({
            sortBy: undefined,
            sortOrder: "asc",
        })
    })

    it("defaults to asc sortOrder when sortOrder is not desc", () => {
        const result = parseCvSort({
            sortBy: "name",
            sortOrder: "asc",
        })

        expect(result.sortOrder).toBe("asc")
    })

    it("parses sortOrder as desc correctly", () => {
        const result = parseCvSort({
            sortBy: "name",
            sortOrder: "desc",
        })

        expect(result.sortOrder).toBe("desc")
    })

    it("handles undefined sortOrder parameter", () => {
        const result = parseCvSort({
            sortBy: "name",
        })

        expect(result.sortOrder).toBe("asc")
    })

    it("handles empty params object", () => {
        const result = parseCvSort({})

        expect(result).toEqual({
            sortBy: undefined,
            sortOrder: "asc",
        })
    })

    it("parses sortOrder array and takes first element", () => {
        const result = parseCvSort({
            sortBy: "name",
            sortOrder: ["desc", "asc"],
        })

        expect(result.sortOrder).toBe("desc")
    })
})
