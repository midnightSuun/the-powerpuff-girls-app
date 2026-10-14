import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useForgotPassword } from "../../hooks/use-forgot-password"
import { ForgotPasswordPage } from "../forgot-password"

vi.mock("../../hooks/use-forgot-password", () => ({
    useForgotPassword: vi.fn(),
}))

type HookReturnType = ReturnType<typeof useForgotPassword>

describe("ForgotPasswordPage Component", () => {
    const mockHandleSubmit: HookReturnType["handleSubmit"] = vi.fn(
        (cb) => async (e?: React.BaseSyntheticEvent) => {
            e?.preventDefault()
            await cb()
        },
    ) as unknown as HookReturnType["handleSubmit"]

    const mockOnSubmit = vi.fn()
    const mockRegister: HookReturnType["register"] = vi.fn(
        (fieldName: string) => ({
            name: fieldName,
            onChange: vi.fn(),
            onBlur: vi.fn(),
            ref: vi.fn(),
        }),
    ) as unknown as HookReturnType["register"]

    const defaultHookValues: HookReturnType = {
        serverError: undefined,
        successMessage: null,
        isPending: false,
        register: mockRegister,
        handleSubmit: mockHandleSubmit,
        onSubmit: mockOnSubmit,
        errors: {},
        isValid: false,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useForgotPassword).mockReturnValue(defaultHookValues)
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

    it("renders title, subtitle, input, submit button and cancel link correctly", () => {
        render(<ForgotPasswordPage />)

        expect(
            screen.getByRole("heading", { name: /title/i }),
        ).toBeInTheDocument()
        expect(screen.getByText(/subtitle/i)).toBeInTheDocument()
        expect(
            screen.getByRole("textbox", { name: /emaillabel/i }),
        ).toBeInTheDocument()
        expect(getSubmitButton()).toBeInTheDocument()
        expect(
            screen.getByRole("link", { name: /cancelbutton/i }),
        ).toHaveAttribute("href", "/login")
    })

    it("disables submit button when isValid is false or isPending is true", () => {
        render(<ForgotPasswordPage />)

        expect(getSubmitButton()).toBeDisabled()
    })

    it("enables submit button when isValid is true", () => {
        vi.mocked(useForgotPassword).mockReturnValue({
            ...defaultHookValues,
            isValid: true,
        })

        render(<ForgotPasswordPage />)

        expect(getSubmitButton()).toBeEnabled()
    })

    it("displays server error message when serverError is provided", () => {
        vi.mocked(useForgotPassword).mockReturnValue({
            ...defaultHookValues,
            serverError: "User not found",
        })

        render(<ForgotPasswordPage />)

        const alertMessage = screen.getByRole("alert")
        expect(alertMessage).toHaveTextContent("User not found")
    })
})
