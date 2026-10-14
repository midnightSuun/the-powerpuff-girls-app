import { describe, expect, it } from "vitest"

import { toDateInputValue } from "../date"

describe("toDateInputValue", () => {
    it("returns empty string for undefined, null, or empty string", () => {
        expect(toDateInputValue(undefined)).toBe("")
        expect(toDateInputValue(null)).toBe("")
        expect(toDateInputValue("")).toBe("")
    })

    it("returns first 10 characters if string matches YYYY-MM-DD prefix pattern", () => {
        expect(toDateInputValue("2026-10-14")).toBe("2026-10-14")
        expect(toDateInputValue("2026-10-14T15:30:00.000Z")).toBe("2026-10-14")
    })

    it("correctly parses valid date strings using UTC or local date mapping", () => {
        expect(toDateInputValue("2026-10-14T00:00:00.000Z")).toBe("2026-10-14")
    })

    it("returns empty string for completely invalid date strings", () => {
        expect(toDateInputValue("invalid-date-string")).toBe("")
    })
})
