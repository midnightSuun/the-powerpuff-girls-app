import { updateTag } from "next/cache"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import { updateUser } from "../api/update-user"

vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: vi.fn(),
}))

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    UpdateProfileDocument: "UpdateProfileDocument",
    UpdateUserProfileDocument: "UpdateUserProfileDocument",
}))

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}))

describe("updateUser Server Action", () => {
    const validFormData = {
        userId: "user-123",
        firstName: "John",
        lastName: "Doe",
        departmentId: "dep-1",
        positionId: "pos-1",
        role: "Employee" as const,
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it("returns session expired error when user is not authenticated", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce(null)

        const result = await updateUser(validFormData)

        expect(result).toEqual({
            success: false,
            error: "sessionExpired",
        })
    })

    it("returns update forbidden error when user is not an Admin", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: "emp-1",
            role: "Employee",
            email: "employee@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await updateUser(validFormData)

        expect(result).toEqual({
            success: false,
            error: "updateForbidden",
        })
    })

    it("returns validation error when required fields are missing or invalid", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: "admin-1",
            role: "Admin",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const invalidData = { ...validFormData, firstName: "" }

        const result = await updateUser(invalidData)

        expect(result.success).toBe(false)
        expect(typeof result.error).toBe("string")
    })

    it("successfully updates a user when data is valid and user is admin", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: "admin-1",
            role: "Admin",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const updatedUserResponse = {
            id: validFormData.userId,
            firstName: "John",
        }
        const mockRequest = vi
            .fn()
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({
                updateUser: updatedUserResponse,
            })

        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await updateUser(validFormData)

        expect(mockRequest).toHaveBeenCalledTimes(2)
        expect(mockRequest).toHaveBeenNthCalledWith(
            1,
            "UpdateProfileDocument",
            {
                profile: {
                    userId: validFormData.userId,
                    first_name: validFormData.firstName,
                    last_name: validFormData.lastName,
                },
            },
        )
        expect(mockRequest).toHaveBeenNthCalledWith(
            2,
            "UpdateUserProfileDocument",
            {
                user: {
                    userId: validFormData.userId,
                    departmentId: validFormData.departmentId,
                    positionId: validFormData.positionId,
                    role: validFormData.role,
                },
            },
        )

        expect(updateTag).toHaveBeenCalledWith(`user-${validFormData.userId}`)
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
            .mockRejectedValueOnce(new Error("Database update error"))

        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await updateUser(validFormData)

        expect(result).toEqual({
            success: false,
            error: "updateFailed",
        })
    })
})
