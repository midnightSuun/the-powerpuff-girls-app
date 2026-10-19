import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { UserFormSelectField, UserFormTextField } from "../ui/user-form-field"

vi.mock("@/components/ui/input", () => ({
    Input: vi.fn(
        ({ label, placeholder, value, disabled, onChange, type, ...props }) => (
            <div data-testid="input-wrapper">
                {label && <label>{label}</label>}
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    disabled={disabled}
                    onChange={onChange}
                    {...props}
                />
            </div>
        ),
    ),
}))

describe("UserFormField Components", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("UserFormTextField", () => {
        it("renders with placeholder when showLabel is false and not disabled", () => {
            render(
                <UserFormTextField
                    label="First Name"
                    value="John"
                    showLabel={false}
                    onChange={vi.fn()}
                />,
            )

            const input = screen.getByRole("textbox")
            expect(input).toBeInTheDocument()
            expect(input).toHaveAttribute("placeholder", "First Name")
            expect(input).toHaveValue("John")
        })

        it("renders with label and no placeholder when showLabel is true", () => {
            render(
                <UserFormTextField
                    label="First Name"
                    value="John"
                    showLabel={true}
                    onChange={vi.fn()}
                />,
            )

            expect(screen.getByText("First Name")).toBeInTheDocument()
            const input = screen.getByRole("textbox")
            expect(input).not.toHaveAttribute("placeholder")
        })

        it("disables input and removes placeholder when disabled is true", () => {
            render(
                <UserFormTextField
                    label="First Name"
                    value="John"
                    showLabel={false}
                    disabled={true}
                    onChange={vi.fn()}
                />,
            )

            const input = screen.getByRole("textbox")
            expect(input).toBeDisabled()
            expect(input).not.toHaveAttribute("placeholder")
        })

        it("triggers onChange when text value changes", async () => {
            const handleChange = vi.fn()
            render(
                <UserFormTextField
                    label="First Name"
                    value="John"
                    showLabel={false}
                    onChange={handleChange}
                />,
            )

            const input = screen.getByRole("textbox")
            fireEvent.change(input, { target: { value: "Jane" } })

            expect(handleChange).toHaveBeenCalledWith("Jane")
        })
    })

    describe("UserFormSelectField", () => {
        const sampleOptions = [
            { id: "dep-1", name: "Engineering" },
            { id: "dep-2", name: "Marketing" },
        ]

        it("renders select without wrapper label when showLabel is false", () => {
            render(
                <UserFormSelectField
                    label="Department"
                    value=""
                    options={sampleOptions}
                    showLabel={false}
                    includeEmpty={true}
                    onChange={vi.fn()}
                />,
            )

            const select = screen.getByRole("combobox")
            expect(select).toBeInTheDocument()
            expect(
                document.querySelector(".absolute.left-0.top-0"),
            ).not.toBeInTheDocument()
        })

        it("renders select with wrapper label and FieldLabel when showLabel is true", () => {
            render(
                <UserFormSelectField
                    label="Department"
                    value="dep-1"
                    options={sampleOptions}
                    showLabel={true}
                    includeEmpty={false}
                    onChange={vi.fn()}
                />,
            )

            expect(screen.getByText("Department")).toBeInTheDocument()
            const select = screen.getByRole("combobox")
            expect(select).toBeInTheDocument()
        })

        it("triggers onChange when option is selected", async () => {
            const handleChange = vi.fn()
            render(
                <UserFormSelectField
                    label="Department"
                    value="dep-1"
                    options={sampleOptions}
                    showLabel={false}
                    includeEmpty={false}
                    onChange={handleChange}
                />,
            )

            const select = screen.getByRole("combobox")
            await userEvent.click(select)

            const option = screen.getByRole("option", { name: /Marketing/i })
            await userEvent.click(option)

            expect(handleChange).toHaveBeenCalledWith("dep-2")
        })
    })
})
