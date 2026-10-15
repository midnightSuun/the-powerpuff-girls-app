import { ClientError } from "graphql-request"
import { updateTag } from "next/cache"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import { createUser } from "../api/create-user"

vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: vi.fn(),
}))

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    CreateUserDocument: "CreateUserDocument",
}))

vi.mock("next/cache", () => ({
    updateTag: vi.fn(),
}))

describe("createUser Server Action", () => {
    const validFormData = {
        email: "test@example.com",
        password: "Password123!",
        firstName: "John",
        lastName: "Doe",
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

        const result = await createUser(validFormData)

        expect(result).toEqual({
            success: false,
            error: "sessionExpired",
        })
    })

    it("returns forbidden error when user is not an Admin", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            role: "Employee",
            id: "1",
            email: "user@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await createUser(validFormData)

        expect(result).toEqual({
            success: false,
            error: "createForbidden",
        })
    })

    it("returns validation error when required fields are missing or invalid", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            role: "Admin",
            id: "1",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const invalidData = { ...validFormData, email: "invalid-email" }

        const result = await createUser(invalidData)

        expect(result.success).toBe(false)
        expect(typeof result.error).toBe("string")
    })

    it("successfully creates a user when data is valid and user is admin", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            role: "Admin",
            id: "1",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const mockRequest = vi.fn().mockResolvedValueOnce({
            createUser: { id: "user-123", email: validFormData.email },
        })
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await createUser(validFormData)

        expect(mockRequest).toHaveBeenCalledTimes(1)
        expect(updateTag).toHaveBeenCalledWith("users")
        expect(result).toEqual({
            success: true,
            data: { id: "user-123", email: validFormData.email },
        })
    })

    it("handles email already taken error correctly", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            role: "Admin",
            id: "1",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const clientError = Object.create(ClientError.prototype, {
            response: {
                value: {
                    errors: [{ message: "userAlreadyExists" }],
                    data: null,
                },
                enumerable: true,
            },
            status: { value: 400, enumerable: true },
        })

        const mockRequest = vi.fn().mockRejectedValueOnce(clientError)
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await createUser(validFormData)

        expect(result).toEqual({
            success: false,
            error: "emailAlreadyTaken",
        })
    })

    it("handles generic server failure gracefully", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            role: "Admin",
            id: "1",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const mockRequest = vi
            .fn()
            .mockRejectedValueOnce(new Error("Database connection error"))
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await createUser(validFormData)

        expect(result).toEqual({
            success: false,
            error: "createFailed",
        })
    })

    it("creates user with departmentId and positionId when provided", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            role: "Admin",
            id: "1",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const dataWithDeptAndPos = {
            ...validFormData,
            departmentId: "dept-123",
            positionId: "pos-456",
        }

        const mockRequest = vi.fn().mockResolvedValueOnce({
            createUser: {
                id: "user-123",
                email: validFormData.email,
                departmentId: "dept-123",
                positionId: "pos-456",
            },
        })
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await createUser(dataWithDeptAndPos)

        expect(mockRequest).toHaveBeenCalledWith("CreateUserDocument", {
            user: expect.objectContaining({
                departmentId: "dept-123",
                positionId: "pos-456",
            }),
        })
        expect(result.success).toBe(true)
    })

    it("creates user with only departmentId when positionId is not provided", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            role: "Admin",
            id: "1",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const dataWithDeptOnly = {
            ...validFormData,
            departmentId: "dept-123",
        }

        const mockRequest = vi.fn().mockResolvedValueOnce({
            createUser: {
                id: "user-123",
                email: validFormData.email,
                departmentId: "dept-123",
            },
        })
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await createUser(dataWithDeptOnly)

        expect(mockRequest).toHaveBeenCalledWith("CreateUserDocument", {
            user: expect.objectContaining({
                departmentId: "dept-123",
            }),
        })
        expect(result.success).toBe(true)
    })

    it("creates user with only positionId when departmentId is not provided", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            role: "Admin",
            id: "1",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const dataWithPosOnly = {
            ...validFormData,
            positionId: "pos-456",
        }

        const mockRequest = vi.fn().mockResolvedValueOnce({
            createUser: {
                id: "user-123",
                email: validFormData.email,
                positionId: "pos-456",
            },
        })
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await createUser(dataWithPosOnly)

        expect(mockRequest).toHaveBeenCalledWith("CreateUserDocument", {
            user: expect.objectContaining({
                positionId: "pos-456",
            }),
        })
        expect(result.success).toBe(true)
    })

    it("handles ClientError with multiple error messages", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            role: "Admin",
            id: "1",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const clientError = Object.create(ClientError.prototype, {
            response: {
                value: {
                    errors: [{ message: "Error 1" }, { message: "Error 2" }],
                    data: null,
                },
                enumerable: true,
            },
            status: { value: 400, enumerable: true },
        })

        const mockRequest = vi.fn().mockRejectedValueOnce(clientError)
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await createUser(validFormData)

        expect(result).toEqual({
            success: false,
            error: "createFailed",
        })
    })

    it("handles email taken with different error message formats", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            role: "Admin",
            id: "1",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const clientError = Object.create(ClientError.prototype, {
            response: {
                value: {
                    errors: [{ message: "Email already exists in the system" }],
                    data: null,
                },
                enumerable: true,
            },
            status: { value: 400, enumerable: true },
        })

        const mockRequest = vi.fn().mockRejectedValueOnce(clientError)
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await createUser(validFormData)

        expect(result).toEqual({
            success: false,
            error: "emailAlreadyTaken",
        })
    })

    it("handles validation error when parsing fails without specific error message", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            role: "Admin",
            id: "1",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const invalidData = {
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            role: "Employee" as const,
        }

        const result = await createUser(invalidData)

        expect(result.success).toBe(false)
        expect(typeof result.error).toBe("string")
    })

    it("handles non-Error and non-ClientError exceptions", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            role: "Admin",
            id: "1",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const mockRequest = vi
            .fn()
            .mockRejectedValueOnce("Unexpected string error")
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await createUser(validFormData)

        expect(result).toEqual({
            success: false,
            error: "createFailed",
        })
    })

    it("handles ClientError without errors array", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            role: "Admin",
            id: "1",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const clientError = Object.create(ClientError.prototype, {
            response: {
                value: {
                    errors: undefined,
                    data: null,
                },
                enumerable: true,
            },
            status: { value: 500, enumerable: true },
        })

        const mockRequest = vi.fn().mockRejectedValueOnce(clientError)
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await createUser(validFormData)

        expect(result).toEqual({
            success: false,
            error: "createFailed",
        })
    })
})
