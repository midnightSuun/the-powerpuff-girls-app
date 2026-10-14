import { revalidatePath, updateTag } from "next/cache"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import { updateUserProfile } from "../api/update-user-profile"

vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: vi.fn(),
}))

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    GetUserDocument: "GetUserDocument",
    UpdateUserProfileDocument: "UpdateUserProfileDocument",
}))

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
    updateTag: vi.fn(),
}))

describe("updateUserProfile Server Action", () => {
    const targetUserId = "user-123"
    const validData = {
        userId: targetUserId,
        departmentId: "dep-1",
        positionId: "pos-1",
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it("returns session expired error when user is not authenticated", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce(null)

        const result = await updateUserProfile(validData)

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

        const result = await updateUserProfile(validData)

        expect(result).toEqual({
            success: false,
            error: "updateForbidden",
        })
    })

    it("returns validation error when departmentId is missing", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: targetUserId,
            role: "Employee",
            email: "user@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await updateUserProfile({
            ...validData,
            departmentId: "",
        })

        expect(result).toEqual({
            success: false,
            error: "departmentRequired",
        })
    })

    it("returns validation error when positionId is missing", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: targetUserId,
            role: "Employee",
            email: "user@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await updateUserProfile({ ...validData, positionId: "" })

        expect(result).toEqual({
            success: false,
            error: "positionRequired",
        })
    })

    it("successfully updates user profile assignments when data is valid", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: "admin-1",
            role: "Admin",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const updatedUserResponse = {
            id: targetUserId,
            department: { id: "dep-1" },
        }
        const mockRequest = vi
            .fn()
            .mockResolvedValueOnce({
                user: { role: "Employee" },
            })
            .mockResolvedValueOnce({
                updateUser: updatedUserResponse,
            })

        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await updateUserProfile(validData)

        expect(mockRequest).toHaveBeenCalledTimes(2)
        expect(mockRequest).toHaveBeenNthCalledWith(1, "GetUserDocument", {
            id: targetUserId,
        })
        expect(mockRequest).toHaveBeenNthCalledWith(
            2,
            "UpdateUserProfileDocument",
            {
                user: {
                    userId: targetUserId,
                    departmentId: "dep-1",
                    positionId: "pos-1",
                    role: "Employee",
                },
            },
        )

        expect(revalidatePath).toHaveBeenCalledWith(
            "/[locale]/users/[userId]/profile",
            "page",
        )
        expect(updateTag).toHaveBeenCalledWith(`user-${targetUserId}`)
        expect(updateTag).toHaveBeenCalledWith("users")
        expect(result).toEqual({
            success: true,
            data: updatedUserResponse,
        })
    })

    it("handles generic server failure gracefully", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: "admin-1",
            role: "Admin",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const mockRequest = vi
            .fn()
            .mockRejectedValueOnce(new Error("Database connection error"))

        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await updateUserProfile(validData)

        expect(result).toEqual({
            success: false,
            error: "updateFailed",
        })
    })
})
