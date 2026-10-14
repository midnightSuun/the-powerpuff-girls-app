import { revalidatePath } from "next/cache"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getGql } from "@/gql"
import { getCurrentSession } from "@/modules/auth/helpers/get-current-session"

import { uploadProfileAvatar } from "../api/upload-profile-avatar"
import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_SIZE } from "../constants"

vi.mock("@/modules/auth/helpers/get-current-session", () => ({
    getCurrentSession: vi.fn(),
}))

vi.mock("@/gql", () => ({
    getGql: vi.fn(),
    UploadAvatarDocument: "UploadAvatarDocument",
}))

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}))

describe("uploadProfileAvatar Server Action", () => {
    const targetUserId = "user-123"
    const validMimeType = Array.from(ALLOWED_AVATAR_TYPES)[0] ?? "image/png"

    const createMockFormData = (
        userId: string = targetUserId,
        file: File | null = new File(["dummy content"], "avatar.png", {
            type: validMimeType,
        }),
    ) => {
        const formData = new FormData()
        if (userId) formData.append("userId", userId)
        if (file) formData.append("file", file)
        return formData
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it("returns session expired error when user is not authenticated", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce(null)

        const result = await uploadProfileAvatar(createMockFormData())

        expect(result).toEqual({
            success: false,
            error: "sessionExpired",
        })
    })

    it("returns avatar upload failed error when userId or file is missing", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: targetUserId,
            role: "Employee",
            email: "user@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const invalidFormData = createMockFormData("", null)
        const result = await uploadProfileAvatar(invalidFormData)

        expect(result).toEqual({
            success: false,
            error: "avatarUploadFailed",
        })
    })

    it("returns update forbidden error when regular user tries to upload avatar for another user", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: "other-user-999",
            role: "Employee",
            email: "other@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const result = await uploadProfileAvatar(createMockFormData())

        expect(result).toEqual({
            success: false,
            error: "updateForbidden",
        })
    })

    it("returns unsupported file type error when file mime type is not allowed", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: targetUserId,
            role: "Employee",
            email: "user@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const invalidFile = new File(["content"], "doc.pdf", {
            type: "application/pdf",
        })
        const formData = createMockFormData(targetUserId, invalidFile)

        const result = await uploadProfileAvatar(formData)

        expect(result).toEqual({
            success: false,
            error: "unsupportedFileType",
        })
    })

    it("returns file too large error when file size exceeds maximum limit", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: targetUserId,
            role: "Employee",
            email: "user@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const largeByteArray = new Uint8Array(MAX_AVATAR_SIZE + 1)
        const largeFile = new File([largeByteArray], "avatar.png", {
            type: validMimeType,
        })

        const formData = new FormData()
        formData.append("userId", targetUserId)
        formData.append("file", largeFile)

        const result = await uploadProfileAvatar(formData)

        expect(result).toEqual({
            success: false,
            error: "fileTooLarge",
        })
    })

    it("successfully uploads avatar when data is valid and user is updating own profile", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: targetUserId,
            role: "Employee",
            email: "user@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const mockAvatarResponse = { url: "https://example.com/avatar.png" }
        const mockRequest = vi.fn().mockResolvedValueOnce({
            uploadAvatar: mockAvatarResponse,
        })
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await uploadProfileAvatar(createMockFormData())

        expect(mockRequest).toHaveBeenCalledTimes(1)
        expect(revalidatePath).toHaveBeenCalledWith(
            "/[locale]/users/[userId]/profile",
            "page",
        )
        expect(result).toEqual({
            success: true,
            data: mockAvatarResponse,
        })
    })

    it("successfully uploads avatar when user is an Admin, even for another user", async () => {
        vi.mocked(getCurrentSession).mockResolvedValueOnce({
            userId: "admin-1",
            role: "Admin",
            email: "admin@example.com",
        } as unknown as Awaited<ReturnType<typeof getCurrentSession>>)

        const mockRequest = vi.fn().mockResolvedValueOnce({
            uploadAvatar: { success: true },
        })
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await uploadProfileAvatar(
            createMockFormData(targetUserId),
        )

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
            .mockRejectedValueOnce(new Error("Storage service unavailable"))
        vi.mocked(getGql).mockResolvedValueOnce({
            request: mockRequest,
        } as unknown as Awaited<ReturnType<typeof getGql>>)

        const result = await uploadProfileAvatar(createMockFormData())

        expect(result).toEqual({
            success: false,
            error: "avatarUploadFailed",
        })
    })
})
