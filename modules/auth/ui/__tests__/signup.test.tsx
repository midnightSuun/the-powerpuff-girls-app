import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useSignup } from "../../hooks/use-signup"
import { Signup } from "../signup"

vi.mock("../../hooks/use-signup", () => ({
    useSignup: vi.fn(),
}))

type HookReturnType = ReturnType<typeof useSignup>

describe("Signup Component", () => {
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
        showPassword: false,
        setShowPassword: vi.fn(),
        showConfirmPassword: false,
        setShowConfirmPassword: vi.fn(),
        serverError: null,
        isPending: false,
        register: mockRegister,
        handleSubmit: mockHandleSubmit,
        onSubmit: mockOnSubmit,
        errors: {},
        isValid: false,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useSignup).mockReturnValue(defaultHookValues)
    })

    const getSubmitButton = () => {
        const buttons = screen.getAllByRole("button", { name: /submitbutton/i })
        return (
            buttons.find((btn) => btn.getAttribute("type") === "submit") ||
            buttons[0]
        )
    }

    it("renders title, subtitle, inputs, submit button and link correctly", () => {
        render(<Signup />)

        expect(
            screen.getByRole("heading", { name: /title/i }),
        ).toBeInTheDocument()
        expect(screen.getByText(/subtitle/i)).toBeInTheDocument()
        expect(
            screen.getByRole("textbox", { name: /emailplaceholder/i }),
        ).toBeInTheDocument()
        expect(getSubmitButton()).toBeInTheDocument()
        expect(
            screen.getByRole("link", { name: /haveaccount/i }),
        ).toHaveAttribute("href", "/login")
    })

    it("disables submit button when isValid is false or isPending is true", () => {
        render(<Signup />)

        expect(getSubmitButton()).toBeDisabled()
    })

    it("enables submit button when isValid is true", () => {
        vi.mocked(useSignup).mockReturnValue({
            ...defaultHookValues,
            isValid: true,
        })

        render(<Signup />)

        expect(getSubmitButton()).toBeEnabled()
    })

    it("displays server error message when serverError is provided", () => {
        vi.mocked(useSignup).mockReturnValue({
            ...defaultHookValues,
            serverError: "Email already exists",
        })

        render(<Signup />)

        const alertMessage = screen.getByRole("alert")
        expect(alertMessage).toHaveTextContent("Email already exists")
    })
})
