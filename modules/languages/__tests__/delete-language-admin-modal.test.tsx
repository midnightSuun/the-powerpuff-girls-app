import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useDeleteLanguageModal } from "@/modules/languages/hooks/use-delete-language-modal"

import { DeleteLanguageModal } from "../ui/components/admin/delete-language-admin-modal"

vi.mock("@/modules/languages/hooks/use-delete-language-modal", () => ({
    useDeleteLanguageModal: vi.fn(),
}))

vi.mock("@/components/ui/delete-item-modal", () => ({
    DeleteModal: ({
        isOpen,
        title,
        description,
        error,
        isDeleting,
        onConfirm,
        onClose,
    }: {
        isOpen: boolean
        title: string
        description: string
        error?: string | null
        isDeleting?: boolean
        onConfirm: () => void
        onClose: () => void
    }) =>
        isOpen ? (
            <div data-testid="delete-modal">
                <h2>{title}</h2>
                <p data-testid="modal-description">{description}</p>
                {error && <div data-testid="modal-error">{error}</div>}
                <button
                    disabled={isDeleting}
                    onClick={onConfirm}
                    data-testid="confirm-btn"
                >
                    Confirm
                </button>
                <button onClick={onClose} data-testid="close-btn">
                    Close
                </button>
            </div>
        ) : null,
}))

describe("DeleteLanguageModal", () => {
    const mockOnClose = vi.fn()
    const mockOnConfirm = vi.fn()
    const mockHandleConfirm = vi.fn()

    const defaultHookValues = {
        isDeleting: false,
        error: null as string | null,
        handleConfirm: mockHandleConfirm,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useDeleteLanguageModal).mockReturnValue(defaultHookValues)
    })

    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it("does not render when isOpen is false", () => {
        render(
            <DeleteLanguageModal
                isOpen={false}
                onClose={mockOnClose}
                languageName="English"
                onConfirm={mockOnConfirm}
            />,
        )

        expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument()
    })

    it("renders correctly with title and description when isOpen is true", () => {
        render(
            <DeleteLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                languageName="English"
                onConfirm={mockOnConfirm}
            />,
        )

        expect(screen.getByTestId("delete-modal")).toBeInTheDocument()
        expect(screen.getByText("title")).toBeInTheDocument()
        expect(screen.getByTestId("modal-description")).toHaveTextContent(
            "confirmation",
        )
    })

    it("displays error when provided", () => {
        vi.mocked(useDeleteLanguageModal).mockReturnValue({
            ...defaultHookValues,
            error: "Failed to delete language",
        })

        render(
            <DeleteLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                languageName="English"
                onConfirm={mockOnConfirm}
            />,
        )

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Failed to delete language",
        )
    })

    it("disables confirm button when isDeleting is true", () => {
        vi.mocked(useDeleteLanguageModal).mockReturnValue({
            ...defaultHookValues,
            isDeleting: true,
        })

        render(
            <DeleteLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                languageName="English"
                onConfirm={mockOnConfirm}
            />,
        )

        expect(screen.getByTestId("confirm-btn")).toBeDisabled()
    })

    it("triggers handleConfirm when confirmation button is clicked", () => {
        render(
            <DeleteLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                languageName="English"
                onConfirm={mockOnConfirm}
            />,
        )

        const confirmBtn = screen.getByTestId("confirm-btn")
        fireEvent.click(confirmBtn)

        expect(mockHandleConfirm).toHaveBeenCalledTimes(1)
    })
})
