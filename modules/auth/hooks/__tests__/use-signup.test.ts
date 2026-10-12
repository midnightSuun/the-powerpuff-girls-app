import { act, renderHook } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { signup } from "../../api/signup"
import { useSignup } from "../use-signup"

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}))

vi.mock("../../api/signup", () => ({
    signup: vi.fn(),
}))

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        warning: vi.fn(),
    },
}))

describe("useSignup hook", () => {
    const mockPush = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useRouter).mockReturnValue({
            push: mockPush,
        } as unknown as ReturnType<typeof useRouter>)
    })

    it("initializes with default state", () => {
        const { result } = renderHook(() => useSignup())

        expect(result.current.showPassword).toBe(false)
        expect(result.current.showConfirmPassword).toBe(false)
        expect(result.current.serverError).toBeNull()
        expect(result.current.isPending).toBe(false)
        expect(typeof result.current.setShowPassword).toBe("function")
        expect(typeof result.current.setShowConfirmPassword).toBe("function")
        expect(typeof result.current.register).toBe("function")
        expect(typeof result.current.handleSubmit).toBe("function")
        expect(typeof result.current.onSubmit).toBe("function")
    })

    it("toggles password and confirm password visibility", () => {
        const { result } = renderHook(() => useSignup())

        expect(result.current.showPassword).toBe(false)
        expect(result.current.showConfirmPassword).toBe(false)

        act(() => {
            result.current.setShowPassword(true)
            result.current.setShowConfirmPassword(true)
        })

        expect(result.current.showPassword).toBe(true)
        expect(result.current.showConfirmPassword).toBe(true)
    })

    it("handles server error during signup", async () => {
        const errorMessage = "Email already exists"
        vi.mocked(signup).mockResolvedValue({ error: errorMessage })

        const { result } = renderHook(() => useSignup())

        await act(async () => {
            await result.current.onSubmit({
                email: "test@example.com",
                password: "password123",
                confirmPassword: "password123",
            })
        })

        expect(result.current.serverError).toBe(errorMessage)
        expect(mockPush).not.toHaveBeenCalled()
        expect(toast.success).not.toHaveBeenCalled()
    })

    it("handles successful signup with confirmation email sent", async () => {
        vi.mocked(signup).mockResolvedValue({
            redirectTo: "/verify",
            confirmationEmailSent: true,
        })

        const { result } = renderHook(() => useSignup())

        await act(async () => {
            await result.current.onSubmit({
                email: "test@example.com",
                password: "password123",
                confirmPassword: "password123",
            })
        })

        expect(result.current.serverError).toBeNull()
        expect(toast.success).toHaveBeenCalledWith("success", {
            description: "signupVerificationSent",
            closeButton: true,
        })
        expect(mockPush).toHaveBeenCalledWith("/verify")
    })

    it("handles successful signup when confirmation email failed to send", async () => {
        vi.mocked(signup).mockResolvedValue({
            redirectTo: "/verify",
            confirmationEmailSent: false,
        })

        const { result } = renderHook(() => useSignup())

        await act(async () => {
            await result.current.onSubmit({
                email: "test@example.com",
                password: "password123",
                confirmPassword: "password123",
            })
        })

        expect(result.current.serverError).toBeNull()
        expect(toast.warning).toHaveBeenCalledWith("warning", {
            description: "signupEmailNotSent",
            closeButton: true,
        })
        expect(mockPush).toHaveBeenCalledWith("/verify&sendFailed=true")
    })
})
