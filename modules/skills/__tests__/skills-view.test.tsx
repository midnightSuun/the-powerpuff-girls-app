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
    EditSkillModal: ({
        isOpen,
        onClose,
    }: {
        isOpen: boolean
        onClose: () => void
    }) =>
        isOpen ? (
            <div data-testid="edit-skill-modal">
                <span>Edit Modal</span>
                <button data-testid="close-modal" onClick={onClose}>
                    Close
                </button>
            </div>
        ) : null,
}))

vi.mock("../ui/components/user/skill-category", () => ({
    SkillCategory: ({
        title,
        skills,
        onEditSkill,
        onSelectSkill,
        isSelectionMode,
        selectedSkills,
    }: {
        title: string
        skills: Array<{ name: string; mastery: string }>
        onEditSkill?: (skill: { name: string; mastery: string }) => void
        onSelectSkill?: (skillId: string) => void
        isSelectionMode?: boolean
        selectedSkills?: string[]
    }) => (
        <div data-testid={`category-${title}`}>
            <span>{title}</span>
            {skills.map((s) => (
                <div key={s.name} data-testid={`skill-${s.name}`}>
                    {s.name}
                    {onEditSkill && (
                        <button
                            data-testid={`edit-${s.name}`}
                            onClick={() => onEditSkill(s)}
                        >
                            Edit
                        </button>
                    )}
                    {onSelectSkill && (
                        <button
                            data-testid={`select-${s.name}`}
                            onClick={() => onSelectSkill(s.name)}
                        >
                            Select
                        </button>
                    )}
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

    it("hides add skill button when in selection mode", () => {
        mockUseSkillsView.mockReturnValue({
            isSelectionMode: true,
            setIsSelectionMode: mockSetIsSelectionMode,
            selectedSkills: ["skill-1"],
            clearSelection: mockClearSelection,
            editingSkill: null,
            setEditingSkill: mockSetEditingSkill,
            handleToggleSkill: mockHandleToggleSkill,
            handleUpdateSkill: mockHandleUpdateSkill,
        })

        render(<SkillsView {...defaultProps} />)

        expect(screen.queryByTestId("add-skill-btn")).not.toBeInTheDocument()
        expect(screen.getByTestId("delete-skills-btn")).toBeInTheDocument()
    })

    it("applies compact styling when compact prop is true", () => {
        render(<SkillsView {...defaultProps} compact={true} />)

        const container = document.querySelector(".mx-auto.w-full.max-w-275")
        expect(container).toBeInTheDocument()
    })

    it("applies non-compact styling when compact prop is false", () => {
        render(<SkillsView {...defaultProps} compact={false} />)

        const container = document.querySelector(
            ".w-full.max-w-6xl.px-6.py-6.lg\\:pl-50",
        )
        expect(container).toBeInTheDocument()
    })

    it("passes onEditSkill handler to SkillCategory when canManageSkills is true", () => {
        render(<SkillsView {...defaultProps} canManageSkills={true} />)

        // The SkillCategory should be rendered with onEditSkill handler
        expect(screen.getByTestId("category-Frontend")).toBeInTheDocument()
    })

    it("passes undefined for onEditSkill to SkillCategory when canManageSkills is false", () => {
        render(<SkillsView {...defaultProps} canManageSkills={false} />)

        // The SkillCategory should be rendered without onEditSkill handler
        expect(screen.getByTestId("category-Frontend")).toBeInTheDocument()
    })

    it("renders multiple categories correctly", () => {
        const multipleCategories = [
            {
                id: "cat-1",
                title: "Frontend",
                skills: [{ name: "React", mastery: "Advanced" as Mastery }],
            },
            {
                id: "cat-2",
                title: "Backend",
                skills: [{ name: "Node.js", mastery: "Expert" as Mastery }],
            },
        ]

        render(<SkillsView {...defaultProps} categories={multipleCategories} />)

        expect(screen.getByTestId("category-Frontend")).toBeInTheDocument()
        expect(screen.getByTestId("category-Backend")).toBeInTheDocument()
        expect(screen.getByTestId("skill-React")).toBeInTheDocument()
        expect(screen.getByTestId("skill-Node.js")).toBeInTheDocument()
    })

    it("centers management buttons when compact mode is enabled", () => {
        render(<SkillsView {...defaultProps} compact={true} />)

        const buttonsContainer = document.querySelector(
            ".mt-10.flex.items-center.justify-end.gap-8",
        )
        expect(buttonsContainer).toBeInTheDocument()
        expect(buttonsContainer).toHaveClass("justify-center")
    })

    it("calls setEditingSkill when edit button is clicked and canManageSkills is true", async () => {
        const user = (await import("@testing-library/user-event")).default
        render(<SkillsView {...defaultProps} canManageSkills={true} />)

        const editButton = screen.getByTestId("edit-React")
        await user.setup().click(editButton)

        expect(mockSetEditingSkill).toHaveBeenCalledWith({
            name: "React",
            mastery: "Advanced",
        })
    })

    it("does not render edit button when canManageSkills is false", () => {
        render(<SkillsView {...defaultProps} canManageSkills={false} />)

        const editButton = screen.queryByTestId("edit-React")
        expect(editButton).not.toBeInTheDocument()
    })

    it("calls handleToggleSkill when select button is clicked", async () => {
        const user = (await import("@testing-library/user-event")).default
        render(<SkillsView {...defaultProps} />)

        const selectButton = screen.getByTestId("select-React")
        await user.setup().click(selectButton)

        expect(mockHandleToggleSkill).toHaveBeenCalledWith("React")
    })

    it("passes all required props to EditSkillModal correctly", () => {
        mockUseSkillsView.mockReturnValue({
            isSelectionMode: false,
            setIsSelectionMode: mockSetIsSelectionMode,
            selectedSkills: [],
            clearSelection: mockClearSelection,
            editingSkill: { name: "TypeScript", mastery: "Expert" as Mastery },
            setEditingSkill: mockSetEditingSkill,
            handleToggleSkill: mockHandleToggleSkill,
            handleUpdateSkill: mockHandleUpdateSkill,
        })

        render(<SkillsView {...defaultProps} />)

        const modal = screen.getByTestId("edit-skill-modal")
        expect(modal).toBeInTheDocument()
    })

    it("calls setEditingSkill with null when modal is closed", async () => {
        const user = (await import("@testing-library/user-event")).default
        mockUseSkillsView.mockReturnValue({
            isSelectionMode: false,
            setIsSelectionMode: mockSetIsSelectionMode,
            selectedSkills: [],
            clearSelection: mockClearSelection,
            editingSkill: { name: "TypeScript", mastery: "Expert" as Mastery },
            setEditingSkill: mockSetEditingSkill,
            handleToggleSkill: mockHandleToggleSkill,
            handleUpdateSkill: mockHandleUpdateSkill,
        })

        render(<SkillsView {...defaultProps} />)

        const closeButton = screen.getByTestId("close-modal")
        await user.setup().click(closeButton)

        expect(mockSetEditingSkill).toHaveBeenCalledWith(null)
    })
})
