import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { PasswordField } from "../password-field"
vi.mock("@/components/ui/input", () => ({
    Input: ({
        type,
        label,
        error,
        placeholder,
        className,
        endAdornment,
        ...props
    }: {
        type?: string
        label?: string
        error?: string
        placeholder?: string
        className?: string
        endAdornment?: React.ReactNode
        [key: string]: unknown
    }) => (
        <div data-testid="input-wrapper" className={className}>
            {label && <label>{label}</label>}
            <input type={type} placeholder={placeholder} {...props} />
            {error && <span data-testid="error-message">{error}</span>}
            <div data-testid="end-adornment">{endAdornment}</div>
        </div>
    ),
}))

vi.mock("lucide-react", () => ({
    Eye: () => <svg data-testid="eye-icon" />,
    EyeOff: () => <svg data-testid="eye-icon-off" />,
}))

describe("PasswordField", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders with default password type and shows Eye icon", () => {
        render(<PasswordField placeholder="Enter password" label="Password" />)

        const input = screen.getByPlaceholderText("Enter password")
        expect(input).toHaveAttribute("type", "password")
        expect(screen.getByText("Password")).toBeInTheDocument()
        expect(screen.getByTestId("eye-icon")).toBeInTheDocument()
        expect(screen.queryByTestId("eye-icon-off")).not.toBeInTheDocument()
    })

    it("toggles password visibility when toggle button is clicked", () => {
        render(<PasswordField placeholder="Enter password" />)

        const input = screen.getByPlaceholderText("Enter password")
        const toggleButton = screen.getByRole("button")

        expect(input).toHaveAttribute("type", "password")
        expect(screen.getByTestId("eye-icon")).toBeInTheDocument()

        fireEvent.click(toggleButton)

        expect(input).toHaveAttribute("type", "text")
        expect(screen.getByTestId("eye-icon-off")).toBeInTheDocument()
        expect(screen.queryByTestId("eye-icon")).not.toBeInTheDocument()

        fireEvent.click(toggleButton)

        expect(input).toHaveAttribute("type", "password")
        expect(screen.getByTestId("eye-icon")).toBeInTheDocument()
    })

    it("passes error, custom className and extra props correctly", () => {
        render(
            <PasswordField
                error="Required field"
                className="custom-password-class"
                maxLength={20}
                data-testid="pass-input"
            />,
        )

        expect(screen.getByTestId("error-message")).toHaveTextContent(
            "Required field",
        )
        expect(screen.getByTestId("input-wrapper")).toHaveClass(
            "custom-password-class",
        )
    })
})
