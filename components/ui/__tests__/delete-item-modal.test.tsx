import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { DeleteModal } from "../delete-item-modal"

vi.mock("../base-modal", () => ({
    BaseModal: ({
        isOpen,
        onClose,
        onConfirm,
        title,
        error,
        isPending,
        cancelText,
        confirmText,
        pendingText,
        children,
    }: {
        isOpen: boolean
        onClose: () => void
        onConfirm?: () => void
        title: string
        error?: string | null
        isPending: boolean
        cancelText: string
        confirmText: string
        pendingText: string
        children: React.ReactNode
    }) => {
        if (!isOpen) return null
        return (
            <div data-testid="base-modal">
                <h2 data-testid="modal-title">{title}</h2>
                {error && <div data-testid="modal-error">{error}</div>}
                <div data-testid="modal-children">{children}</div>
                <button
                    type="button"
                    onClick={onClose}
                    data-testid="cancel-btn"
                >
                    {cancelText}
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isPending}
                    data-testid="confirm-btn"
                >
                    {isPending ? pendingText : confirmText}
                </button>
            </div>
        )
    },
}))

vi.mock("cn", () => ({
    cn: (...inputs: (string | boolean | undefined | null)[]) =>
        inputs.filter(Boolean).join(" "),
}))

describe("DeleteModal", () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onConfirm: vi.fn(),
        title: "Delete Item",
        description: "Are you sure you want to delete this item?",
        cancelText: "Cancel",
        confirmText: "Delete",
        deletingText: "Deleting...",
        isDeleting: false,
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("does not render when isOpen is false", () => {
        render(<DeleteModal {...defaultProps} isOpen={false} />)

        expect(screen.queryByTestId("base-modal")).not.toBeInTheDocument()
    })

    it("renders modal with title, description, and action buttons when open", () => {
        render(<DeleteModal {...defaultProps} />)

        expect(screen.getByTestId("base-modal")).toBeInTheDocument()
        expect(screen.getByTestId("modal-title")).toHaveTextContent(
            "Delete Item",
        )
        expect(
            screen.getByText("Are you sure you want to delete this item?"),
        ).toBeInTheDocument()
        expect(screen.getByTestId("cancel-btn")).toHaveTextContent("Cancel")
        expect(screen.getByTestId("confirm-btn")).toHaveTextContent("Delete")
    })

    it("displays error message when provided", () => {
        render(<DeleteModal {...defaultProps} error="Failed to delete item" />)

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Failed to delete item",
        )
    })

    it("shows deletingText and disables confirm button when isDeleting is true", () => {
        render(<DeleteModal {...defaultProps} isDeleting={true} />)

        const confirmBtn = screen.getByTestId("confirm-btn")
        expect(confirmBtn).toHaveTextContent("Deleting...")
        expect(confirmBtn).toBeDisabled()
    })

    it("calls onClose when cancel button is clicked", () => {
        const onClose = vi.fn()
        render(<DeleteModal {...defaultProps} onClose={onClose} />)

        fireEvent.click(screen.getByTestId("cancel-btn"))
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("calls onConfirm when confirm button is clicked", () => {
        const onConfirm = vi.fn()
        render(<DeleteModal {...defaultProps} onConfirm={onConfirm} />)

        fireEvent.click(screen.getByTestId("confirm-btn"))
        expect(onConfirm).toHaveBeenCalledTimes(1)
    })
})
