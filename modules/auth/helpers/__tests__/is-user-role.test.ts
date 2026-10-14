import { describe, expect, it } from "vitest"

import { isUserRole } from "../is-user-role"

describe("isUserRole helper", () => {
    it("returns true for valid user roles ('Admin', 'Employee')", () => {
        expect(isUserRole("Admin")).toBe(true)
        expect(isUserRole("Employee")).toBe(true)
    })

    it("returns false for invalid string values", () => {
        expect(isUserRole("User")).toBe(false)
        expect(isUserRole("admin")).toBe(false)
        expect(isUserRole("employee")).toBe(false)
        expect(isUserRole("SUPERADMIN")).toBe(false)
        expect(isUserRole("")).toBe(false)
    })

    it("returns false for non-string values (null, undefined, numbers, objects)", () => {
        expect(isUserRole(null)).toBe(false)
        expect(isUserRole(undefined)).toBe(false)
        expect(isUserRole(123)).toBe(false)
        expect(isUserRole(true)).toBe(false)
        expect(isUserRole({})).toBe(false)
        expect(isUserRole([])).toBe(false)
    })
})
