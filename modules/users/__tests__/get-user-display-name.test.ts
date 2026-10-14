import { describe, expect, it } from "vitest"

import { getUserDisplayName } from "../get-user-display-name"

describe("getUserDisplayName Helper", () => {
    it("returns full name when both first and last names are provided", () => {
        const result = getUserDisplayName("John", "Doe")
        expect(result).toBe("John Doe")
    })

    it("returns only first name when last name is null or undefined", () => {
        expect(getUserDisplayName("John", null)).toBe("John")
        expect(getUserDisplayName("John", undefined)).toBe("John")
        expect(getUserDisplayName("John", "")).toBe("John")
    })

    it("returns only last name when first name is null or undefined", () => {
        expect(getUserDisplayName(null, "Doe")).toBe("Doe")
        expect(getUserDisplayName(undefined, "Doe")).toBe("Doe")
        expect(getUserDisplayName("", "Doe")).toBe("Doe")
    })

    it("returns default fallback when both names are missing, null, or empty", () => {
        expect(getUserDisplayName(null, null)).toBe("")
        expect(getUserDisplayName(undefined, undefined)).toBe("")
        expect(getUserDisplayName("", "")).toBe("")
        expect(getUserDisplayName(null, null, "Unknown User")).toBe(
            "Unknown User",
        )
        expect(getUserDisplayName(undefined, "", "N/A")).toBe("N/A")
    })
})
