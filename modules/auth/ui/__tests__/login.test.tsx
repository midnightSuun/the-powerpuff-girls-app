import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useLogin } from "../../hooks/use-login"
import { Login } from "../login"

vi.mock("../../hooks/use-login", () => ({
    useLogin: vi.fn(),
}))

type HookReturnType = ReturnType<typeof useLogin>

describe("Login Component", () => {
    const mockHandleSubmit: HookReturnType["handleSubmit"] = vi.fn(
        (cb) => async (e?: React.BaseSyntheticEvent) => {
            e?.preventDefault()
            await cb()
        },
    ) as unknown as HookReturnType["handleSubmit"]

    const mockOnSubmit = vi.fn()
    const mockRegister: HookReturnType["register"] = vi.fn(() => ({
        name: "email",
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn(),
    })) as unknown as HookReturnType["register"]

    const defaultHookValues: HookReturnType = {
        showPassword: false,
        setShowPassword: vi.fn(),
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
        vi.mocked(useLogin).mockReturnValue(defaultHookValues)
    })

    it("renders title, subtitle, inputs, buttons and links correctly", () => {
        render(<Login />)

        expect(
            screen.getByRole("heading", { name: /title/i }),
        ).toBeInTheDocument()
        expect(screen.getByText(/subtitle/i)).toBeInTheDocument()
        expect(
            screen.getByRole("textbox", { name: /emailplaceholder/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: /submitbutton/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("link", { name: /forgotpassword/i }),
        ).toHaveAttribute("href", "/forgot-password")
    })

    it("disables submit button when isValid is false or isPending is true", () => {
        render(<Login />)

        const submitButton = screen.getByRole("button", {
            name: /submitbutton/i,
        })
        expect(submitButton).toBeDisabled()
    })

    it("enables submit button when isValid is true", () => {
        vi.mocked(useLogin).mockReturnValue({
            ...defaultHookValues,
            isValid: true,
        })

        render(<Login />)

        const submitButton = screen.getByRole("button", {
            name: /submitbutton/i,
        })
        expect(submitButton).toBeEnabled()
    })

    it("displays server error message when serverError is provided", () => {
        vi.mocked(useLogin).mockReturnValue({
            ...defaultHookValues,
            serverError: "Invalid credentials",
        })

        render(<Login />)

        const alertMessage = screen.getByRole("alert")
        expect(alertMessage).toHaveTextContent("Invalid credentials")
    })
})
