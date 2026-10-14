import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { Mastery } from "@/gql/generated/graphql"
import { useEditSkillModal } from "@/modules/skills/hooks/use-edit-skill-modal"

import { EditSkillModal } from "../ui/components/user/edit-skill-modal"

vi.mock("@/modules/skills/hooks/use-edit-skill-modal", () => ({
    useEditSkillModal: vi.fn(),
}))

vi.mock("@/components/ui/edit-item-modal", () => ({
    EditItemModal: ({
        isOpen,
        title,
        itemNameValue,
        error,
        onSubmit,
        onClose,
        levelSelectNode,
    }: {
        isOpen: boolean
        title: string
        itemNameValue: string
        error?: string | null
        onSubmit: (e: React.FormEvent) => void
        onClose: () => void
        levelSelectNode: React.ReactNode
    }) =>
        isOpen ? (
            <div data-testid="edit-item-modal">
                <h2>{title}</h2>
                <span data-testid="skill-name">{itemNameValue}</span>
                {error && <div data-testid="modal-error">{error}</div>}
                <form onSubmit={onSubmit}>
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
            </div>
        ) : null,
}))

describe("EditSkillModal (User)", () => {
    const mockHandleClose = vi.fn()
    const mockHandleSubmit = vi.fn(async (e: React.SyntheticEvent) => {
        e.preventDefault()
    })
    const mockSetMastery = vi.fn()

    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        skillName: "TypeScript",
        currentMastery: "Advanced" as Mastery,
        onUpdate: vi.fn(async () => {}),
    }

    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(useEditSkillModal).mockReturnValue({
            t: ((key: string) => key) as unknown as ReturnType<
                typeof useEditSkillModal
            >["t"],
            mastery: "Advanced" as Mastery,
            setMastery: mockSetMastery,
            error: null,
            isSubmitting: false,
            isValid: true,
            handleClose: mockHandleClose,
            handleSubmit: mockHandleSubmit,
        })
    })

    it("renders modal with correct skill name and components when open", () => {
        render(<EditSkillModal {...defaultProps} />)

        expect(screen.getByTestId("edit-item-modal")).toBeInTheDocument()
        expect(screen.getByTestId("skill-name")).toHaveTextContent("TypeScript")
        expect(screen.getByText("Advanced")).toBeInTheDocument()
    })

    it("triggers handleSubmit when form is submitted", () => {
        render(<EditSkillModal {...defaultProps} />)

        fireEvent.click(screen.getByTestId("submit-btn"))
        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })

    it("triggers handleClose when cancel button is clicked", () => {
        render(<EditSkillModal {...defaultProps} />)

        fireEvent.click(screen.getByTestId("cancel-btn"))
        expect(mockHandleClose).toHaveBeenCalledTimes(1)
    })

    it("displays error message when error state is present", () => {
        vi.mocked(useEditSkillModal).mockReturnValue({
            t: ((key: string) => key) as unknown as ReturnType<
                typeof useEditSkillModal
            >["t"],
            mastery: "Advanced" as Mastery,
            setMastery: mockSetMastery,
            error: "Failed to update skill",
            isSubmitting: false,
            isValid: true,
            handleClose: mockHandleClose,
            handleSubmit: mockHandleSubmit,
        })

        render(<EditSkillModal {...defaultProps} />)

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Failed to update skill",
        )
    })

    it("does not render anything when closed", () => {
        vi.mocked(useEditSkillModal).mockReturnValue({
            t: ((key: string) => key) as unknown as ReturnType<
                typeof useEditSkillModal
            >["t"],
            mastery: "Advanced" as Mastery,
            setMastery: mockSetMastery,
            error: null,
            isSubmitting: false,
            isValid: true,
            handleClose: mockHandleClose,
            handleSubmit: mockHandleSubmit,
        })

        render(<EditSkillModal {...defaultProps} isOpen={false} />)

        expect(screen.queryByTestId("edit-item-modal")).not.toBeInTheDocument()
    })
})
