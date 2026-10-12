import { act, renderHook } from "@testing-library/react"
import { toast } from "sonner"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { login } from "../../api/login"
import { AUTH_NOTIFICATION_STORAGE_KEY } from "../../consts"
import { useLogin } from "../use-login"

vi.mock("../../api/login", () => ({
    login: vi.fn(),
}))

vi.mock("sonner", () => ({
    toast: {
        error: vi.fn(),
    },
}))

describe("useLogin hook", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        sessionStorage.clear()
    })

    it("initializes with default state", () => {
        const { result } = renderHook(() => useLogin())

        expect(result.current.showPassword).toBe(false)
        expect(result.current.serverError).toBeUndefined()
        expect(result.current.isPending).toBe(false)
        expect(typeof result.current.setShowPassword).toBe("function")
        expect(typeof result.current.register).toBe("function")
        expect(typeof result.current.handleSubmit).toBe("function")
        expect(typeof result.current.onSubmit).toBe("function")
    })

    it("toggles password visibility", () => {
        const { result } = renderHook(() => useLogin())

        expect(result.current.showPassword).toBe(false)

        act(() => {
            result.current.setShowPassword(true)
        })

        expect(result.current.showPassword).toBe(true)
    })

    it("handles successful login submission", async () => {
        vi.mocked(login).mockResolvedValue({})

        const { result } = renderHook(() => useLogin())

        await act(async () => {
            await result.current.onSubmit({
                email: "test@example.com",
                password: "password123",
            })
        })

        expect(sessionStorage.getItem(AUTH_NOTIFICATION_STORAGE_KEY)).toBe(
            "login",
        )
        expect(login).toHaveBeenCalledTimes(1)

        const [initialState, formData] = vi.mocked(login).mock.calls[0]
        expect(initialState).toEqual({ error: undefined })
        expect(formData.get("email")).toBe("test@example.com")
        expect(formData.get("password")).toBe("password123")

        expect(result.current.serverError).toBeUndefined()
        expect(toast.error).not.toHaveBeenCalled()
    })

    it("handles server error during login", async () => {
        const errorMessage = "Invalid credentials"
        vi.mocked(login).mockResolvedValue({ error: errorMessage })

        const { result } = renderHook(() => useLogin())

        await act(async () => {
            await result.current.onSubmit({
                email: "test@example.com",
                password: "wrongpassword",
            })
        })

        expect(sessionStorage.getItem(AUTH_NOTIFICATION_STORAGE_KEY)).toBeNull()
        expect(result.current.serverError).toBe(errorMessage)
        expect(toast.error).toHaveBeenCalledWith("error", {
            description: errorMessage,
        })
    })
})
