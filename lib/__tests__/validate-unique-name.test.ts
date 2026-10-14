import { describe, expect, it } from "vitest"

import { isNameDuplicate, normalizeName } from "../validate-unique-name"

describe("Name Utilities", () => {
    describe("normalizeName", () => {
        it("trims whitespace from the beginning and end of the string", () => {
            expect(normalizeName("  John Doe  ")).toBe("John Doe")
            expect(normalizeName("\tAlice\n")).toBe("Alice")
        })

        it("returns empty string if given empty string or spaces", () => {
            expect(normalizeName("")).toBe("")
            expect(normalizeName("   ")).toBe("")
        })
    })

    describe("isNameDuplicate", () => {
        const existing = ["John Doe", "Alice Smith", "Bob"]

        it("returns true if exact or case-insensitive match exists", () => {
            expect(isNameDuplicate("John Doe", existing)).toBe(true)
            expect(isNameDuplicate("john doe", existing)).toBe(true)
            expect(isNameDuplicate("  ALICE SMITH  ", existing)).toBe(true)
        })

        it("returns false if name is not in the existing array", () => {
            expect(isNameDuplicate("Charlie", existing)).toBe(false)
        })

        it("returns false if name is empty or whitespace", () => {
            expect(isNameDuplicate("", existing)).toBe(false)
            expect(isNameDuplicate("   ", existing)).toBe(false)
        })

        it("handles default empty existingNames array correctly", () => {
            expect(isNameDuplicate("John Doe")).toBe(false)
        })
    })
})
