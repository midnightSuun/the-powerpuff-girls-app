import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { DeleteSkillsModal } from "../ui/components/user/delete-skill-modal"

const { mockUseDeleteSkillsModal } = vi.hoisted(() => ({
    mockUseDeleteSkillsModal: vi.fn(),
}))

vi.mock("@/modules/skills/hooks/use-delete-skill-modal", () => ({
    useDeleteSkillsModal: mockUseDeleteSkillsModal,
}))

vi.mock("@/components/ui/delete-item-modal", () => ({
    DeleteModal: ({
        isOpen,
        title,
        description,
        error,
        onConfirm,
        onClose,
        isDeleting,
    }: {
        isOpen: boolean
        title: string
        description: React.ReactNode
        error?: string | null
        onConfirm: () => void
        onClose: () => void
        isDeleting: boolean
    }) =>
        isOpen ? (
            <div data-testid="delete-item-modal">
                <h2>{title}</h2>
                <div data-testid="modal-description">{description}</div>
                {error && <div data-testid="modal-error">{error}</div>}
                <button
                    data-testid="confirm-delete-btn"
                    onClick={onConfirm}
                    disabled={isDeleting}
                >
                    Confirm
                </button>
                <button data-testid="cancel-delete-btn" onClick={onClose}>
                    Cancel
                </button>
            </div>
        ) : null,
}))

describe("DeleteSkillsModal", () => {
    const mockOnClose = vi.fn()
    const mockOnConfirm = vi.fn(async () => {})
    const mockHandleConfirm = vi.fn(async () => {})

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        onConfirm: mockOnConfirm,
        count: 1,
        selectedSkills: ["s-1"],
    }

    beforeEach(() => {
        vi.clearAllMocks()

        mockUseDeleteSkillsModal.mockReturnValue({
            isDeleting: false,
            error: null,
            handleConfirm: mockHandleConfirm,
        })
    })

    it("renders singular title when count is 1", () => {
        render(<DeleteSkillsModal {...defaultProps} count={1} />)

        expect(screen.getByTestId("delete-item-modal")).toBeInTheDocument()
        expect(screen.getByText("titleSingular")).toBeInTheDocument()
    })

    it("renders plural title when count is greater than 1", () => {
        render(<DeleteSkillsModal {...defaultProps} count={3} />)

        expect(screen.getByTestId("delete-item-modal")).toBeInTheDocument()
        expect(screen.getByText("titlePlural")).toBeInTheDocument()
    })

    it("triggers handleConfirm when confirm button is clicked", () => {
        render(<DeleteSkillsModal {...defaultProps} />)

        fireEvent.click(screen.getByTestId("confirm-delete-btn"))
        expect(mockHandleConfirm).toHaveBeenCalledTimes(1)
    })

    it("triggers onClose when cancel button is clicked", () => {
        render(<DeleteSkillsModal {...defaultProps} />)

        fireEvent.click(screen.getByTestId("cancel-delete-btn"))
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it("displays error message when error state is present", () => {
        mockUseDeleteSkillsModal.mockReturnValue({
            isDeleting: false,
            error: "Failed to delete skills",
            handleConfirm: mockHandleConfirm,
        })

        render(<DeleteSkillsModal {...defaultProps} />)

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Failed to delete skills",
        )
    })

    it("does not render anything when closed", () => {
        render(<DeleteSkillsModal {...defaultProps} isOpen={false} />)

        expect(
            screen.queryByTestId("delete-item-modal"),
        ).not.toBeInTheDocument()
    })
})
