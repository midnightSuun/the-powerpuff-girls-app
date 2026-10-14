import { updateTag } from "next/cache"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import { deleteUser } from "../api/delete-user"

vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: vi.fn(),
}))

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    DeleteUserDocument: "DeleteUserDocument",
}))

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}))

describe("deleteUser Server Action", () => {
    const targetUserId = "user-to-delete-123"
    const adminUserId = "admin-1"

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it("returns session expired error when user is not authenticated", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce(null)

        const result = await deleteUser(targetUserId)

        expect(result).toEqual({
            success: false,
            error: "sessionExpired",
        })
    })

    it("returns delete forbidden error when user is not an Admin", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: "emp-1",
            role: "Employee",
            email: "employee@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await deleteUser(targetUserId)

        expect(result).toEqual({
            success: false,
            error: "deleteForbidden",
        })
    })

    it("returns delete self forbidden error when admin tries to delete themselves", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: adminUserId,
            role: "Admin",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await deleteUser(adminUserId)

        expect(result).toEqual({
            success: false,
            error: "deleteSelfForbidden",
        })
    })

    it("successfully deletes a user when user is admin and target is different", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: adminUserId,
            role: "Admin",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const mockRequest = vi.fn().mockResolvedValueOnce({
            deleteUser: { affected: 1 },
        })
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await deleteUser(targetUserId)

        expect(mockRequest).toHaveBeenCalledTimes(1)
        expect(updateTag).toHaveBeenCalledWith("users")
        expect(result).toEqual({ success: true })
    })

    it("returns delete failed error when affected rows count is 0", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: adminUserId,
            role: "Admin",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const mockRequest = vi.fn().mockResolvedValueOnce({
            deleteUser: { affected: 0 },
        })
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await deleteUser(targetUserId)

        expect(result).toEqual({
            success: false,
            error: "deleteFailed",
        })
    })

    it("handles generic server failure gracefully", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: adminUserId,
            role: "Admin",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const mockRequest = vi
            .fn()
            .mockRejectedValueOnce(new Error("Database connection error"))
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await deleteUser(targetUserId)

        expect(result).toEqual({
            success: false,
            error: "deleteFailed",
        })
    })
})
