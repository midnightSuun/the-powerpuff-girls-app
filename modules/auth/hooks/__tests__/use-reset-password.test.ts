import { act, renderHook } from "@testing-library/react"
import { useRouter, useSearchParams } from "next/navigation"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { resetPasswordAction } from "../../api/reset-password"
import { useResetPassword } from "../use-reset-password"

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
    useSearchParams: vi.fn(),
}))

vi.mock("../../api/reset-password", () => ({
    resetPasswordAction: vi.fn(),
}))

describe("useResetPassword hook", () => {
    const mockPush = vi.fn()
    const mockGet = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useRouter).mockReturnValue({
            push: mockPush,
        } as unknown as ReturnType<typeof useRouter>)
        vi.mocked(useSearchParams).mockReturnValue({
            get: mockGet,
        } as unknown as ReturnType<typeof useSearchParams>)
    })

    it("initializes and sets server error if token is missing on submit", async () => {
        mockGet.mockReturnValue(null)

        const { result } = renderHook(() => useResetPassword())

        expect(result.current.serverError).toBeUndefined()
        expect(result.current.isPending).toBe(false)

        await act(async () => {
            await result.current.onSubmit({
                newPassword: "newPassword123",
                confirmPassword: "newPassword123",
            })
        })

        expect(result.current.serverError).toBe("resetTokenInvalid")
        expect(resetPasswordAction).not.toHaveBeenCalled()
        expect(mockPush).not.toHaveBeenCalled()
    })

    it("handles successful password reset submission", async () => {
        mockGet.mockReturnValue("valid-token-xyz")
        vi.mocked(resetPasswordAction).mockResolvedValue({})

        const { result } = renderHook(() => useResetPassword())

        await act(async () => {
            await result.current.onSubmit({
                newPassword: "newPassword123",
                confirmPassword: "newPassword123",
            })
        })

        expect(resetPasswordAction).toHaveBeenCalledWith(
            {
                newPassword: "newPassword123",
                confirmPassword: "newPassword123",
            },
            "valid-token-xyz",
        )
        expect(result.current.serverError).toBeUndefined()
        expect(mockPush).toHaveBeenCalledWith("/login?reset=success")
    })

    it("handles server error during password reset", async () => {
        mockGet.mockReturnValue("valid-token-xyz")
        const errorMessage = "Token expired"
        vi.mocked(resetPasswordAction).mockResolvedValue({
            error: errorMessage,
        })

        const { result } = renderHook(() => useResetPassword())

        await act(async () => {
            await result.current.onSubmit({
                newPassword: "newPassword123",
                confirmPassword: "newPassword123",
            })
        })

        expect(result.current.serverError).toBe(errorMessage)
        expect(mockPush).not.toHaveBeenCalled()
    })
})
