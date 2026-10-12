import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useEmailVerification } from "../../hooks/use-email-verification"
import { EmailVerification } from "../email-verification"

vi.mock("../../hooks/use-email-verification", () => ({
    useEmailVerification: vi.fn(),
}))

type HookReturnType = ReturnType<typeof useEmailVerification>

describe("EmailVerification Component", () => {
    const mockHandleSubmit: HookReturnType["handleSubmit"] = vi.fn(
        (cb) => async (e?: React.BaseSyntheticEvent) => {
            e?.preventDefault()
            await cb()
        },
    ) as unknown as HookReturnType["handleSubmit"]

    const mockOnSubmit = vi.fn()
    const mockHandleResend = vi.fn()
    const mockHandleLater = vi.fn()
    const mockHandleChange = vi.fn()
    const mockHandlePaste = vi.fn()
    const mockHandleKeyDown = vi.fn()

    const defaultHookValues: HookReturnType = {
        serverError: null,
        statusMessage: null,
        isPending: false,
        isResending: false,
        inputRefs: { current: [] },
        handleSubmit: mockHandleSubmit,
        onSubmit: mockOnSubmit,
        handleResend: mockHandleResend,
        handleLater: mockHandleLater,
        handleChange: mockHandleChange,
        handlePaste: mockHandlePaste,
        handleKeyDown: mockHandleKeyDown,
        codeValue: "",
        errors: {},
        isValid: false,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useEmailVerification).mockReturnValue(defaultHookValues)
    })

    it("renders title, subtitle with email, and 6 code inputs", () => {
        render(
            <EmailVerification email="test@example.com" sendFailed={false} />,
        )

        expect(
            screen.getByRole("heading", { name: /title/i }),
        ).toBeInTheDocument()
        expect(screen.getByText(/test@example.com/i)).toBeInTheDocument()

        const inputs = screen.getAllByRole("textbox")
        expect(inputs).toHaveLength(6)
    })

    it("disables submit button when isValid is false or isPending is true", () => {
        render(
            <EmailVerification email="test@example.com" sendFailed={false} />,
        )

        const submitButton = screen.getByRole("button", {
            name: /submitbutton/i,
        })
        expect(submitButton).toBeDisabled()
    })

    it("enables submit button when isValid is true", () => {
        vi.mocked(useEmailVerification).mockReturnValue({
            ...defaultHookValues,
            isValid: true,
        })

        render(
            <EmailVerification email="test@example.com" sendFailed={false} />,
        )

        const submitButton = screen.getByRole("button", {
            name: /submitbutton/i,
        })
        expect(submitButton).toBeEnabled()
    })

    it("displays server error message when serverError is provided", () => {
        vi.mocked(useEmailVerification).mockReturnValue({
            ...defaultHookValues,
            serverError: "Invalid verification code",
        })

        render(
            <EmailVerification email="test@example.com" sendFailed={false} />,
        )

        const alertMessage = screen.getByRole("alert")
        expect(alertMessage).toHaveTextContent("Invalid verification code")
    })

    it("displays status message when statusMessage is provided", () => {
        vi.mocked(useEmailVerification).mockReturnValue({
            ...defaultHookValues,
            statusMessage: "Code sent successfully",
        })

        render(
            <EmailVerification email="test@example.com" sendFailed={false} />,
        )

        const statusElement = screen.getByRole("status")
        expect(statusElement).toHaveTextContent("Code sent successfully")
    })

    it("triggers handleResend when resend button is clicked", () => {
        render(
            <EmailVerification email="test@example.com" sendFailed={false} />,
        )

        const resendButton = screen.getByRole("button", {
            name: /resendbutton/i,
        })
        fireEvent.click(resendButton)

        expect(mockHandleResend).toHaveBeenCalledTimes(1)
    })

    it("triggers handleLater when later button is clicked", () => {
        render(
            <EmailVerification email="test@example.com" sendFailed={false} />,
        )

        const laterButton = screen.getByRole("button", {
            name: /laterbutton/i,
        })
        fireEvent.click(laterButton)

        expect(mockHandleLater).toHaveBeenCalledTimes(1)
    })
})
