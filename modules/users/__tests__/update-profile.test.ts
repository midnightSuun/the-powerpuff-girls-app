import { revalidatePath, updateTag } from "next/cache"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import { updateProfile } from "../api/update-profile"

vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: vi.fn(),
}))

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    UpdateProfileDocument: "UpdateProfileDocument",
}))

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
    updateTag: vi.fn(),
}))

describe("updateProfile Server Action", () => {
    const targetUserId = "user-123"
    const validData = {
        userId: targetUserId,
        first_name: "John",
        last_name: "Doe",
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it("returns session expired error when user is not authenticated", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce(null)

        const result = await updateProfile(validData)

        expect(result).toEqual({
            success: false,
            error: "sessionExpired",
        })
    })

    it("returns update forbidden error when regular user tries to update another user's profile", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: "other-user-999",
            role: "Employee",
            email: "other@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await updateProfile(validData)

        expect(result).toEqual({
            success: false,
            error: "updateForbidden",
        })
    })

    it("returns validation error when first name is empty", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: targetUserId,
            role: "Employee",
            email: "user@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await updateProfile({ ...validData, first_name: "   " })

        expect(result).toEqual({
            success: false,
            error: "firstNameRequired",
        })
    })

    it("returns validation error when last name is empty", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: targetUserId,
            role: "Employee",
            email: "user@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await updateProfile({ ...validData, last_name: "" })

        expect(result).toEqual({
            success: false,
            error: "lastNameRequired",
        })
    })

    it("returns validation error when first name is too long", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: targetUserId,
            role: "Employee",
            email: "user@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await updateProfile({
            ...validData,
            first_name: "a".repeat(101),
        })

        expect(result).toEqual({
            success: false,
            error: "firstNameTooLong",
        })
    })

    it("returns validation error when last name is too long", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: targetUserId,
            role: "Employee",
            email: "user@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await updateProfile({
            ...validData,
            last_name: "b".repeat(101),
        })

        expect(result).toEqual({
            success: false,
            error: "lastNameTooLong",
        })
    })

    it("successfully updates profile when user updates their own profile", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: targetUserId,
            role: "Employee",
            email: "user@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const updatedProfileResponse = {
            id: targetUserId,
            first_name: "John",
            last_name: "Doe",
        }
        const mockRequest = vi.fn().mockResolvedValueOnce({
            updateProfile: updatedProfileResponse,
        })
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await updateProfile(validData)

        expect(mockRequest).toHaveBeenCalledTimes(1)
        expect(revalidatePath).toHaveBeenCalledWith(
            "/[locale]/users/[userId]/profile",
            "page",
        )
        expect(updateTag).toHaveBeenCalledWith(`user-${targetUserId}`)
        expect(updateTag).toHaveBeenCalledWith("users")
        expect(result).toEqual({
            success: true,
            data: updatedProfileResponse,
        })
    })

    it("successfully updates profile when user is an Admin, even for another user", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: "admin-1",
            role: "Admin",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const mockRequest = vi.fn().mockResolvedValueOnce({
            updateProfile: { id: targetUserId },
        })
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await updateProfile(validData)

        expect(mockRequest).toHaveBeenCalledTimes(1)
        expect(result.success).toBe(true)
    })

    it("handles generic server failure gracefully", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: targetUserId,
            role: "Admin",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const mockRequest = vi
            .fn()
            .mockRejectedValueOnce(new Error("Database error"))
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await updateProfile(validData)

        expect(result).toEqual({
            success: false,
            error: "updateFailed",
        })
    })
})
