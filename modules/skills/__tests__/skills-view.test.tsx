import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Mastery } from "@/gql/generated/graphql"

import { SkillsView } from "../ui/components/user/skills-view"

const { mockUseSkillsView } = vi.hoisted(() => ({
    mockUseSkillsView: vi.fn(),
}))

vi.mock("@/modules/skills/hooks/use-skills-view", () => ({
    useSkillsView: mockUseSkillsView,
}))

vi.mock("../ui/components/user/add-skill-button", () => ({
    AddSkillButton: () => (
        <button data-testid="add-skill-btn">Add Skill</button>
    ),
}))

vi.mock("../ui/components/user/delete-skill-button", () => ({
    DeleteSkillsButton: () => (
        <button data-testid="delete-skills-btn">Delete Skills</button>
    ),
}))

vi.mock("../ui/components/user/edit-skill-modal", () => ({
    EditSkillModal: ({ isOpen }: { isOpen: boolean }) =>
        isOpen ? <div data-testid="edit-skill-modal">Edit Modal</div> : null,
}))

vi.mock("../ui/components/user/skill-category", () => ({
    SkillCategory: ({
        title,
        skills,
    }: {
        title: string
        skills: Array<{ name: string }>
    }) => (
        <div data-testid={`category-${title}`}>
            <span>{title}</span>
            {skills.map((s) => (
                <div key={s.name} data-testid={`skill-${s.name}`}>
                    {s.name}
                </div>
            ))}
        </div>
    ),
}))

describe("SkillsView (User)", () => {
    const mockSetIsSelectionMode = vi.fn()
    const mockClearSelection = vi.fn()
    const mockSetEditingSkill = vi.fn()
    const mockHandleToggleSkill = vi.fn()
    const mockHandleUpdateSkill = vi.fn(async () => {})

    const defaultCategories = [
        {
            id: "cat-1",
            title: "Frontend",
            skills: [{ name: "React", mastery: "Advanced" as Mastery }],
        },
    ]

    const defaultProps = {
        cvId: "cv-1",
        categories: defaultCategories,
        typedSkills: [{ name: "React", mastery: "Advanced" as Mastery }],
        availableSkills: [
            {
                id: "s-2",
                name: "Node.js",
                category: "Backend",
                categoryId: "cat-2",
            },
        ],
        canManageSkills: true,
        compact: false,
    }

    beforeEach(() => {
        vi.clearAllMocks()

        mockUseSkillsView.mockReturnValue({
            isSelectionMode: false,
            setIsSelectionMode: mockSetIsSelectionMode,
            selectedSkills: [],
            clearSelection: mockClearSelection,
            editingSkill: null,
            setEditingSkill: mockSetEditingSkill,
            handleToggleSkill: mockHandleToggleSkill,
            handleUpdateSkill: mockHandleUpdateSkill,
        })
    })

    it("renders categories and management buttons when canManageSkills is true", () => {
        render(<SkillsView {...defaultProps} />)

        expect(screen.getByTestId("category-Frontend")).toBeInTheDocument()
        expect(screen.getByTestId("skill-React")).toBeInTheDocument()
        expect(screen.getByTestId("add-skill-btn")).toBeInTheDocument()
        expect(screen.getByTestId("delete-skills-btn")).toBeInTheDocument()
    })

    it("renders empty state message when categories array is empty", () => {
        render(<SkillsView {...defaultProps} categories={[]} />)

        expect(screen.getByText("empty")).toBeInTheDocument()
        expect(
            screen.queryByTestId("category-Frontend"),
        ).not.toBeInTheDocument()
    })

    it("does not render management buttons when canManageSkills is false", () => {
        render(<SkillsView {...defaultProps} canManageSkills={false} />)

        expect(screen.queryByTestId("add-skill-btn")).not.toBeInTheDocument()
        expect(
            screen.queryByTestId("delete-skills-btn"),
        ).not.toBeInTheDocument()
    })

    it("opens edit skill modal when editingSkill state is present", () => {
        mockUseSkillsView.mockReturnValue({
            isSelectionMode: false,
            setIsSelectionMode: mockSetIsSelectionMode,
            selectedSkills: [],
            clearSelection: mockClearSelection,
            editingSkill: { name: "React", mastery: "Advanced" as Mastery },
            setEditingSkill: mockSetEditingSkill,
            handleToggleSkill: mockHandleToggleSkill,
            handleUpdateSkill: mockHandleUpdateSkill,
        })

        render(<SkillsView {...defaultProps} />)

        expect(screen.getByTestId("edit-skill-modal")).toBeInTheDocument()
    })
})
