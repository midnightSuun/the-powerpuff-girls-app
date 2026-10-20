import { revalidatePath } from "next/cache"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import { deleteAvatar } from "../api/delete-profile-avatar"

vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: vi.fn(),
}))

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
}))

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}))

describe("deleteAvatar Server Action", () => {
    const targetUserId = "user-123"

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it("returns session expired error when user is not authenticated", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce(null)

        const result = await deleteAvatar({ userId: targetUserId })

        expect(result).toEqual({
            success: false,
            error: "sessionExpired",
        })
    })

    it("returns update forbidden error when a regular user tries to delete another user's avatar", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: "other-user-999",
            role: "Employee",
            email: "other@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await deleteAvatar({ userId: targetUserId })

        expect(result).toEqual({
            success: false,
            error: "updateForbidden",
        })
    })

    it("successfully deletes avatar when user deletes their own avatar", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: targetUserId,
            role: "Employee",
            email: "user@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const mockRequest = vi
            .fn()
            .mockResolvedValueOnce({ deleteAvatar: true })
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await deleteAvatar({ userId: targetUserId })

        expect(mockRequest).toHaveBeenCalledTimes(1)
        expect(revalidatePath).toHaveBeenCalledWith(
            "/[locale]/users/[userId]/profile",
            "page",
        )
        expect(result).toEqual({ success: true })
    })

    it("successfully deletes avatar when user is an Admin, even for another user", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: "admin-user-1",
            role: "Admin",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const mockRequest = vi
            .fn()
            .mockResolvedValueOnce({ deleteAvatar: true })
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await deleteAvatar({ userId: targetUserId })

        expect(mockRequest).toHaveBeenCalledTimes(1)
        expect(revalidatePath).toHaveBeenCalledWith(
            "/[locale]/users/[userId]/profile",
            "page",
        )
        expect(result).toEqual({ success: true })
    })

    it("handles generic server failure gracefully", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: targetUserId,
            role: "Admin",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const mockRequest = vi
            .fn()
            .mockRejectedValueOnce(new Error("Database failure"))
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await deleteAvatar({ userId: targetUserId })

        expect(result).toEqual({
            success: false,
            error: "updateFailed",
        })
    })
})
