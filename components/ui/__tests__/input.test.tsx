import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Input } from "../input"

vi.mock("@base-ui/react/input", () => ({
    Input: ({
        className,
        disabled,
        value,
        defaultValue,
        placeholder,
        type,
        id,
        "aria-describedby": ariaDescribedBy,
        "aria-invalid": ariaInvalid,
        onChange,
        onFocus,
        onBlur,
        ...props
    }: {
        className?: string
        disabled?: boolean
        value?: string | number | readonly string[]
        defaultValue?: string | number | readonly string[]
        placeholder?: string
        type?: string
        id?: string
        "aria-describedby"?: string
        "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling"
        onChange?: React.ChangeEventHandler<HTMLInputElement>
        onFocus?: React.FocusEventHandler<HTMLInputElement>
        onBlur?: React.FocusEventHandler<HTMLInputElement>
    } & React.ComponentProps<"input">) => (
        <input
            data-slot="input"
            id={id}
            type={type}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            className={className}
            {...props}
        />
    ),
}))

vi.mock("@/lib/utils", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("Input component", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders input with placeholder and label", () => {
        render(<Input label="Username" placeholder="Enter username" />)

        expect(screen.getByText("Username")).toBeInTheDocument()
        expect(
            screen.getByPlaceholderText("Enter username"),
        ).toBeInTheDocument()
    })

    it("handles user typing and calls onChange", () => {
        const handleChange = vi.fn()
        render(<Input placeholder="Type here" onChange={handleChange} />)

        const input = screen.getByPlaceholderText("Type here")
        fireEvent.change(input, { target: { value: "Hello World" } })

        expect(input).toHaveValue("Hello World")
        expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it("displays error message and sets aria-invalid and aria-describedby", () => {
        render(<Input label="Email" error="Invalid email address" />)

        const errorMessage = screen.getByRole("alert")
        expect(errorMessage).toBeInTheDocument()
        expect(errorMessage).toHaveTextContent("Invalid email address")

        const input = screen.getByRole("textbox")
        expect(input).toHaveAttribute("aria-invalid", "true")
        expect(input).toHaveAttribute("aria-describedby")
    })

    it("renders endAdornment correctly", () => {
        render(
            <Input
                placeholder="Password"
                endAdornment={<span data-testid="end-icon">👁️</span>}
            />,
        )

        expect(screen.getByTestId("end-icon")).toBeInTheDocument()
    })

    it("applies disabled state correctly", () => {
        render(<Input disabled placeholder="Disabled input" />)

        const input = screen.getByPlaceholderText("Disabled input")
        expect(input).toBeDisabled()
    })

    it("handles focus and blur events correctly", () => {
        const handleFocus = vi.fn()
        const handleBlur = vi.fn()
        render(
            <Input
                placeholder="Focus test"
                label="Field"
                onFocus={handleFocus}
                onBlur={handleBlur}
            />,
        )

        const input = screen.getByPlaceholderText("Focus test")

        fireEvent.focus(input)
        expect(handleFocus).toHaveBeenCalledTimes(1)

        fireEvent.blur(input)
        expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it("handles uncontrolled input with defaultValue and internal state changes", () => {
        const handleChange = vi.fn()
        render(<Input defaultValue="Initial" onChange={handleChange} />)

        const input = screen.getByRole("textbox")
        expect(input).toHaveValue("Initial")

        fireEvent.change(input, { target: { value: "Updated" } })
        expect(input).toHaveValue("Updated")
        expect(handleChange).toHaveBeenCalledTimes(1)
    })
})
