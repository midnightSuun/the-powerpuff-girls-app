import { beforeEach, describe, expect, it, vi } from "vitest"

import { getCurrentSession } from "../get-current-session"
import { requireAdmin } from "../require-admin"

vi.mock("../get-current-session", () => ({
    getCurrentSession: vi.fn(),
}))

describe("requireAdmin helper", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("successfully returns session when user is authenticated and has Admin role", async () => {
        const adminSession = { userId: "admin-1", role: "Admin" as const }
        ;(getCurrentSession as ReturnType<typeof vi.fn>).mockResolvedValue(
            adminSession,
        )

        const result = await requireAdmin()

        expect(getCurrentSession).toHaveBeenCalledTimes(1)
        expect(result).toEqual(adminSession)
    })

    it("throws an error when session is null (unauthenticated)", async () => {
        ;(getCurrentSession as ReturnType<typeof vi.fn>).mockResolvedValue(null)

        await expect(requireAdmin()).rejects.toThrow(
            "Access denied: Admin role required",
        )
    })

    it("throws an error when user has a different role (e.g. Employee)", async () => {
        const employeeSession = { userId: "emp-1", role: "Employee" as const }
        ;(getCurrentSession as ReturnType<typeof vi.fn>).mockResolvedValue(
            employeeSession,
        )

        await expect(requireAdmin()).rejects.toThrow(
            "Access denied: Admin role required",
        )
    })

    it("throws an error when user role is null", async () => {
        const sessionWithoutRole = { userId: "user-1", role: null }
        ;(getCurrentSession as ReturnType<typeof vi.fn>).mockResolvedValue(
            sessionWithoutRole,
        )

        await expect(requireAdmin()).rejects.toThrow(
            "Access denied: Admin role required",
        )
    })
})
