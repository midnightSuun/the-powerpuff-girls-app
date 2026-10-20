import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Button } from "../button"

vi.mock("cn", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("Button component", () => {
    it("renders button correctly with default props", () => {
        render(<Button>Click me</Button>)

        const button = screen.getByRole("button", { name: "Click me" })
        expect(button).toBeInTheDocument()
        expect(button).toHaveAttribute("data-slot", "button")
        expect(button).toHaveAttribute("type", "button")
    })

    it("handles click events", () => {
        const handleClick = vi.fn()
        render(<Button onClick={handleClick}>Click</Button>)

        fireEvent.click(screen.getByRole("button", { name: "Click" }))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("renders with different variants correctly", () => {
        const { rerender } = render(<Button variant="primary">Primary</Button>)
        expect(screen.getByRole("button", { name: "Primary" })).toHaveClass(
            "bg-button-primary-default",
        )

        rerender(<Button variant="secondary">Secondary</Button>)
        expect(screen.getByRole("button", { name: "Secondary" })).toHaveClass(
            "bg-transparent",
        )

        rerender(<Button variant="primaryV2">Primary V2</Button>)
        expect(screen.getByRole("button", { name: "Primary V2" })).toHaveClass(
            "text-button-primary-default",
        )

        rerender(<Button variant="ghost">Ghost</Button>)
        expect(screen.getByRole("button", { name: "Ghost" })).toHaveClass(
            "text-button-secondary-default",
        )
    })

    it("renders with different sizes correctly", () => {
        const { rerender } = render(<Button size="default">Default</Button>)
        expect(
            screen.getByRole("button", { name: "Default" }),
        ).toBeInTheDocument()

        rerender(<Button size="sm">Small</Button>)
        expect(screen.getByRole("button", { name: "Small" })).toHaveClass("h-7")

        rerender(<Button size="lg">Large</Button>)
        expect(screen.getByRole("button", { name: "Large" })).toHaveClass("h-9")

        rerender(<Button size="icon">Icon</Button>)
        expect(screen.getByRole("button", { name: "Icon" })).toHaveClass(
            "size-8",
        )
    })

    it("can be disabled", () => {
        render(<Button disabled>Disabled</Button>)

        const button = screen.getByRole("button", { name: "Disabled" })
        expect(button).toBeDisabled()
    })
})
