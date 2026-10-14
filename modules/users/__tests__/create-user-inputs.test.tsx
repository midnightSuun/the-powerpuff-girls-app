import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
    CreateUserPasswordInput,
    CreateUserSelect,
} from "../ui/create-user-fields"

describe("CreateUserPasswordInput Component", () => {
    it("renders password input with correct placeholder and masked type by default", () => {
        render(<CreateUserPasswordInput label="Password" value="" />)

        const input = screen.getByLabelText("Password")
        expect(input).toHaveAttribute("type", "password")
        expect(input).toHaveAttribute("placeholder", "Password")
    })

    it("toggles password visibility when toggle button is clicked", async () => {
        render(<CreateUserPasswordInput label="Password" value="secret123" />)

        const input = screen.getByLabelText("Password")
        expect(input).toHaveAttribute("type", "password")

        // Ищем кнопку по aria-label вместо роли и имени
        const toggleButton = screen.getByLabelText(/showpassword/i)
        expect(toggleButton).toHaveAttribute("aria-pressed", "false")

        await userEvent.click(toggleButton)

        expect(input).toHaveAttribute("type", "text")
        expect(toggleButton).toHaveAttribute("aria-pressed", "true")
    })

    it("triggers onChange when user types into the password input", async () => {
        const handleChange = vi.fn()
        render(
            <CreateUserPasswordInput
                label="Password"
                value=""
                onChange={handleChange}
            />,
        )

        const input = screen.getByLabelText("Password")
        await userEvent.type(input, "new-password")

        expect(handleChange).toHaveBeenCalled()
    })

    it("renders as disabled when disabled prop is true", () => {
        render(<CreateUserPasswordInput label="Password" value="" disabled />)

        const input = screen.getByLabelText("Password")
        expect(input).toBeDisabled()
    })
})

describe("CreateUserSelect Component", () => {
    const mockOptions = [
        { id: "opt-1", name: "Option 1" },
        { id: "opt-2", name: "Option 2" },
    ]

    it("renders select with label placeholder by default", () => {
        render(
            <CreateUserSelect
                label="Select Department"
                value=""
                options={mockOptions}
                onChange={vi.fn()}
            />,
        )

        const select = screen.getByRole("combobox", {
            name: "Select Department",
        })
        expect(select).toBeInTheDocument()
        expect(
            screen.getByRole("option", { name: "Select Department" }),
        ).toHaveValue("")
        expect(screen.getByRole("option", { name: "Option 1" })).toHaveValue(
            "opt-1",
        )
    })

    it("omits empty placeholder option when includeEmpty is false", () => {
        render(
            <CreateUserSelect
                label="Select Department"
                value="opt-1"
                options={mockOptions}
                includeEmpty={false}
                onChange={vi.fn()}
            />,
        )

        const select = screen.getByRole("combobox", {
            name: "Select Department",
        })
        expect(select).toHaveValue("opt-1")
        expect(
            screen.queryByRole("option", { name: "Select Department" }),
        ).not.toBeInTheDocument()
    })

    it("calls onChange when a new option is selected", async () => {
        const handleChange = vi.fn()
        render(
            <CreateUserSelect
                label="Select Department"
                value=""
                options={mockOptions}
                onChange={handleChange}
            />,
        )

        const select = screen.getByRole("combobox", {
            name: "Select Department",
        })
        await userEvent.selectOptions(select, "opt-2")

        expect(handleChange).toHaveBeenCalledWith("opt-2")
    })

    it("respects disabled state", () => {
        render(
            <CreateUserSelect
                label="Select Department"
                value=""
                options={mockOptions}
                disabled
                onChange={vi.fn()}
            />,
        )

        const select = screen.getByRole("combobox", {
            name: "Select Department",
        })
        expect(select).toBeDisabled()
    })
})
