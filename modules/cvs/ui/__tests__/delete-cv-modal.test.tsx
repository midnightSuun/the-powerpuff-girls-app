import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { DeleteCvModal } from "../components/delete-cv-modal"

vi.mock("@/components/ui/delete-item-modal", () => ({
    DeleteModal: ({
        isOpen,
        title,
        description,
        cancelText,
        confirmText,
        deletingText,
        isDeleting,
        error,
        onConfirm,
        onClose,
    }: {
        isOpen: boolean
        title: string
        description: string
        cancelText: string
        confirmText: string
        deletingText: string
        isDeleting: boolean
        error?: string | null
        onConfirm: () => Promise<void> | void
        onClose: () => void
    }) =>
        isOpen ? (
            <div data-testid="delete-modal">
                <h1 data-testid="modal-title">{title}</h1>
                <p data-testid="modal-description">{description}</p>
                {error && <div data-testid="modal-error">{error}</div>}
                <div data-testid="is-deleting">{String(isDeleting)}</div>
                <button
                    type="button"
                    onClick={onClose}
                    data-testid="modal-cancel"
                >
                    {cancelText}
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    data-testid="modal-confirm"
                >
                    {isDeleting ? deletingText : confirmText}
                </button>
            </div>
        ) : null,
}))

describe("DeleteCvModal", () => {
    const mockOnClose = vi.fn()
    const mockOnConfirm = vi.fn(async () => {})

    beforeEach(() => {
        cleanup()
        vi.clearAllMocks()
    })

    afterEach(() => {
        cleanup()
    })

    it("renders modal with correct title, interpolated description, and buttons when open", () => {
        render(
            <DeleteCvModal
                isOpen={true}
                onClose={mockOnClose}
                cvName="Senior Frontend CV"
                onConfirm={mockOnConfirm}
                isDeleting={false}
            />,
        )

        expect(screen.getByTestId("delete-modal")).toBeInTheDocument()
        expect(screen.getByTestId("modal-title")).toHaveTextContent(
            "deleteTitle",
        )
        expect(screen.getByTestId("modal-description")).toHaveTextContent(
            "deleteConfirmation",
        )
        expect(screen.getByTestId("modal-confirm")).toHaveTextContent("confirm")
        expect(screen.getByTestId("modal-cancel")).toHaveTextContent("cancel")
    })

    it("does not render modal when isOpen is false", () => {
        render(
            <DeleteCvModal
                isOpen={false}
                onClose={mockOnClose}
                cvName="Senior Frontend CV"
                onConfirm={mockOnConfirm}
                isDeleting={false}
            />,
        )

        expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument()
    })

    it("displays deleting text and passes deleting state when isDeleting is true", () => {
        render(
            <DeleteCvModal
                isOpen={true}
                onClose={mockOnClose}
                cvName="Senior Frontend CV"
                onConfirm={mockOnConfirm}
                isDeleting={true}
            />,
        )

        expect(screen.getByTestId("is-deleting")).toHaveTextContent("true")
        expect(screen.getByTestId("modal-confirm")).toHaveTextContent(
            "deleting",
        )
    })

    it("displays error message when error prop is provided", () => {
        render(
            <DeleteCvModal
                isOpen={true}
                onClose={mockOnClose}
                cvName="Senior Frontend CV"
                onConfirm={mockOnConfirm}
                isDeleting={false}
                error="Failed to delete CV"
            />,
        )

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Failed to delete CV",
        )
    })

    it("triggers onConfirm when confirm button is clicked", async () => {
        const user = userEvent.setup()

        render(
            <DeleteCvModal
                isOpen={true}
                onClose={mockOnClose}
                cvName="Senior Frontend CV"
                onConfirm={mockOnConfirm}
                isDeleting={false}
            />,
        )

        const confirmButton = screen.getByTestId("modal-confirm")
        await user.click(confirmButton)

        expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })

    it("triggers onClose when cancel button is clicked", async () => {
        const user = userEvent.setup()

        render(
            <DeleteCvModal
                isOpen={true}
                onClose={mockOnClose}
                cvName="Senior Frontend CV"
                onConfirm={mockOnConfirm}
                isDeleting={false}
            />,
        )

        const cancelButton = screen.getByTestId("modal-cancel")
        await user.click(cancelButton)

        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
})
