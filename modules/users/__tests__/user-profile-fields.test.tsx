import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
    UserProfileSelect,
    UserProfileTextField,
} from "../ui/user-profile-field"

vi.mock("@/components/ui/input", () => ({
    Input: vi.fn(
        ({
            label,
            value,
            disabled,
            error,
            onChange,
            id,
            placeholder,
            maxLength,
        }) => (
            <div data-testid="input-wrapper">
                <label htmlFor={id}>{label}</label>
                <input
                    id={id}
                    type="text"
                    placeholder={placeholder}
                    maxLength={maxLength}
                    value={value}
                    disabled={disabled}
                    onChange={onChange}
                />
                {error ? <span data-testid="input-error">{error}</span> : null}
            </div>
        ),
    ),
}))

describe("UserProfile Fields Components", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("UserProfileTextField", () => {
        it("renders text field with label, value, and attributes correctly", () => {
            render(
                <UserProfileTextField
                    id="first-name"
                    label="First Name"
                    value="John"
                    disabled={false}
                    onChange={vi.fn()}
                />,
            )

            const input = screen.getByRole("textbox", { name: "First Name" })
            expect(input).toBeInTheDocument()
            expect(input).toHaveValue("John")
            expect(input).not.toBeDisabled()
            expect(input).toHaveAttribute("maxLength", "100")
        })

        it("disables input when disabled prop is true", () => {
            render(
                <UserProfileTextField
                    id="first-name"
                    label="First Name"
                    value="John"
                    disabled={true}
                    onChange={vi.fn()}
                />,
            )

            const input = screen.getByRole("textbox", { name: "First Name" })
            expect(input).toBeDisabled()
        })

        it("displays error message when error prop is provided", () => {
            render(
                <UserProfileTextField
                    id="first-name"
                    label="First Name"
                    value="John"
                    disabled={false}
                    error="Field is required"
                    onChange={vi.fn()}
                />,
            )

            expect(screen.getByTestId("input-error")).toHaveTextContent(
                "Field is required",
            )
        })

        it("triggers onChange when text value changes", () => {
            const handleChange = vi.fn()
            render(
                <UserProfileTextField
                    id="first-name"
                    label="First Name"
                    value="John"
                    disabled={false}
                    onChange={handleChange}
                />,
            )

            const input = screen.getByRole("textbox", { name: "First Name" })
            fireEvent.change(input, { target: { value: "Jane" } })

            expect(handleChange).toHaveBeenCalledWith("Jane")
        })
    })

    describe("UserProfileSelect", () => {
        const sampleOptions = [
            { id: "dep-1", name: "Engineering" },
            { id: "dep-2", name: "Marketing" },
        ]

        it("renders select field with label, placeholder, and options correctly", () => {
            render(
                <UserProfileSelect
                    label="Department"
                    placeholder="Select department"
                    value="dep-1"
                    options={sampleOptions}
                    disabled={false}
                    onChange={vi.fn()}
                />,
            )

            expect(screen.getByText("Department")).toBeInTheDocument()
            const select = screen.getByRole("combobox")
            expect(select).toBeInTheDocument()
            expect(select).toHaveValue("dep-1")
            expect(
                screen.getByRole("option", { name: "Select department" }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole("option", { name: "Engineering" }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole("option", { name: "Marketing" }),
            ).toBeInTheDocument()
        })

        it("disables select when disabled prop is true", () => {
            render(
                <UserProfileSelect
                    label="Department"
                    placeholder="Select department"
                    value="dep-1"
                    options={sampleOptions}
                    disabled={true}
                    onChange={vi.fn()}
                />,
            )

            const select = screen.getByRole("combobox")
            expect(select).toBeDisabled()
        })

        it("displays error message and sets aria-invalid when error is provided", () => {
            render(
                <UserProfileSelect
                    label="Department"
                    placeholder="Select department"
                    value="dep-1"
                    options={sampleOptions}
                    disabled={false}
                    error="Invalid selection"
                    onChange={vi.fn()}
                />,
            )

            const select = screen.getByRole("combobox")
            expect(select).toHaveAttribute("aria-invalid", "true")
            expect(screen.getByText("Invalid selection")).toBeInTheDocument()
        })

        it("triggers onChange when a new option is selected", async () => {
            const handleChange = vi.fn()
            render(
                <UserProfileSelect
                    label="Department"
                    placeholder="Select department"
                    value="dep-1"
                    options={sampleOptions}
                    disabled={false}
                    onChange={handleChange}
                />,
            )

            const select = screen.getByRole("combobox")
            await userEvent.selectOptions(select, "dep-2")

            expect(handleChange).toHaveBeenCalledWith("dep-2")
        })
    })
})
