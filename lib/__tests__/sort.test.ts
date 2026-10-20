import { describe, expect, it } from "vitest"

import { nextSortOrder, sortByLocale } from "../sort"

describe("nextSortOrder", () => {
    it("switches the active column from ascending to descending", () => {
        expect(nextSortOrder("name", "asc", "name")).toBe("desc")
    })

    it("returns ascending when the active column is already descending", () => {
        expect(nextSortOrder("name", "desc", "name")).toBe("asc")
    })

    it("returns ascending when a different column is selected", () => {
        expect(nextSortOrder("name", "desc", "email")).toBe("asc")
    })

    it("returns ascending when the current sort is missing", () => {
        expect(nextSortOrder(undefined, undefined, "name")).toBe("asc")
        expect(nextSortOrder("name", undefined, "name")).toBe("asc")
    })
})

describe("sortByLocale", () => {
    const names = [
        { label: "Project 10" },
        { label: "project 2" },
        { label: "  " },
        { label: "Café" },
        { label: "" },
        { label: "cafe" },
    ]

    it("sorts with locale rules, numeric order, and empty values last", () => {
        const sorted = sortByLocale(
            names,
            (item) => item.label,
            "asc",
            "en",
        ).map((item) => item.label)

        expect(sorted).toEqual([
            "cafe",
            "Café",
            "project 2",
            "Project 10",
            "  ",
            "",
        ])
    })

    it("reverses only non-empty values when the order is descending", () => {
        const sorted = sortByLocale(
            names,
            (item) => item.label,
            "desc",
            "en",
        ).map((item) => item.label)

        expect(sorted).toEqual([
            "Project 10",
            "project 2",
            "Café",
            "cafe",
            "  ",
            "",
        ])
    })

    it("treats letter case as equal and keeps the original order", () => {
        const items = [{ label: "apple" }, { label: "Apple" }]

        const sorted = sortByLocale(items, (item) => item.label, "asc", "en")

        expect(sorted).toEqual(items)
    })

    it("does not mutate the original list", () => {
        const items = [{ label: "b" }, { label: "a" }]

        const sorted = sortByLocale(items, (item) => item.label, "asc", "en")

        expect(sorted.map((item) => item.label)).toEqual(["a", "b"])
        expect(items.map((item) => item.label)).toEqual(["b", "a"])
        expect(sorted).not.toBe(items)
    })

    it("uses the provided locale collation", () => {
        const items = [{ label: "Яблоко" }, { label: "Арбуз" }]

        const sorted = sortByLocale(items, (item) => item.label, "asc", "ru")

        expect(sorted.map((item) => item.label)).toEqual(["Арбуз", "Яблоко"])
    })
})
