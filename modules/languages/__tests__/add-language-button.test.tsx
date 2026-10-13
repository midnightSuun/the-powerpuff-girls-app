import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AddLanguageButton } from "@/modules/languages/ui/components/user/add-language-button"

vi.mock("@/modules/languages/ui/components/user/add-language-modal", () => ({
    AddLanguageModal: ({
        isOpen,
        onClose,
    }: {
        isOpen: boolean
        onClose: () => void
    }) =>
        isOpen ? (
            <div data-testid="add-language-modal">
                <button onClick={onClose} data-testid="close-modal-btn">
                    Close Modal
                </button>
            </div>
        ) : null,
}))

describe("AddLanguageButton", () => {
    const mockOnAdd = vi.fn()

    const availableLanguages = [
        { id: "1", name: "English" },
        { id: "2", name: "Spanish" },
    ]

    const existingLanguages = [{ name: "English" }]

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it("renders add button correctly and modal is initially closed", () => {
        render(
            <AddLanguageButton
                availableLanguages={availableLanguages}
                existingLanguages={existingLanguages}
                onAdd={mockOnAdd}
            />,
        )

        expect(screen.getByText("add")).toBeInTheDocument()
        expect(
            screen.queryByTestId("add-language-modal"),
        ).not.toBeInTheDocument()
    })

    it("opens the modal when add button is clicked", () => {
        render(
            <AddLanguageButton
                availableLanguages={availableLanguages}
                existingLanguages={existingLanguages}
                onAdd={mockOnAdd}
            />,
        )

        const addButton = screen.getByText("add")
        fireEvent.click(addButton)

        expect(screen.getByTestId("add-language-modal")).toBeInTheDocument()
    })

    it("closes the modal when onClose is triggered", () => {
        render(
            <AddLanguageButton
                availableLanguages={availableLanguages}
                existingLanguages={existingLanguages}
                onAdd={mockOnAdd}
            />,
        )

        fireEvent.click(screen.getByText("add"))
        expect(screen.getByTestId("add-language-modal")).toBeInTheDocument()

        fireEvent.click(screen.getByTestId("close-modal-btn"))
        expect(
            screen.queryByTestId("add-language-modal"),
        ).not.toBeInTheDocument()
    })
})
