import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useRouter } from "@/i18n/navigation"

import { updateUser } from "../api/update-user"
import { useProfileOptions } from "../hooks/use-profile-options"
import {
    type EditableUser,
    useUpdateUserDialog,
} from "../hooks/use-update-user-dialog"

vi.mock("@/hooks/use-action-notifications", () => ({
    useActionNotifications: vi.fn(),
}))

vi.mock("@/i18n/navigation", () => ({
    useRouter: vi.fn(),
}))

vi.mock("../api/update-user", () => ({
    updateUser: vi.fn(),
}))

vi.mock("../hooks/use-profile-options", () => ({
    useProfileOptions: vi.fn(),
}))

vi.mock("../user-role-options", () => ({
    getUserRoleOptions: vi.fn(() => [{ value: "Employee", label: "Employee" }]),
}))

describe("useUpdateUserDialog Hook", () => {
    const mockNotifySuccess = vi.fn()
    const mockNotifyError = vi.fn()
    const mockNotifyWarning = vi.fn()
    const mockNotifyInfo = vi.fn()
    const mockRouterRefresh = vi.fn()

    const sampleUser: EditableUser = {
        id: "user-1",
        email: "john.doe@example.com",
        role: "Employee",
        profile: {
            first_name: "John",
            last_name: "Doe",
            avatar: null,
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

        vi.mocked(useRouter).mockReturnValue({
            refresh: mockRouterRefresh,
            push: vi.fn(),
            replace: vi.fn(),
            prefetch: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
        } as unknown as ReturnType<typeof useRouter>)

        vi.mocked(useProfileOptions).mockReturnValue({
            departments: sampleUser.department ? [sampleUser.department] : [],
            positions: sampleUser.position ? [sampleUser.position] : [],
        })
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it("initializes form state correctly from the provided user", () => {
        const { result } = renderHook(() =>
            useUpdateUserDialog(sampleUser, true),
        )

        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.form).toEqual({
            firstName: "John",
            lastName: "Doe",
            departmentId: "dep-1",
            positionId: "pos-1",
            role: "Employee",
        })
        expect(useProfileOptions).toHaveBeenCalledWith(
            true,
            sampleUser.department,
            sampleUser.position,
        )
    })

    it("syncs form state when user prop changes (render-phase update)", () => {
        const { result, rerender } = renderHook(
            ({ user, isOpen }: { user: EditableUser; isOpen: boolean }) =>
                useUpdateUserDialog(user, isOpen),
            {
                initialProps: { user: sampleUser, isOpen: true },
            },
        )

        expect(result.current.form.firstName).toBe("John")

        const updatedUser: EditableUser = {
            ...sampleUser,
            profile: { first_name: "Jane", last_name: "Doe", avatar: null },
        }

        rerender({ user: updatedUser, isOpen: true })

        expect(result.current.form.firstName).toBe("Jane")
    })

    it("updates form fields correctly on change", () => {
        const { result } = renderHook(() =>
            useUpdateUserDialog(sampleUser, true),
        )

        act(() => {
            result.current.handleChange("firstName", "Alex")
            result.current.handleChange("role", "Admin")
        })

        expect(result.current.form.firstName).toBe("Alex")
        expect(result.current.form.role).toBe("Admin")
    })

    it("successfully submits form, triggers notifications, refreshes router and returns true", async () => {
        vi.mocked(updateUser).mockResolvedValueOnce({
            success: true,
            data: { id: "user-1" },
        } as Awaited<ReturnType<typeof updateUser>>)

        const { result } = renderHook(() =>
            useUpdateUserDialog(sampleUser, true),
        )

        act(() => {
            result.current.handleChange("firstName", "Updated")
        })

        const mockEvent = new SubmitEvent("submit", { cancelable: true })
        vi.spyOn(mockEvent, "preventDefault")

        let successResult = false
        await act(async () => {
            const res = await result.current.handleSubmit(
                mockEvent as unknown as Parameters<
                    typeof result.current.handleSubmit
                >[0],
            )
            successResult = res ?? false
        })

        expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
        expect(updateUser).toHaveBeenCalledWith({
            userId: "user-1",
            firstName: "Updated",
            lastName: "Doe",
            departmentId: "dep-1",
            positionId: "pos-1",
            role: "Employee",
        })
        expect(mockNotifySuccess).toHaveBeenCalledWith("updated")
        expect(mockRouterRefresh).toHaveBeenCalledTimes(1)
        expect(successResult).toBe(true)
    })

    it("handles failure result from updateUser action and returns false", async () => {
        vi.mocked(updateUser).mockResolvedValueOnce({
            success: false,
            error: "updateForbidden",
        } as Awaited<ReturnType<typeof updateUser>>)

        const { result } = renderHook(() =>
            useUpdateUserDialog(sampleUser, true),
        )

        const mockEvent = new SubmitEvent("submit", { cancelable: true })
        vi.spyOn(mockEvent, "preventDefault")

        let successResult = false
        await act(async () => {
            const res = await result.current.handleSubmit(
                mockEvent as unknown as Parameters<
                    typeof result.current.handleSubmit
                >[0],
            )
            successResult = res ?? false
        })

        expect(mockNotifyError).toHaveBeenCalledWith("updateForbidden")
        expect(mockRouterRefresh).not.toHaveBeenCalled()
        expect(successResult).toBe(false)
    })

    it("handles exceptions thrown during submission gracefully and returns false", async () => {
        vi.mocked(updateUser).mockRejectedValueOnce(new Error("Network error"))

        const { result } = renderHook(() =>
            useUpdateUserDialog(sampleUser, true),
        )

        const mockEvent = new SubmitEvent("submit", { cancelable: true })
        vi.spyOn(mockEvent, "preventDefault")

        let successResult = false
        await act(async () => {
            const res = await result.current.handleSubmit(
                mockEvent as unknown as Parameters<
                    typeof result.current.handleSubmit
                >[0],
            )
            successResult = res ?? false
        })

        expect(mockNotifyError).toHaveBeenCalledWith("updateFailed")
        expect(result.current.isSubmitting).toBe(false)
        expect(successResult).toBe(false)
    })

    it("prevents concurrent submissions using ref flag during ongoing submission", async () => {
        let resolveUpdate: (value: unknown) => void = () => {}
        const updatePromise = new Promise((resolve) => {
            resolveUpdate = resolve
        })

        vi.mocked(updateUser).mockReturnValueOnce(
            updatePromise as unknown as ReturnType<typeof updateUser>,
        )

        const { result } = renderHook(() =>
            useUpdateUserDialog(sampleUser, true),
        )

        const mockEvent = new SubmitEvent("submit", { cancelable: true })

        const firstSubmission = result.current.handleSubmit(
            mockEvent as unknown as Parameters<
                typeof result.current.handleSubmit
            >[0],
        )

        const secondResult = await result.current.handleSubmit(
            mockEvent as unknown as Parameters<
                typeof result.current.handleSubmit
            >[0],
        )

        expect(secondResult).toBeUndefined()
        expect(updateUser).toHaveBeenCalledTimes(1)

        resolveUpdate({ success: true, data: { id: "user-1" } })
        await firstSubmission
    })

    it("uses fallback error message when no error provided from updateUser", async () => {
        vi.mocked(updateUser).mockResolvedValueOnce({
            success: false,
        } as Awaited<ReturnType<typeof updateUser>>)

        const { result } = renderHook(() =>
            useUpdateUserDialog(sampleUser, true),
        )

        const mockEvent = new SubmitEvent("submit", { cancelable: true })

        let successResult = false
        await act(async () => {
            const res = await result.current.handleSubmit(
                mockEvent as unknown as Parameters<
                    typeof result.current.handleSubmit
                >[0],
            )
            successResult = res ?? false
        })

        expect(mockNotifyError).toHaveBeenCalledWith("updateFailed")
        expect(successResult).toBe(false)
    })

    it("handles user with missing profile fields", () => {
        const userWithMissingFields: EditableUser = {
            ...sampleUser,
            profile: {
                first_name: null,
                last_name: null,
                avatar: null,
            },
            department: null,
            position: null,
        }

        const { result } = renderHook(() =>
            useUpdateUserDialog(userWithMissingFields, true),
        )

        expect(result.current.form).toEqual({
            firstName: "",
            lastName: "",
            departmentId: "",
            positionId: "",
            role: "Employee",
        })
    })

    it("handles null department and position", () => {
        const userWithNullAssignments: EditableUser = {
            ...sampleUser,
            department: null,
            position: null,
        }

        const { result } = renderHook(() =>
            useUpdateUserDialog(userWithNullAssignments, true),
        )

        expect(result.current.form.departmentId).toBe("")
        expect(result.current.form.positionId).toBe("")
    })

    it("returns roleOptions from getUserRoleOptions", () => {
        const { result } = renderHook(() =>
            useUpdateUserDialog(sampleUser, true),
        )

        expect(result.current.roleOptions).toEqual([
            { value: "Employee", label: "Employee" },
        ])
    })

    it("calls useProfileOptions with correct parameters", () => {
        const { rerender } = renderHook(
            ({ isOpen }: { isOpen: boolean }) =>
                useUpdateUserDialog(sampleUser, isOpen),
            {
                initialProps: { isOpen: false },
            },
        )

        expect(useProfileOptions).toHaveBeenCalledWith(
            false,
            sampleUser.department,
            sampleUser.position,
        )

        rerender({ isOpen: true })

        expect(useProfileOptions).toHaveBeenCalledWith(
            true,
            sampleUser.department,
            sampleUser.position,
        )
    })

    it("preserves form state when isOpen changes", () => {
        const { result, rerender } = renderHook(
            ({ isOpen }: { isOpen: boolean }) =>
                useUpdateUserDialog(sampleUser, isOpen),
            {
                initialProps: { isOpen: true },
            },
        )

        act(() => {
            result.current.handleChange("firstName", "Modified")
        })

        expect(result.current.form.firstName).toBe("Modified")

        rerender({ isOpen: false })

        expect(result.current.form.firstName).toBe("Modified")
    })

    it("correctly casts string to UserRole when changing role field", () => {
        const { result } = renderHook(() =>
            useUpdateUserDialog(sampleUser, true),
        )

        act(() => {
            result.current.handleChange("role", "Admin")
        })

        expect(result.current.form.role).toBe("Admin")
    })
})
