import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useDeleteSkillsModal } from "@/modules/skills/hooks/use-delete-skill-modal"

import { DeleteSkillModal } from "../ui/components/admin/delete-skill-admin-modal"

vi.mock("@/modules/skills/hooks/use-delete-skill-modal", () => ({
    useDeleteSkillsModal: vi.fn(),
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
        description: string
        error?: string | null
        onConfirm: () => void
        onClose: () => void
        isDeleting: boolean
    }) =>
        isOpen ? (
            <div data-testid="delete-item-modal">
                <h2>{title}</h2>
                <p>{description}</p>
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

describe("DeleteSkillModal", () => {
    const mockOnClose = vi.fn()
    const mockOnConfirm = vi.fn()
    const mockHandleConfirm = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(useDeleteSkillsModal).mockReturnValue({
            isDeleting: false,
            error: null,
            handleConfirm: mockHandleConfirm,
        } as unknown as ReturnType<typeof useDeleteSkillsModal>)
    })

    it("renders delete modal with correct title and skill description when open", () => {
        render(
            <DeleteSkillModal
                isOpen={true}
                onClose={mockOnClose}
                skillName="TypeScript"
                onConfirm={mockOnConfirm}
            />,
        )

        expect(screen.getByTestId("delete-item-modal")).toBeInTheDocument()
        expect(screen.getByText("deleteTitle")).toBeInTheDocument()
        expect(screen.getByText("deleteConfirmation")).toBeInTheDocument()
    })

    it("triggers handleConfirm when confirm button is clicked", () => {
        render(
            <DeleteSkillModal
                isOpen={true}
                onClose={mockOnClose}
                skillName="TypeScript"
                onConfirm={mockOnConfirm}
            />,
        )

        fireEvent.click(screen.getByTestId("confirm-delete-btn"))
        expect(mockHandleConfirm).toHaveBeenCalledTimes(1)
    })

    it("displays error message when error state is present", () => {
        vi.mocked(useDeleteSkillsModal).mockReturnValue({
            isDeleting: false,
            error: "Failed to delete skill",
            handleConfirm: mockHandleConfirm,
        } as unknown as ReturnType<typeof useDeleteSkillsModal>)

        render(
            <DeleteSkillModal
                isOpen={true}
                onClose={mockOnClose}
                skillName="TypeScript"
                onConfirm={mockOnConfirm}
            />,
        )

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Failed to delete skill",
        )
    })

    it("does not render anything when closed", () => {
        render(
            <DeleteSkillModal
                isOpen={false}
                onClose={mockOnClose}
                skillName="TypeScript"
                onConfirm={mockOnConfirm}
            />,
        )

        expect(
            screen.queryByTestId("delete-item-modal"),
        ).not.toBeInTheDocument()
    })
})
