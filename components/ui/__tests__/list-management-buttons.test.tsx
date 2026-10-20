import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AddItemButton, RemoveItemsButton } from "../list-management-buttons"

vi.mock("@/components/ui/button", () => ({
    Button: ({
        children,
        onClick,
        disabled,
        variant,
        className,
        "aria-label": ariaLabel,
        type,
    }: {
        children: ReactNode
        onClick?: () => void
        disabled?: boolean
        variant?: string
        className?: string
        "aria-label"?: string
        type?: "button" | "submit" | "reset"
    }) => (
        <button
            type={type ?? "button"}
            onClick={onClick}
            disabled={disabled}
            data-variant={variant}
            aria-label={ariaLabel}
            className={className}
        >
            {children}
        </button>
    ),
}))

describe("ListActionButtons components", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("AddItemButton", () => {
        it("renders label and calls onClick when clicked", () => {
            const handleClick = vi.fn()
            render(<AddItemButton label="Add New Item" onClick={handleClick} />)

            const button = screen.getByRole("button")
            expect(button).toBeInTheDocument()
            expect(screen.getByText("Add New Item")).toBeInTheDocument()

            fireEvent.click(button)
            expect(handleClick).toHaveBeenCalledTimes(1)
        })

        it("applies iconOnlyBelowLg styles and aria-label when specified", () => {
            render(<AddItemButton label="Add Item" iconOnlyBelowLg={true} />)

            const button = screen.getByRole("button", { name: "Add Item" })
            expect(button).toBeInTheDocument()
            expect(button).toHaveAttribute("aria-label", "Add Item")
        })

        it("disables button when disabled prop is true", () => {
            render(<AddItemButton label="Add" disabled={true} />)

            expect(screen.getByRole("button")).toBeDisabled()
        })
    })

    describe("RemoveItemsButton", () => {
        it("renders label and calls onClick when clicked", () => {
            const handleClick = vi.fn()
            render(
                <RemoveItemsButton
                    label="Delete Selected"
                    onClick={handleClick}
                />,
            )

            const button = screen.getByRole("button")
            expect(button).toBeInTheDocument()
            expect(screen.getByText("Delete Selected")).toBeInTheDocument()

            fireEvent.click(button)
            expect(handleClick).toHaveBeenCalledTimes(1)
        })

        it("disables button when disabled prop is true", () => {
            render(<RemoveItemsButton label="Remove" disabled={true} />)

            expect(screen.getByRole("button")).toBeDisabled()
        })
    })
})
