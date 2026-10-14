import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { DeleteLanguageButton } from "../ui/components/user/delete-language-button"

vi.mock(
    "@/modules/languages/ui/components/user/delete-languages-modal",
    () => ({
        DeleteLanguagesModal: ({
            isOpen,
            onClose,
            count,
        }: {
            isOpen: boolean
            onClose: () => void
            count: number
        }) =>
            isOpen ? (
                <div data-testid="delete-languages-modal">
                    <span>Count: {count}</span>
                    <button onClick={onClose} data-testid="close-delete-modal">
                        Close Modal
                    </button>
                </div>
            ) : null,
    }),
)

describe("DeleteLanguageButton", () => {
    const mockOnToggleSelectionMode = vi.fn()
    const mockOnConfirmDelete = vi.fn()
    const mockSetIsModalOpen = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it("renders remove items button when selection mode is off", () => {
        render(
            <DeleteLanguageButton
                selectedLanguages={[]}
                isSelectionMode={false}
                onToggleSelectionMode={mockOnToggleSelectionMode}
                onConfirmDelete={mockOnConfirmDelete}
                isModalOpen={false}
                setIsModalOpen={mockSetIsModalOpen}
                disabled={false}
            />,
        )

        const removeButton = screen.getByText("remove")
        expect(removeButton).toBeInTheDocument()

        fireEvent.click(removeButton)
        expect(mockOnToggleSelectionMode).toHaveBeenCalledWith(true)
    })

    it("renders selection mode action buttons and handles cancel", () => {
        render(
            <DeleteLanguageButton
                selectedLanguages={["lang-1"]}
                isSelectionMode={true}
                onToggleSelectionMode={mockOnToggleSelectionMode}
                onConfirmDelete={mockOnConfirmDelete}
                isModalOpen={false}
                setIsModalOpen={mockSetIsModalOpen}
                disabled={false}
            />,
        )

        const cancelButton = screen.getByText("cancel")
        const deleteSelectedButton = screen.getByText(/deleteSelected/i)

        expect(cancelButton).toBeInTheDocument()
        expect(deleteSelectedButton).toBeInTheDocument()
        expect(deleteSelectedButton).not.toBeDisabled()

        fireEvent.click(cancelButton)
        expect(mockOnToggleSelectionMode).toHaveBeenCalledWith(false)
    })

    it("disables delete selected button when no languages are selected", () => {
        render(
            <DeleteLanguageButton
                selectedLanguages={[]}
                isSelectionMode={true}
                onToggleSelectionMode={mockOnToggleSelectionMode}
                onConfirmDelete={mockOnConfirmDelete}
                isModalOpen={false}
                setIsModalOpen={mockSetIsModalOpen}
                disabled={false}
            />,
        )

        const deleteSelectedButton = screen.getByText(/deleteSelected/i)
        expect(deleteSelectedButton).toBeDisabled()

        fireEvent.click(deleteSelectedButton)
        expect(mockSetIsModalOpen).not.toHaveBeenCalled()
    })

    it("opens delete modal when delete selected button is clicked with selected items", () => {
        render(
            <DeleteLanguageButton
                selectedLanguages={["lang-1", "lang-2"]}
                isSelectionMode={true}
                onToggleSelectionMode={mockOnToggleSelectionMode}
                onConfirmDelete={mockOnConfirmDelete}
                isModalOpen={false}
                setIsModalOpen={mockSetIsModalOpen}
                disabled={false}
            />,
        )

        const deleteSelectedButton = screen.getByText(/deleteSelected/i)
        fireEvent.click(deleteSelectedButton)

        expect(mockSetIsModalOpen).toHaveBeenCalledWith(true)
    })

    it("renders delete languages modal when isModalOpen is true", () => {
        render(
            <DeleteLanguageButton
                selectedLanguages={["lang-1"]}
                isSelectionMode={true}
                onToggleSelectionMode={mockOnToggleSelectionMode}
                onConfirmDelete={mockOnConfirmDelete}
                isModalOpen={true}
                setIsModalOpen={mockSetIsModalOpen}
                disabled={false}
            />,
        )

        expect(screen.getByTestId("delete-languages-modal")).toBeInTheDocument()
        expect(screen.getByText("Count: 1")).toBeInTheDocument()

        fireEvent.click(screen.getByTestId("close-delete-modal"))
        expect(mockSetIsModalOpen).toHaveBeenCalledWith(false)
    })
})
