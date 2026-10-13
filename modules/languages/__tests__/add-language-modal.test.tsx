import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useAddLanguage } from "@/modules/languages/hooks/use-add-language"

import { AddLanguageModal } from "../ui/components/user/add-language-modal"

vi.mock("@/modules/languages/hooks/use-add-language", () => ({
    useAddLanguage: vi.fn(),
}))

vi.mock(
    "@/modules/languages/ui/components/user/language-proficiency-select",
    () => ({
        LanguageProficiencySelect: ({
            value,
            onValueChange,
        }: {
            value: string
            onValueChange: (val: string) => void
        }) => (
            <div data-testid="proficiency-select">
                <span>{value}</span>
                <button
                    onClick={() => onValueChange("INTERMEDIATE")}
                    data-testid="change-proficiency-btn"
                >
                    Set Intermediate
                </button>
            </div>
        ),
    }),
)

vi.mock("@/components/ui/add-item-modal", () => ({
    AddItemModal: ({
        isOpen,
        title,
        error,
        isSubmitting,
        isValid,
        onSubmit,
        onClose,
        onSelectChange,
        levelSelectNode,
    }: {
        isOpen: boolean
        title: string
        error?: string | null
        isSubmitting?: boolean
        isValid?: boolean
        onSubmit: () => void
        onClose: () => void
        onSelectChange: (val: string) => void
        levelSelectNode?: React.ReactNode
    }) =>
        isOpen ? (
            <div data-testid="add-item-modal">
                <h2>{title}</h2>
                {error && <div data-testid="modal-error">{error}</div>}
                {levelSelectNode}
                <button
                    onClick={() => onSelectChange("lang-1")}
                    data-testid="select-lang-btn"
                >
                    Select Language
                </button>
                <button
                    disabled={isSubmitting || !isValid}
                    onClick={onSubmit}
                    data-testid="modal-submit"
                >
                    Submit
                </button>
                <button onClick={onClose} data-testid="modal-close">
                    Close
                </button>
            </div>
        ) : null,
}))

type HookReturnType = ReturnType<typeof useAddLanguage>

describe("AddLanguageModal", () => {
    const mockOnClose = vi.fn()
    const mockOnAdd = vi.fn()
    const mockSetSelectedLanguageId = vi.fn()
    const mockSetProficiency = vi.fn()
    const mockHandleClose = vi.fn()
    const mockHandleSubmit = vi.fn()

    const availableLanguages = [{ id: "1", name: "English" }]
    const existingLanguages: Array<{ name: string }> = []

    const defaultHookValues: HookReturnType = {
        selectedLanguageId: "",
        setSelectedLanguageId: mockSetSelectedLanguageId,
        proficiency: "",
        setProficiency: mockSetProficiency,
        error: null,
        isSubmitting: false,
        availableOptions: [{ id: "1", name: "English" }],
        handleClose: mockHandleClose,
        handleSubmit: mockHandleSubmit,
        isValid: true,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useAddLanguage).mockReturnValue(defaultHookValues)
    })

    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it("does not render when isOpen is false", () => {
        render(
            <AddLanguageModal
                isOpen={false}
                onClose={mockOnClose}
                onAdd={mockOnAdd}
                availableLanguages={availableLanguages}
                existingLanguages={existingLanguages}
            />,
        )

        expect(screen.queryByTestId("add-item-modal")).not.toBeInTheDocument()
    })

    it("renders correctly when isOpen is true", () => {
        render(
            <AddLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                onAdd={mockOnAdd}
                availableLanguages={availableLanguages}
                existingLanguages={existingLanguages}
            />,
        )

        expect(screen.getByTestId("add-item-modal")).toBeInTheDocument()
        expect(screen.getByText("title")).toBeInTheDocument()
        expect(screen.getByTestId("proficiency-select")).toBeInTheDocument()
    })

    it("handles language selection and proficiency changes", () => {
        render(
            <AddLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                onAdd={mockOnAdd}
                availableLanguages={availableLanguages}
                existingLanguages={existingLanguages}
            />,
        )

        fireEvent.click(screen.getByTestId("select-lang-btn"))
        expect(mockSetSelectedLanguageId).toHaveBeenCalledWith("lang-1")

        fireEvent.click(screen.getByTestId("change-proficiency-btn"))
        expect(mockSetProficiency).toHaveBeenCalledWith("INTERMEDIATE")
    })

    it("displays error message when provided", () => {
        vi.mocked(useAddLanguage).mockReturnValue({
            ...defaultHookValues,
            error: "Failed to add language",
        })

        render(
            <AddLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                onAdd={mockOnAdd}
                availableLanguages={availableLanguages}
                existingLanguages={existingLanguages}
            />,
        )

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Failed to add language",
        )
    })

    it("triggers handleSubmit when submit button is clicked and form is valid", () => {
        render(
            <AddLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                onAdd={mockOnAdd}
                availableLanguages={availableLanguages}
                existingLanguages={existingLanguages}
            />,
        )

        const submitButton = screen.getByTestId("modal-submit")
        expect(submitButton).not.toBeDisabled()

        fireEvent.click(submitButton)
        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })

    it("triggers handleClose when close action is triggered", () => {
        render(
            <AddLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                onAdd={mockOnAdd}
                availableLanguages={availableLanguages}
                existingLanguages={existingLanguages}
            />,
        )

        fireEvent.click(screen.getByTestId("modal-close"))
        expect(mockHandleClose).toHaveBeenCalledTimes(1)
    })
})
