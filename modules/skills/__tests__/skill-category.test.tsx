import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Mastery } from "@/gql/generated/graphql"

import { type Skill, SkillCategory } from "../ui/components/user/skill-category"

vi.mock("@/components/ui/progress-list-item", () => ({
    ProgressListItem: ({
        name,
        mastery,
        isSelectionMode,
        isSelected,
        onSelect,
        onEdit,
    }: {
        name: string
        mastery: Mastery
        isSelectionMode: boolean
        isSelected: boolean
        onSelect: () => void
        onEdit?: () => void
    }) => (
        <div
            data-testid={`skill-item-${name}`}
            data-selected={isSelected}
            data-selection-mode={isSelectionMode}
            onClick={onSelect}
        >
            <span>{name}</span>
            <span>{mastery}</span>
            {onEdit && (
                <button
                    data-testid={`edit-btn-${name}`}
                    onClick={(e) => {
                        e.stopPropagation()
                        onEdit()
                    }}
                >
                    Edit
                </button>
            )}
        </div>
    ),
}))

describe("SkillCategory", () => {
    const mockOnSelectSkill = vi.fn()
    const mockOnEditSkill = vi.fn()

    const skills: Skill[] = [
        {
            name: "TypeScript",
            mastery: "Advanced" as Mastery,
            categoryId: "c-1",
        },
        {
            name: "React",
            mastery: "Intermediate" as Mastery,
            categoryId: "c-1",
        },
    ]

    const defaultProps = {
        title: "Frontend",
        skills,
        isSelectionMode: false,
        selectedSkills: [],
        onSelectSkill: mockOnSelectSkill,
        onEditSkill: mockOnEditSkill,
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders category title and all provided skills", () => {
        render(<SkillCategory {...defaultProps} />)

        expect(screen.getByText("Frontend")).toBeInTheDocument()
        expect(screen.getByTestId("skill-item-TypeScript")).toBeInTheDocument()
        expect(screen.getByTestId("skill-item-React")).toBeInTheDocument()
        expect(screen.getByText("TypeScript")).toBeInTheDocument()
        expect(screen.getByText("Advanced")).toBeInTheDocument()
    })

    it("returns null when skills array is empty", () => {
        const { container } = render(
            <SkillCategory {...defaultProps} skills={[]} />,
        )
        expect(container.firstChild).toBeNull()
    })

    it("triggers onSelectSkill when a skill item is clicked", () => {
        render(<SkillCategory {...defaultProps} />)

        fireEvent.click(screen.getByTestId("skill-item-TypeScript"))
        expect(mockOnSelectSkill).toHaveBeenCalledWith("TypeScript")
    })

    it("triggers onEditSkill when edit action is invoked on a skill", () => {
        render(<SkillCategory {...defaultProps} />)

        fireEvent.click(screen.getByTestId("edit-btn-React"))
        expect(mockOnEditSkill).toHaveBeenCalledWith(skills[1])
    })

    it("passes selection state correctly to list items", () => {
        render(
            <SkillCategory
                {...defaultProps}
                isSelectionMode={true}
                selectedSkills={["TypeScript"]}
            />,
        )

        const tsItem = screen.getByTestId("skill-item-TypeScript")
        const reactItem = screen.getByTestId("skill-item-React")

        expect(tsItem).toHaveAttribute("data-selected", "true")
        expect(tsItem).toHaveAttribute("data-selection-mode", "true")

        expect(reactItem).toHaveAttribute("data-selected", "false")
        expect(reactItem).toHaveAttribute("data-selection-mode", "true")
    })
})
