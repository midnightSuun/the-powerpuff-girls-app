import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ProgressListItem } from "../progress-list-item"

vi.mock("@/components/ui/progress-item", () => ({
    ProgressItem: ({
        name,
        mastery,
        isSelected,
    }: {
        name: string
        mastery: string | number
        isSelected?: boolean
    }) => (
        <div data-testid="progress-item" data-selected={isSelected}>
            <span>{name}</span>
            <span>{mastery}</span>
        </div>
    ),
}))

describe("ProgressListItem component", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders as non-interactive div when neither isSelectionMode nor onEdit is provided", () => {
        render(<ProgressListItem name="React" mastery="Expert" />)

        expect(screen.getByText("React")).toBeInTheDocument()
        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("renders as interactive button and calls onEdit when clicked and not in selection mode", () => {
        const handleEdit = vi.fn()
        render(
            <ProgressListItem
                name="TypeScript"
                mastery="Advanced"
                onEdit={handleEdit}
            />,
        )

        const button = screen.getByRole("button", { name: "Edit TypeScript" })
        expect(button).toBeInTheDocument()

        fireEvent.click(button)
        expect(handleEdit).toHaveBeenCalledTimes(1)
    })

    it("renders with selection mode, correct aria attributes, and calls onSelect when clicked", () => {
        const handleSelect = vi.fn()
        render(
            <ProgressListItem
                name="JavaScript"
                mastery="Competent"
                isSelectionMode={true}
                isSelected={false}
                onSelect={handleSelect}
            />,
        )

        const button = screen.getByRole("button", { name: "Select JavaScript" })
        expect(button).toBeInTheDocument()
        expect(button).toHaveAttribute("aria-pressed", "false")

        fireEvent.click(button)
        expect(handleSelect).toHaveBeenCalledTimes(1)
    })

    it("updates aria-pressed to true when isSelected is true in selection mode", () => {
        render(
            <ProgressListItem
                name="Python"
                mastery="Expert"
                isSelectionMode={true}
                isSelected={true}
                onSelect={vi.fn()}
            />,
        )

        const button = screen.getByRole("button", { name: "Deselect Python" })
        expect(button).toHaveAttribute("aria-pressed", "true")
    })

    it("triggers action on Enter or Space key down", () => {
        const handleEdit = vi.fn()
        render(
            <ProgressListItem
                name="Docker"
                mastery="Intermediate"
                onEdit={handleEdit}
            />,
        )

        const button = screen.getByRole("button", { name: "Edit Docker" })

        fireEvent.keyDown(button, { key: "Enter", code: "Enter" })
        expect(handleEdit).toHaveBeenCalledTimes(1)

        fireEvent.keyDown(button, { key: " ", code: "Space" })
        expect(handleEdit).toHaveBeenCalledTimes(2)
    })
})
