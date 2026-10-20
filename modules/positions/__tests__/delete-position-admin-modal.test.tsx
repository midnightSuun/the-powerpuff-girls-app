import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useDeletePositionModal } from "@/modules/positions/hooks/use-delete-position-modal"

import { DeletePositionModal } from "../ui/delete-position-admin-modal"

vi.mock("@/modules/positions/hooks/use-delete-position-modal", () => ({
    useDeletePositionModal: vi.fn(),
}))

vi.mock("@/components/ui/delete-item-modal", () => ({
    DeleteModal: ({
        isOpen,
        title,
        description,
        onClose,
        onConfirm,
        error,
    }: {
        isOpen: boolean
        title: string
        description: string
        onClose: () => void
        onConfirm: () => void
        error: string | null
    }) =>
        isOpen ? (
            <div data-testid="delete-modal">
                <h1>{title}</h1>
                <p>{description}</p>
                {error && <span data-testid="delete-error">{error}</span>}
                <button data-testid="modal-close" onClick={onClose}>
                    Cancel
                </button>
                <button data-testid="modal-confirm" onClick={onConfirm}>
                    Delete
                </button>
            </div>
        ) : null,
}))

type HookReturnType = ReturnType<typeof useDeletePositionModal>

describe("DeletePositionModal", () => {
    const mockHandleConfirm = vi.fn()
    const mockOnClose = vi.fn()
    const mockOnConfirm = vi.fn()

    const defaultHookValues: HookReturnType = {
        isDeleting: false,
        error: null,
        handleConfirm: mockHandleConfirm,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useDeletePositionModal).mockReturnValue(defaultHookValues)
    })

    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it("renders modal when isOpen is true and formats confirmation description", () => {
        render(
            <DeletePositionModal
                isOpen={true}
                onClose={mockOnClose}
                positionName="Frontend Developer"
                onConfirm={mockOnConfirm}
            />,
        )

        expect(screen.getByTestId("delete-modal")).toBeInTheDocument()
        expect(screen.getByText("title")).toBeInTheDocument()
        expect(screen.getByText("confirmation")).toBeInTheDocument()
    })

    it("does not render modal when isOpen is false", () => {
        render(
            <DeletePositionModal
                isOpen={false}
                onClose={mockOnClose}
                positionName="Frontend Developer"
                onConfirm={mockOnConfirm}
            />,
        )

        expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument()
    })

    it("renders error message when error state is present", () => {
        vi.mocked(useDeletePositionModal).mockReturnValue({
            ...defaultHookValues,
            error: "inUseError",
        })

        render(
            <DeletePositionModal
                isOpen={true}
                onClose={mockOnClose}
                positionName="Frontend Developer"
                onConfirm={mockOnConfirm}
            />,
        )

        expect(screen.getByTestId("delete-error")).toHaveTextContent(
            "inUseError",
        )
    })

    it("triggers handleConfirm when confirm button is clicked", () => {
        render(
            <DeletePositionModal
                isOpen={true}
                onClose={mockOnClose}
                positionName="Frontend Developer"
                onConfirm={mockOnConfirm}
            />,
        )

        const confirmButton = screen.getByTestId("modal-confirm")
        fireEvent.click(confirmButton)

        expect(mockHandleConfirm).toHaveBeenCalledTimes(1)
    })
})
