import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { CreateCvTriggerButton } from "../components/add-cv-button"

vi.mock("@/components/ui/list-management-buttons", () => ({
    AddItemButton: ({
        label,
        onClick,
        disabled,
        className,
    }: {
        label: string
        onClick: () => void
        disabled?: boolean
        className?: string
        iconOnlyBelowLg?: boolean
    }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={className}
        >
            {label}
        </button>
    ),
}))

describe("CreateCvTriggerButton", () => {
    beforeEach(() => {
        cleanup()
    })

    afterEach(() => {
        cleanup()
    })

    it("renders with translated label and correct styles", () => {
        render(<CreateCvTriggerButton onClick={vi.fn()} />)

        const button = screen.getByRole("button", { name: "create" })
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass("text-red-600", "font-semibold")
        expect(button).not.toBeDisabled()
    })

    it("calls onClick when clicked", async () => {
        const handleClick = vi.fn()
        const user = userEvent.setup()

        render(<CreateCvTriggerButton onClick={handleClick} />)

        const button = screen.getByRole("button", { name: "create" })
        await user.click(button)

        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("can be disabled when disabled prop is passed", () => {
        render(<CreateCvTriggerButton onClick={vi.fn()} disabled />)

        const button = screen.getByRole("button", { name: "create" })
        expect(button).toBeDisabled()
    })
})
