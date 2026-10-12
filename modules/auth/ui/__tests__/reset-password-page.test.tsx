import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useResetPassword } from "../../hooks/use-reset-password"
import { ResetPasswordPage } from "../reset-password"

vi.mock("../../hooks/use-reset-password", () => ({
    useResetPassword: vi.fn(),
}))

type HookReturnType = ReturnType<typeof useResetPassword>

describe("ResetPasswordPage Component", () => {
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
        isPending: false,
        register: mockRegister,
        handleSubmit: mockHandleSubmit,
        onSubmit: mockOnSubmit,
        errors: {},
        isValid: false,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useResetPassword).mockReturnValue(defaultHookValues)
    })

    it("renders title, subtitle, password inputs, submit button and link correctly", () => {
        render(<ResetPasswordPage />)

        expect(
            screen.getByRole("heading", { name: /title/i }),
        ).toBeInTheDocument()
        expect(screen.getByText(/subtitle/i)).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: /submitbutton/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("link", { name: /gotosignin/i }),
        ).toHaveAttribute("href", "/login")
    })

    it("disables submit button when isValid is false or isPending is true", () => {
        render(<ResetPasswordPage />)

        const submitButton = screen.getByRole("button", {
            name: /submitbutton/i,
        })
        expect(submitButton).toBeDisabled()
    })

    it("enables submit button when isValid is true", () => {
        vi.mocked(useResetPassword).mockReturnValue({
            ...defaultHookValues,
            isValid: true,
        })

        render(<ResetPasswordPage />)

        const submitButton = screen.getByRole("button", {
            name: /submitbutton/i,
        })
        expect(submitButton).toBeEnabled()
    })

    it("displays server error message when serverError is provided", () => {
        vi.mocked(useResetPassword).mockReturnValue({
            ...defaultHookValues,
            serverError: "Token has expired",
        })

        render(<ResetPasswordPage />)

        const alertMessage = screen.getByRole("alert")
        expect(alertMessage).toHaveTextContent("Token has expired")
    })
})
