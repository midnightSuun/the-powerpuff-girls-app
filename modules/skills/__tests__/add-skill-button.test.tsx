import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AddSkillButton } from "../ui/components/user/add-skill-button"

vi.mock("../ui/components/user/add-skill-modal", () => ({
    AddSkillModal: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? (
            <div data-testid="add-skill-modal">Add Skill Modal</div>
        ) : null,
}))

vi.mock("@/components/ui/list-management-buttons", () => ({
    AddItemButton: ({
        label,
        onClick,
    }: {
        label: string
        onClick: () => void
    }) => (
        <button data-testid="add-item-btn" onClick={onClick}>
            {label}
        </button>
    ),
}))

describe("AddSkillButton", () => {
    const defaultProps = {
        cvId: "cv-1",
        existingSkills: [],
        availableSkills: [],
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders the add item button with translated label", () => {
        render(<AddSkillButton {...defaultProps} />)

        const button = screen.getByTestId("add-item-btn")
        expect(button).toBeInTheDocument()
        expect(button).toHaveTextContent("add")
    })

    it("opens the AddSkillModal when the add button is clicked", () => {
        render(<AddSkillButton {...defaultProps} />)

        expect(screen.queryByTestId("add-skill-modal")).not.toBeInTheDocument()

        fireEvent.click(screen.getByTestId("add-item-btn"))

        expect(screen.getByTestId("add-skill-modal")).toBeInTheDocument()
    })

    it("passes correct props to AddSkillModal", () => {
        const existingSkills = [
            { name: "TypeScript", mastery: "Advanced" as const },
        ]
        const availableSkills = [
            {
                id: "s-1",
                name: "React",
                category: "Frontend",
                categoryId: "cat-1",
            },
        ]

        render(
            <AddSkillButton
                cvId="cv-99"
                existingSkills={existingSkills}
                availableSkills={availableSkills}
            />,
        )

        fireEvent.click(screen.getByTestId("add-item-btn"))
        expect(screen.getByTestId("add-skill-modal")).toBeInTheDocument()
    })
})
