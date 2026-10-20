import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { SkillItem } from "../ui/components/user/skill-item"

vi.mock("@/components/ui/progress-item", () => ({
    ProgressItem: ({
        name,
        mastery,
        isSelected,
    }: {
        name: string
        mastery: string | number
        isSelected: boolean
    }) => (
        <div data-testid="progress-item" data-selected={isSelected}>
            <span>{name}</span>
            <span>{mastery}</span>
        </div>
    ),
}))

describe("SkillItem", () => {
    const mockOnSelect = vi.fn()
    const mockOnEdit = vi.fn()

    const defaultProps = {
        name: "TypeScript",
        mastery: "Advanced",
        isSelectionMode: false,
        isSelected: false,
        onSelect: mockOnSelect,
        onEdit: mockOnEdit,
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders name and mastery correctly via ProgressItem", () => {
        render(<SkillItem {...defaultProps} />)

        expect(screen.getByTestId("progress-item")).toBeInTheDocument()
        expect(screen.getByText("TypeScript")).toBeInTheDocument()
        expect(screen.getByText("Advanced")).toBeInTheDocument()
    })

    it("triggers onEdit when clicked and not in selection mode", () => {
        render(<SkillItem {...defaultProps} isSelectionMode={false} />)

        fireEvent.click(screen.getByTestId("progress-item"))
        expect(mockOnEdit).toHaveBeenCalledTimes(1)
        expect(mockOnSelect).not.toHaveBeenCalled()
    })

    it("triggers onSelect when clicked in selection mode", () => {
        render(<SkillItem {...defaultProps} isSelectionMode={true} />)

        fireEvent.click(screen.getByTestId("progress-item"))
        expect(mockOnSelect).toHaveBeenCalledTimes(1)
        expect(mockOnEdit).not.toHaveBeenCalled()
    })

    it("applies selection styling and passes isSelected to ProgressItem when selected", () => {
        render(<SkillItem {...defaultProps} isSelected={true} />)

        const itemContainer = screen.getByTestId("progress-item").parentElement
        expect(itemContainer).toHaveClass("bg-red-50")
        expect(screen.getByTestId("progress-item")).toHaveAttribute(
            "data-selected",
            "true",
        )
    })
})
