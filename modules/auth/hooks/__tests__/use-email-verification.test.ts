import { act, renderHook } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    sendVerificationAction,
    verifyMailAction,
} from "../../api/verification"
import { useEmailVerification } from "../use-email-verification"

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}))

vi.mock("../../api/verification", () => ({
    sendVerificationAction: vi.fn(),
    verifyMailAction: vi.fn(),
}))

describe("useEmailVerification hook", () => {
    const mockPush = vi.fn()
    const mockRefresh = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useRouter).mockReturnValue({
            push: mockPush,
            refresh: mockRefresh,
        } as unknown as ReturnType<typeof useRouter>)
    })

    it("initializes with default state and handles sendFailed flag", () => {
        const { result } = renderHook(() =>
            useEmailVerification("test@example.com", true, "token-123"),
        )

        expect(result.current.codeValue).toBe("")
        expect(result.current.serverError).toBe("verificationSendFailed")
        expect(result.current.statusMessage).toBeNull()
        expect(result.current.isPending).toBe(false)
        expect(result.current.isResending).toBe(false)
    })

    it("handles code changes and single digit inputs correctly", async () => {
        const { result } = renderHook(() =>
            useEmailVerification("test@example.com", false),
        )

        const mockFocus = vi.fn()
        result.current.inputRefs.current[1] = {
            focus: mockFocus,
        } as unknown as HTMLInputElement

        await act(async () => {
            result.current.handleChange("5", 0)
        })

        expect(result.current.codeValue).toBe("5")
        expect(mockFocus).toHaveBeenCalledTimes(1)
    })

    it("handles multi-digit paste/input correctly", async () => {
        const { result } = renderHook(() =>
            useEmailVerification("test@example.com", false),
        )

        const mockFocus = vi.fn()
        result.current.inputRefs.current[5] = {
            focus: mockFocus,
        } as unknown as HTMLInputElement

        await act(async () => {
            result.current.handleChange("12345678", 0)
        })

        expect(result.current.codeValue).toBe("123456")
    })

    it("handles clipboard paste event", async () => {
        const { result } = renderHook(() =>
            useEmailVerification("test@example.com", false),
        )

        const mockFocus = vi.fn()
        result.current.inputRefs.current[3] = {
            focus: mockFocus,
        } as unknown as HTMLInputElement

        const clipboardEvent = {
            clipboardData: {
                getData: () => "9876",
            },
            preventDefault: vi.fn(),
        } as unknown as React.ClipboardEvent<HTMLInputElement>

        await act(async () => {
            result.current.handlePaste(clipboardEvent)
        })

        expect(clipboardEvent.preventDefault).toHaveBeenCalled()
        expect(result.current.codeValue).toBe("9876")
    })

    it("handles Backspace keydown to move focus backwards", async () => {
        const { result } = renderHook(() =>
            useEmailVerification("test@example.com", false),
        )

        const mockPrevFocus = vi.fn()
        result.current.inputRefs.current[0] = {
            focus: mockPrevFocus,
            value: "",
        } as unknown as HTMLInputElement

        result.current.inputRefs.current[1] = {
            value: "",
        } as unknown as HTMLInputElement

        const keyEvent = {
            key: "Backspace",
        } as unknown as React.KeyboardEvent<HTMLInputElement>

        await act(async () => {
            result.current.handleKeyDown(keyEvent, 1)
        })

        expect(mockPrevFocus).toHaveBeenCalledTimes(1)
    })

    it("submits successfully and redirects to root", async () => {
        vi.mocked(verifyMailAction).mockResolvedValue({})

        const { result } = renderHook(() =>
            useEmailVerification("test@example.com", false, "token-123"),
        )

        await act(async () => {
            await result.current.onSubmit({ code: "123456" })
        })

        expect(verifyMailAction).toHaveBeenCalledWith("123456", "token-123")
        expect(mockPush).toHaveBeenCalledWith("/")
        expect(mockRefresh).toHaveBeenCalledTimes(1)
        expect(result.current.serverError).toBeNull()
    })

    it("handles server error on submit", async () => {
        vi.mocked(verifyMailAction).mockResolvedValue({
            error: "verificationInvalid",
        })

        const { result } = renderHook(() =>
            useEmailVerification("test@example.com", false),
        )

        await act(async () => {
            await result.current.onSubmit({ code: "000000" })
        })

        expect(result.current.serverError).toBe("verificationInvalid")
        expect(mockPush).not.toHaveBeenCalled()
    })

    it("handles resend success", async () => {
        vi.mocked(sendVerificationAction).mockResolvedValue({})

        const { result } = renderHook(() =>
            useEmailVerification("test@example.com", false),
        )

        await act(async () => {
            await result.current.handleResend()
        })

        expect(sendVerificationAction).toHaveBeenCalledWith("test@example.com")
        expect(result.current.statusMessage).toBe("verificationSent")
        expect(result.current.serverError).toBeNull()
    })

    it("handles resend failure", async () => {
        vi.mocked(sendVerificationAction).mockResolvedValue({
            error: "verificationSendFailed",
        })

        const { result } = renderHook(() =>
            useEmailVerification("test@example.com", false),
        )

        await act(async () => {
            await result.current.handleResend()
        })

        expect(result.current.serverError).toBe("verificationSendFailed")
        expect(result.current.statusMessage).toBeNull()
    })

    it("handles handleLater action", () => {
        const { result } = renderHook(() =>
            useEmailVerification("test@example.com", false),
        )

        act(() => {
            result.current.handleLater()
        })

        expect(mockPush).toHaveBeenCalledWith("/")
        expect(mockRefresh).toHaveBeenCalledTimes(1)
    })
})
