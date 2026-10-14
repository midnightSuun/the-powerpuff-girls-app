import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { PasswordField } from "../password-field"

describe("PasswordField", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders with default password type and shows Eye icon", () => {
        render(<PasswordField placeholder="Enter password" label="Password" />)

        const input = screen.getByPlaceholderText("Enter password")
        expect(input).toHaveAttribute("type", "password")
        expect(screen.getByText("Password")).toBeInTheDocument()
        expect(document.querySelector(".lucide-eye")).toBeInTheDocument()
        expect(
            document.querySelector(".lucide-eye-off"),
        ).not.toBeInTheDocument()
    })

    it("toggles password visibility when toggle button is clicked", () => {
        render(<PasswordField placeholder="Enter password" />)

        const input = screen.getByPlaceholderText("Enter password")
        const toggleButton = screen.getByRole("button")

        expect(input).toHaveAttribute("type", "password")
        expect(document.querySelector(".lucide-eye")).toBeInTheDocument()
        expect(
            document.querySelector(".lucide-eye-off"),
        ).not.toBeInTheDocument()

        fireEvent.click(toggleButton)

        expect(input).toHaveAttribute("type", "text")
        expect(document.querySelector(".lucide-eye-off")).toBeInTheDocument()
        expect(document.querySelector(".lucide-eye")).not.toBeInTheDocument()

        fireEvent.click(toggleButton)

        expect(input).toHaveAttribute("type", "password")
        expect(document.querySelector(".lucide-eye")).toBeInTheDocument()
        expect(
            document.querySelector(".lucide-eye-off"),
        ).not.toBeInTheDocument()
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

        expect(screen.getByRole("alert")).toHaveTextContent("Required field")
        expect(screen.getByTestId("pass-input")).toHaveClass(
            "custom-password-class",
        )
    })
})
