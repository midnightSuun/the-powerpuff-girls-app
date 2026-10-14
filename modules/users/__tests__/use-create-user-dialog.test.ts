import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useActionNotifications } from "@/hooks/use-action-notifications"
import { useRouter } from "@/i18n/navigation"

import { createUser } from "../api/create-user"
import { useCreateUserDialog } from "../hooks/use-create-user-dialog"
import { useProfileOptions } from "../hooks/use-profile-options"

vi.mock("@/hooks/use-action-notifications", () => ({
    useActionNotifications: vi.fn(),
}))

vi.mock("@/i18n/navigation", () => ({
    useRouter: vi.fn(),
}))

vi.mock("../api/create-user", () => ({
    createUser: vi.fn(),
}))

vi.mock("../hooks/use-profile-options", () => ({
    useProfileOptions: vi.fn(),
}))

vi.mock("../user-role-options", () => ({
    getUserRoleOptions: vi.fn(() => [{ value: "Employee", label: "Employee" }]),
}))

describe("useCreateUserDialog Hook", () => {
    const mockNotifySuccess = vi.fn()
    const mockNotifyError = vi.fn()
    const mockRouterRefresh = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useActionNotifications).mockReturnValue({
            success: mockNotifySuccess,
            error: mockNotifyError,
        } as unknown as ReturnType<typeof useActionNotifications>)

        vi.mocked(useRouter).mockReturnValue({
            refresh: mockRouterRefresh,
            push: vi.fn(),
            replace: vi.fn(),
            prefetch: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
        } as unknown as ReturnType<typeof useRouter>)

        vi.mocked(useProfileOptions).mockReturnValue({
            departments: [{ id: "dep-1", name: "Engineering" }],
            positions: [{ id: "pos-1", name: "Developer" }],
        } as unknown as ReturnType<typeof useProfileOptions>)
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it("initializes with default closed state and empty form", () => {
        const { result } = renderHook(() => useCreateUserDialog())

        expect(result.current.isOpen).toBe(false)
        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.form).toEqual({
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            departmentId: "",
            positionId: "",
            role: "Employee",
        })
        expect(result.current.departments).toHaveLength(1)
        expect(result.current.positions).toHaveLength(1)
    })

    it("handles open change correctly and resets form when closing", () => {
        const { result } = renderHook(() => useCreateUserDialog())

        act(() => {
            result.current.handleChange("firstName", "John")
        })

        expect(result.current.form.firstName).toBe("John")

        act(() => {
            result.current.handleOpenChange(true)
        })
        expect(result.current.isOpen).toBe(true)

        act(() => {
            result.current.handleOpenChange(false)
        })
        expect(result.current.isOpen).toBe(false)
        expect(result.current.form.firstName).toBe("")
    })

    it("updates form fields correctly on change", () => {
        const { result } = renderHook(() => useCreateUserDialog())

        act(() => {
            result.current.handleChange("email", "test@example.com")
            result.current.handleChange("role", "Admin")
        })

        expect(result.current.form.email).toBe("test@example.com")
        expect(result.current.form.role).toBe("Admin")
    })

    it("successfully submits form, triggers notifications, resets state and refreshes router", async () => {
        vi.mocked(createUser).mockResolvedValueOnce({
            success: true,
            data: { id: "1" },
        } as unknown as Awaited<ReturnType<typeof createUser>>)

        const { result } = renderHook(() => useCreateUserDialog())

        act(() => {
            result.current.handleChange("email", "john@example.com")
        })

        const mockEvent = new SubmitEvent("submit", { cancelable: true })
        vi.spyOn(mockEvent, "preventDefault")

        await act(async () => {
            await result.current.handleSubmit(
                mockEvent as unknown as Parameters<
                    typeof result.current.handleSubmit
                >[0],
            )
        })

        expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
        expect(createUser).toHaveBeenCalledTimes(1)
        expect(mockNotifySuccess).toHaveBeenCalledWith("created")
        expect(mockRouterRefresh).toHaveBeenCalledTimes(1)
        expect(result.current.isOpen).toBe(false)
        expect(result.current.form.email).toBe("")
    })

    it("handles failure result from createUser action", async () => {
        vi.mocked(createUser).mockResolvedValueOnce({
            success: false,
            error: "emailAlreadyTaken",
        } as unknown as Awaited<ReturnType<typeof createUser>>)

        const { result } = renderHook(() => useCreateUserDialog())

        const mockEvent = new SubmitEvent("submit", { cancelable: true })
        vi.spyOn(mockEvent, "preventDefault")

        await act(async () => {
            await result.current.handleSubmit(
                mockEvent as unknown as Parameters<
                    typeof result.current.handleSubmit
                >[0],
            )
        })

        expect(mockNotifyError).toHaveBeenCalledWith("emailAlreadyTaken")
        expect(mockRouterRefresh).not.toHaveBeenCalled()
    })

    it("handles exceptions thrown during submission gracefully", async () => {
        vi.mocked(createUser).mockRejectedValueOnce(new Error("Network error"))

        const { result } = renderHook(() => useCreateUserDialog())

        const mockEvent = new SubmitEvent("submit", { cancelable: true })
        vi.spyOn(mockEvent, "preventDefault")

        await act(async () => {
            await result.current.handleSubmit(
                mockEvent as unknown as Parameters<
                    typeof result.current.handleSubmit
                >[0],
            )
        })

        expect(mockNotifyError).toHaveBeenCalledWith("createFailed")
        expect(result.current.isSubmitting).toBe(false)
    })
})
