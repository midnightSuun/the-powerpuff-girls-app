import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useBreadcrumbRefresh } from "@/components/header-view/breadcrumb-refresh"
import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useRouter } from "@/i18n/navigation"
import { sendProfileVerificationAction } from "@/modules/auth/api/verification"

import { deleteAvatar } from "../api/delete-profile-avatar"
import { updateProfile } from "../api/update-profile"
import { updateUserProfile } from "../api/update-user-profile"
import { uploadProfileAvatar } from "../api/upload-profile-avatar"
import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_SIZE } from "../constants"
import { type UserData, useUserProfile } from "../hooks/use-user-profile"

vi.mock("@/hooks/use-action-notifications", () => ({
    useActionNotifications: vi.fn(),
}))

vi.mock("@/components/header-view/breadcrumb-refresh", () => ({
    useBreadcrumbRefresh: vi.fn(),
}))

vi.mock("@/i18n/navigation", () => ({
    useRouter: vi.fn(),
}))

vi.mock("@/modules/auth/api/verification", () => ({
    sendProfileVerificationAction: vi.fn(),
}))

vi.mock("../api/delete-profile-avatar", () => ({
    deleteAvatar: vi.fn(),
}))

vi.mock("../api/update-profile", () => ({
    updateProfile: vi.fn(),
}))

vi.mock("../api/update-user-profile", () => ({
    updateUserProfile: vi.fn(),
}))

vi.mock("../api/upload-profile-avatar", () => ({
    uploadProfileAvatar: vi.fn(),
}))

describe("useUserProfile Hook", () => {
    const mockNotifySuccess = vi.fn()
    const mockNotifyError = vi.fn()
    const mockNotifyWarning = vi.fn()
    const mockNotifyInfo = vi.fn()
    const mockRefreshBreadcrumb = vi.fn()
    const mockRouterRefresh = vi.fn()
    const mockRouterPush = vi.fn()

    const sampleUser: UserData = {
        id: "user-1",
        email: "test@example.com",
        is_verified: false,
        profile: {
            first_name: "John",
            last_name: "Doe",
            avatar: "https://example.com/avatar.jpg",
        },
        department: { id: "dep-1", name: "Engineering" },
        position: { id: "pos-1", name: "Developer" },
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useActionNotifications).mockReturnValue({
            success: mockNotifySuccess,
            error: mockNotifyError,
            warning: mockNotifyWarning,
            info: mockNotifyInfo,
        })

        vi.mocked(useBreadcrumbRefresh).mockReturnValue({
            refreshBreadcrumb: mockRefreshBreadcrumb,
            revision: 0,
            snapshot: null,
        } as unknown as ReturnType<typeof useBreadcrumbRefresh>)

        vi.mocked(useRouter).mockReturnValue({
            refresh: mockRouterRefresh,
            push: mockRouterPush,
            replace: vi.fn(),
            prefetch: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
        } as unknown as ReturnType<typeof useRouter>)

        vi.stubGlobal("URL", {
            createObjectURL: vi.fn(() => "blob:http://localhost/mock-blob"),
            revokeObjectURL: vi.fn(),
        })
    })

    afterEach(() => {
        vi.resetAllMocks()
        vi.unstubAllGlobals()
    })

    it("initializes with correct default state and permissions", () => {
        const { result } = renderHook(() =>
            useUserProfile(sampleUser, "user-1", "Employee"),
        )

        expect(result.current.firstName).toBe("John")
        expect(result.current.lastName).toBe("Doe")
        expect(result.current.departmentId).toBe("dep-1")
        expect(result.current.positionId).toBe("pos-1")
        expect(result.current.avatarPreview).toBe(
            "https://example.com/avatar.jpg",
        )
        expect(result.current.canEdit).toBe(true)
        expect(result.current.canVerifyEmail).toBe(true)
        expect(result.current.isChanged).toBe(false)
        expect(result.current.isValid).toBe(true)
    })

    it("allows admin to edit other users", () => {
        const { result } = renderHook(() =>
            useUserProfile(sampleUser, "other-user", "Admin"),
        )

        expect(result.current.canEdit).toBe(true)
        expect(result.current.canVerifyEmail).toBe(false)
    })

    it("updates form fields correctly and tracks validity/changes", () => {
        const { result } = renderHook(() =>
            useUserProfile(sampleUser, "user-1", "Employee"),
        )

        act(() => {
            result.current.setFirstName("Jane")
        })

        expect(result.current.firstName).toBe("Jane")
        expect(result.current.isChanged).toBe(true)
        expect(result.current.isValid).toBe(true)

        act(() => {
            result.current.setFirstName("   ")
        })

        expect(result.current.isValid).toBe(false)
    })

    it("handles successful profile update", async () => {
        vi.mocked(updateProfile).mockResolvedValueOnce({
            success: true,
            data: {},
        } as Awaited<ReturnType<typeof updateProfile>>)
        vi.mocked(updateUserProfile).mockResolvedValueOnce({
            success: true,
            data: {},
        } as Awaited<ReturnType<typeof updateUserProfile>>)

        const { result } = renderHook(() =>
            useUserProfile(sampleUser, "user-1", "Employee"),
        )

        act(() => {
            result.current.setFirstName("UpdatedName")
        })

        const mockEvent = new Event("submit")

        await act(async () => {
            await result.current.handleUpdate(
                mockEvent as unknown as Parameters<
                    typeof result.current.handleUpdate
                >[0],
            )
        })

        expect(updateProfile).toHaveBeenCalledWith({
            userId: "user-1",
            first_name: "UpdatedName",
            last_name: "Doe",
        })
        expect(mockRefreshBreadcrumb).toHaveBeenCalledWith({
            pagePath: "/users/{userId}",
            id: "user-1",
            value: "UpdatedName Doe",
        })
        expect(mockNotifySuccess).toHaveBeenCalledWith("update")
        expect(mockRouterRefresh).toHaveBeenCalledTimes(1)
    })

    it("handles failure during profile update", async () => {
        vi.mocked(updateProfile).mockResolvedValueOnce({
            success: false,
            error: "customError",
        } as Awaited<ReturnType<typeof updateProfile>>)

        const { result } = renderHook(() =>
            useUserProfile(sampleUser, "user-1", "Employee"),
        )

        act(() => {
            result.current.setFirstName("UpdatedName")
        })

        const mockEvent = new Event("submit")

        await act(async () => {
            await result.current.handleUpdate(
                mockEvent as unknown as Parameters<
                    typeof result.current.handleUpdate
                >[0],
            )
        })

        expect(mockNotifyError).toHaveBeenCalledWith("customError")
        expect(mockRouterRefresh).not.toHaveBeenCalled()
    })

    it("rejects avatar upload with unsupported file type", async () => {
        const { result } = renderHook(() =>
            useUserProfile(sampleUser, "user-1", "Employee"),
        )

        const invalidFile = new File(["dummy content"], "test.txt", {
            type: "text/plain",
        })
        const mockChangeEvent = {
            currentTarget: {
                files: [invalidFile],
                value: "C:\\fakepath\\test.txt",
            },
        } as unknown as React.ChangeEvent<HTMLInputElement>

        await act(async () => {
            await result.current.handleAvatarChange(mockChangeEvent)
        })

        expect(result.current.avatarError).toBe("unsupportedFileType")
        expect(mockNotifyError).toHaveBeenCalledWith("unsupportedFileType")
        expect(uploadProfileAvatar).not.toHaveBeenCalled()
    })

    it("rejects avatar upload when file size exceeds limit", async () => {
        const { result } = renderHook(() =>
            useUserProfile(sampleUser, "user-1", "Employee"),
        )

        const largeFile = new File(
            ["x".repeat(MAX_AVATAR_SIZE + 1)],
            "large.jpg",
            {
                type: "image/jpeg",
            },
        )
        const mockChangeEvent = {
            currentTarget: {
                files: [largeFile],
                value: "C:\\fakepath\\large.jpg",
            },
        } as unknown as React.ChangeEvent<HTMLInputElement>

        ALLOWED_AVATAR_TYPES.add("image/jpeg")

        await act(async () => {
            await result.current.handleAvatarChange(mockChangeEvent)
        })

        expect(result.current.avatarError).toBe("fileTooLarge")
        expect(mockNotifyError).toHaveBeenCalledWith("fileTooLarge")
        expect(uploadProfileAvatar).not.toHaveBeenCalled()
    })

    it("successfully uploads profile avatar", async () => {
        ALLOWED_AVATAR_TYPES.add("image/jpeg")
        vi.mocked(uploadProfileAvatar).mockResolvedValueOnce({
            success: true,
            data: "new-avatar.jpg", // Приведено в соответствие со строковым типом data
        } as unknown as Awaited<ReturnType<typeof uploadProfileAvatar>>)

        const { result } = renderHook(() =>
            useUserProfile(sampleUser, "user-1", "Employee"),
        )

        const validFile = new File(["avatar"], "avatar.jpg", {
            type: "image/jpeg",
        })
        const mockChangeEvent = {
            currentTarget: {
                files: [validFile],
                value: "C:\\fakepath\\avatar.jpg",
            },
        } as unknown as React.ChangeEvent<HTMLInputElement>

        await act(async () => {
            await result.current.handleAvatarChange(mockChangeEvent)
        })

        expect(uploadProfileAvatar).toHaveBeenCalledTimes(1)
        expect(mockNotifySuccess).toHaveBeenCalledWith("update")
        expect(mockRouterRefresh).toHaveBeenCalledTimes(1)
    })

    it("successfully removes avatar", async () => {
        vi.mocked(deleteAvatar).mockResolvedValueOnce({
            success: true,
        } as Awaited<ReturnType<typeof deleteAvatar>>)

        const { result } = renderHook(() =>
            useUserProfile(sampleUser, "user-1", "Employee"),
        )

        expect(result.current.avatarPreview).toBe(
            "https://example.com/avatar.jpg",
        )

        await act(async () => {
            await result.current.handleRemoveAvatar()
        })

        expect(result.current.avatarPreview).toBeNull()
        expect(deleteAvatar).toHaveBeenCalledWith({ userId: "user-1" })
        expect(mockNotifySuccess).toHaveBeenCalledWith("update")
        expect(mockRouterRefresh).toHaveBeenCalledTimes(1)
    })

    it("handles email verification request successfully", async () => {
        vi.mocked(sendProfileVerificationAction).mockResolvedValueOnce({
            success: true,
        } as Awaited<ReturnType<typeof sendProfileVerificationAction>>)

        const { result } = renderHook(() =>
            useUserProfile(sampleUser, "user-1", "Employee"),
        )

        await act(async () => {
            await result.current.handleVerifyEmail()
        })

        expect(sendProfileVerificationAction).toHaveBeenCalledTimes(1)
        expect(mockNotifySuccess).toHaveBeenCalledWith("emailVerified")
        expect(mockRouterPush).toHaveBeenCalledWith(
            `/verify-email?email=${encodeURIComponent("test@example.com")}`,
        )
    })
})
