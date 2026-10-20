import { describe, expect, it, vi } from "vitest"

import { getUserRoleOptions } from "../user-role-options"

describe("getUserRoleOptions Helper", () => {
    it("maps user roles to select options using translation function correctly", () => {
        const mockTranslate = vi.fn((key: "employee" | "admin") => {
            const translations: Record<string, string> = {
                employee: "Employee Label",
                admin: "Admin Label",
            }
            return translations[key] || key
        })

        const options = getUserRoleOptions(mockTranslate)

        expect(mockTranslate).toHaveBeenCalledTimes(2)
        expect(mockTranslate).toHaveBeenCalledWith("employee")
        expect(mockTranslate).toHaveBeenCalledWith("admin")

        expect(options).toEqual([
            { id: "Employee", name: "Employee Label" },
            { id: "Admin", name: "Admin Label" },
        ])
        expect(options).toHaveLength(2)
    })
})
