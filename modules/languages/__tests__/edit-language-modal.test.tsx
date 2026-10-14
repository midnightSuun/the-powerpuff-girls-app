import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Proficiency } from "@/gql/generated/graphql"
import { useEditLanguageModal } from "@/modules/languages/hooks/use-edit-language-modal"

import { EditLanguageModal } from "../ui/components/user/edit-language-modal"

vi.mock("@/modules/languages/hooks/use-edit-language-modal", () => ({
    useEditLanguageModal: vi.fn(),
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
                    onClick={() => onValueChange("ADVANCED")}
                    data-testid="change-proficiency-btn"
                >
                    Set Advanced
                </button>
            </div>
        ),
    }),
)

vi.mock("@/components/ui/edit-item-modal", () => ({
    EditItemModal: ({
        isOpen,
        title,
        itemNameValue,
        error,
        isSubmitting,
        onSubmit,
        onClose,
        levelSelectNode,
    }: {
        isOpen: boolean
        title: string
        itemNameValue: string
        error?: string | null
        isSubmitting?: boolean
        onSubmit: () => void
        onClose: () => void
        levelSelectNode?: React.ReactNode
    }) =>
        isOpen ? (
            <div data-testid="edit-item-modal">
                <h2>{title}</h2>
                <div data-testid="item-name">{itemNameValue}</div>
                {error && <div data-testid="modal-error">{error}</div>}
                {levelSelectNode}
                <button
                    disabled={isSubmitting}
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

type HookReturnType = ReturnType<typeof useEditLanguageModal>

describe("EditLanguageModal", () => {
    const mockOnClose = vi.fn()
    const mockOnSave = vi.fn()
    const mockSetProficiency = vi.fn()
    const mockHandleSubmit = vi.fn()

    const defaultHookValues: HookReturnType = {
        proficiency: "INTERMEDIATE" as Proficiency,
        setProficiency: mockSetProficiency,
        error: null,
        isSubmitting: false,
        handleSubmit: mockHandleSubmit,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useEditLanguageModal).mockReturnValue(defaultHookValues)
    })

    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it("does not render when isOpen is false", () => {
        render(
            <EditLanguageModal
                isOpen={false}
                onClose={mockOnClose}
                languageName="English"
                currentProficiency={"INTERMEDIATE" as Proficiency}
                onSave={mockOnSave}
            />,
        )

        expect(screen.queryByTestId("edit-item-modal")).not.toBeInTheDocument()
    })

    it("renders correctly with language name and proficiency selector when isOpen is true", () => {
        render(
            <EditLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                languageName="English"
                currentProficiency={"INTERMEDIATE" as Proficiency}
                onSave={mockOnSave}
            />,
        )

        expect(screen.getAllByTestId("edit-item-modal")[0]).toBeInTheDocument()
        expect(screen.getByText("title")).toBeInTheDocument()
        expect(screen.getAllByTestId("item-name")[0]).toHaveTextContent(
            "English",
        )
        expect(
            screen.getAllByTestId("proficiency-select")[0],
        ).toBeInTheDocument()
        expect(screen.getByText("INTERMEDIATE")).toBeInTheDocument()
    })

    it("handles proficiency changes correctly", () => {
        render(
            <EditLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                languageName="English"
                currentProficiency={"INTERMEDIATE" as Proficiency}
                onSave={mockOnSave}
            />,
        )

        const changeButton = screen.getAllByTestId("change-proficiency-btn")[0]
        fireEvent.click(changeButton)

        expect(mockSetProficiency).toHaveBeenCalledWith("ADVANCED")
    })

    it("displays error message when provided", () => {
        vi.mocked(useEditLanguageModal).mockReturnValue({
            ...defaultHookValues,
            error: "Failed to update language",
        })

        render(
            <EditLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                languageName="English"
                currentProficiency={"INTERMEDIATE" as Proficiency}
                onSave={mockOnSave}
            />,
        )

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Failed to update language",
        )
    })

    it("triggers handleSubmit when submit button is clicked", () => {
        render(
            <EditLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                languageName="English"
                currentProficiency={"INTERMEDIATE" as Proficiency}
                onSave={mockOnSave}
            />,
        )

        const submitButton = screen.getAllByTestId("modal-submit")[0]
        expect(submitButton).not.toBeDisabled()

        fireEvent.click(submitButton)
        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })

    it("triggers onClose when close button is clicked", () => {
        render(
            <EditLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                languageName="English"
                currentProficiency={"INTERMEDIATE" as Proficiency}
                onSave={mockOnSave}
            />,
        )

        const closeButton = screen.getAllByTestId("modal-close")[0]
        fireEvent.click(closeButton)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
})
