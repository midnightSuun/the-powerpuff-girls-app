import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

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

    const defaultHookValues: HookReturnType = {
        serverError: null,
        statusMessage: null,
        isPending: false,
        isResending: false,
        codeValue: "",
        inputRefs: { current: [] },
        handleChange: vi.fn(),
        handleKeyDown: vi.fn(),
        handlePaste: vi.fn(),
        handleSubmit: mockHandleSubmit,
        onSubmit: mockOnSubmit,
        handleResend: mockHandleResend,
        handleLater: mockHandleLater,
        errors: {},
        isValid: false,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useEmailVerification).mockReturnValue(defaultHookValues)
    })

    afterEach(() => {
        cleanup()
    })

    const getSubmitButton = () => {
        const buttons = screen.getAllByRole("button", { name: /submitbutton/i })
        return (
            buttons.find((btn) => btn.getAttribute("type") === "submit") ||
            buttons[0]
        )
    }

    const getResendButton = () => {
        return screen.getAllByRole("button", { name: /resendbutton/i })[0]
    }

    const getLaterButton = () => {
        return screen.getAllByRole("button", { name: /laterbutton/i })[0]
    }

    it("renders title, subtitle, code inputs and buttons correctly", () => {
        render(
            <EmailVerification email="test@example.com" sendFailed={false} />,
        )

        expect(
            screen.getByRole("heading", { name: /title/i }),
        ).toBeInTheDocument()
        expect(screen.getByText(/subtitle/i)).toBeInTheDocument()
        expect(getSubmitButton()).toBeInTheDocument()
        expect(getResendButton()).toBeInTheDocument()
        expect(getLaterButton()).toBeInTheDocument()
    })

    it("disables submit button when isValid is false or isPending is true", () => {
        render(
            <EmailVerification email="test@example.com" sendFailed={false} />,
        )

        expect(getSubmitButton()).toBeDisabled()
    })

    it("enables submit button when isValid is true", () => {
        vi.mocked(useEmailVerification).mockReturnValue({
            ...defaultHookValues,
            isValid: true,
        })

        render(
            <EmailVerification email="test@example.com" sendFailed={false} />,
        )

        expect(getSubmitButton()).toBeEnabled()
    })

    it("triggers handleResend when resend button is clicked", () => {
        render(
            <EmailVerification email="test@example.com" sendFailed={false} />,
        )

        fireEvent.click(getResendButton())
        expect(mockHandleResend).toHaveBeenCalledTimes(1)
    })

    it("triggers handleLater when later button is clicked", () => {
        render(
            <EmailVerification email="test@example.com" sendFailed={false} />,
        )

        fireEvent.click(getLaterButton())
        expect(mockHandleLater).toHaveBeenCalledTimes(1)
    })
})
