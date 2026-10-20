import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Mastery } from "@/gql/generated/graphql"
import { useAddSkillModal } from "@/modules/skills/hooks/use-add-skill-modal"

import { AddSkillModal } from "../ui/components/user/add-skill-modal"

vi.mock("@/modules/skills/hooks/use-add-skill-modal", () => ({
    useAddSkillModal: vi.fn(),
}))

vi.mock("@/components/ui/add-item-modal", () => ({
    AddItemModal: ({
        isOpen,
        title,
        error,
        onSubmit,
        onClose,
        selectedId,
        onSelectChange,
        availableOptions,
        levelSelectNode,
    }: {
        isOpen: boolean
        title: string
        error?: string | null
        onSubmit: (e: React.FormEvent) => void
        onClose: () => void
        selectedId: string
        onSelectChange: (val: string | null) => void
        availableOptions: Array<{ id: string; name: string }>
        levelSelectNode: React.ReactNode
    }) =>
        isOpen ? (
            <div data-testid="add-item-modal">
                <h2>{title}</h2>
                {error && <div data-testid="modal-error">{error}</div>}
                <form onSubmit={onSubmit}>
                    <select
                        data-testid="skill-select"
                        value={selectedId}
                        onChange={(e) => onSelectChange(e.target.value)}
                    >
                        <option value="">Select skill</option>
                        {availableOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                                {opt.name}
                            </option>
                        ))}
                    </select>
                    <div data-testid="mastery-container">{levelSelectNode}</div>
                    <button type="submit" data-testid="submit-btn">
                        Submit
                    </button>
                    <button
                        type="button"
                        data-testid="cancel-btn"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </form>
                {/* Add a button to test onSelectChange with null value */}
                <button
                    data-testid="test-null-select"
                    onClick={() => onSelectChange(null)}
                >
                    Test Null Select
                </button>
            </div>
        ) : null,
}))

describe("AddSkillModal", () => {
    const mockHandleClose = vi.fn()
    const mockHandleSubmit = vi.fn(async (e: React.SyntheticEvent) => {
        e.preventDefault()
    })
    const mockSetSelectedSkillId = vi.fn()
    const mockSetMastery = vi.fn()

    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        cvId: "cv-1",
        existingSkills: [],
        availableSkills: [
            {
                id: "s-1",
                name: "React",
                category: "Frontend",
                categoryId: "c-1",
            },
            {
                id: "s-2",
                name: "Node.js",
                category: "Backend",
                categoryId: "c-2",
            },
        ],
    }

    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(useAddSkillModal).mockReturnValue({
            isOpen: true,
            t: ((key: string) => key) as unknown as ReturnType<
                typeof useAddSkillModal
            >["t"],
            availableSkills: defaultProps.availableSkills,
            selectedSkillId: "",
            setSelectedSkillId: mockSetSelectedSkillId,
            mastery: "Intermediate" as Mastery,
            setMastery: mockSetMastery,
            error: null,
            isSubmitting: false,
            unselectedSkills: defaultProps.availableSkills,
            isValid: false,
            handleClose: mockHandleClose,
            handleSubmit: mockHandleSubmit,
        })
    })

    it("renders modal with correct options and components when open", () => {
        render(<AddSkillModal {...defaultProps} />)

        expect(screen.getByTestId("add-item-modal")).toBeInTheDocument()
        expect(screen.getByText("Intermediate")).toBeInTheDocument()
        expect(
            screen.getByRole("option", { name: "React" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("option", { name: "Node.js" }),
        ).toBeInTheDocument()
    })

    it("updates selected skill id on selection change", () => {
        render(<AddSkillModal {...defaultProps} />)

        const select = screen.getByTestId("skill-select")
        fireEvent.change(select, { target: { value: "s-1" } })

        expect(mockSetSelectedSkillId).toHaveBeenCalledWith("s-1")
    })

    it("triggers handleSubmit when form is submitted", () => {
        render(<AddSkillModal {...defaultProps} />)

        fireEvent.click(screen.getByTestId("submit-btn"))
        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })

    it("triggers handleClose when cancel button is clicked", () => {
        render(<AddSkillModal {...defaultProps} />)

        fireEvent.click(screen.getByTestId("cancel-btn"))
        expect(mockHandleClose).toHaveBeenCalledTimes(1)
    })

    it("displays error message when error state is present", () => {
        vi.mocked(useAddSkillModal).mockReturnValue({
            isOpen: true,
            t: ((key: string) => key) as unknown as ReturnType<
                typeof useAddSkillModal
            >["t"],
            availableSkills: defaultProps.availableSkills,
            selectedSkillId: "",
            setSelectedSkillId: mockSetSelectedSkillId,
            mastery: "Intermediate" as Mastery,
            setMastery: mockSetMastery,
            error: "Failed to add skill",
            isSubmitting: false,
            unselectedSkills: defaultProps.availableSkills,
            isValid: false,
            handleClose: mockHandleClose,
            handleSubmit: mockHandleSubmit,
        })

        render(<AddSkillModal {...defaultProps} />)

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Failed to add skill",
        )
    })

    it("does not render anything when closed", () => {
        vi.mocked(useAddSkillModal).mockReturnValue({
            isOpen: false,
            t: ((key: string) => key) as unknown as ReturnType<
                typeof useAddSkillModal
            >["t"],
            availableSkills: defaultProps.availableSkills,
            selectedSkillId: "",
            setSelectedSkillId: mockSetSelectedSkillId,
            mastery: "Intermediate" as Mastery,
            setMastery: mockSetMastery,
            error: null,
            isSubmitting: false,
            unselectedSkills: defaultProps.availableSkills,
            isValid: false,
            handleClose: mockHandleClose,
            handleSubmit: mockHandleSubmit,
        })

        render(<AddSkillModal {...defaultProps} />)

        expect(screen.queryByTestId("add-item-modal")).not.toBeInTheDocument()
    })

    it("calls setSelectedSkillId with empty string when onSelectChange receives null", async () => {
        const user = (await import("@testing-library/user-event")).default
        render(<AddSkillModal {...defaultProps} />)

        const nullButton = screen.getByTestId("test-null-select")
        await user.setup().click(nullButton)

        expect(mockSetSelectedSkillId).toHaveBeenCalledWith("")
    })
})
