import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { requestPasswordReset } from "../../api/forgot-password"
import { useForgotPassword } from "../use-forgot-password"

vi.mock("../../api/forgot-password", () => ({
    requestPasswordReset: vi.fn(),
}))

describe("useForgotPassword hook", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("initializes with default state", () => {
        const { result } = renderHook(() => useForgotPassword())

        expect(result.current.serverError).toBeUndefined()
        expect(result.current.successMessage).toBeNull()
        expect(result.current.isPending).toBe(false)
        expect(typeof result.current.register).toBe("function")
        expect(typeof result.current.handleSubmit).toBe("function")
        expect(typeof result.current.onSubmit).toBe("function")
    })

    it("handles successful password reset request", async () => {
        vi.mocked(requestPasswordReset).mockResolvedValue({})

        const { result } = renderHook(() => useForgotPassword())

        await act(async () => {
            await result.current.onSubmit({ email: "test@example.com" })
        })

        expect(requestPasswordReset).toHaveBeenCalledWith("test@example.com")
        expect(result.current.serverError).toBeUndefined()
        expect(result.current.successMessage).toBe("forgotInstructionsSent")
    })

    it("handles server error during password reset request", async () => {
        vi.mocked(requestPasswordReset).mockResolvedValue({
            error: "User not found",
        })

        const { result } = renderHook(() => useForgotPassword())

        await act(async () => {
            await result.current.onSubmit({ email: "unknown@example.com" })
        })

        expect(requestPasswordReset).toHaveBeenCalledWith("unknown@example.com")
        expect(result.current.serverError).toBe("User not found")
        expect(result.current.successMessage).toBeNull()
    })
})
