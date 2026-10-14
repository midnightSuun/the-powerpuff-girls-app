import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useEditLanguageAdminModal } from "@/modules/languages/hooks/use-edit-language-admin-modal"

import { EditLanguageModal } from "../ui/components/admin/edit-language-admin-modal"

vi.mock("@/modules/languages/hooks/use-edit-language-admin-modal", () => ({
    useEditLanguageAdminModal: vi.fn(),
}))

vi.mock("@/components/ui/base-modal", () => ({
    BaseModal: ({
        isOpen,
        title,
        children,
        onSubmit,
        error,
        isPending,
        isValid,
    }: {
        isOpen: boolean
        title: string
        children: React.ReactNode
        onSubmit: () => void
        error?: string | null
        isPending?: boolean
        isValid?: boolean
    }) =>
        isOpen ? (
            <div data-testid="base-modal">
                <h2>{title}</h2>
                {error && <div data-testid="modal-error">{error}</div>}
                {children}
                <button
                    disabled={isPending || !isValid}
                    onClick={onSubmit}
                    data-testid="modal-submit"
                >
                    Submit
                </button>
            </div>
        ) : null,
}))

describe("EditLanguageModal", () => {
    const mockOnClose = vi.fn()
    const mockOnUpdate = vi.fn()
    const mockSetName = vi.fn()
    const mockSetIso2 = vi.fn()
    const mockSetNativeName = vi.fn()
    const mockHandleSubmit = vi.fn()

    const sampleLanguage = {
        id: "1",
        name: "English",
        iso2: "en",
        nativeName: "English",
    }

    const defaultHookValues = {
        name: "English",
        setName: mockSetName,
        iso2: "EN",
        setIso2: mockSetIso2,
        nativeName: "English Native",
        setNativeName: mockSetNativeName,
        error: null as string | null,
        isSubmitting: false,
        isValid: true,
        handleSubmit: mockHandleSubmit,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useEditLanguageAdminModal).mockReturnValue(defaultHookValues)
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
                language={sampleLanguage}
                onUpdate={mockOnUpdate}
            />,
        )

        expect(screen.queryByTestId("base-modal")).not.toBeInTheDocument()
    })

    it("renders correctly with fields populated when isOpen is true", () => {
        const { container } = render(
            <EditLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                language={sampleLanguage}
                onUpdate={mockOnUpdate}
            />,
        )

        const modal = container.querySelector('[data-testid="base-modal"]')
        expect(modal).toBeInTheDocument()

        const inputs = container.querySelectorAll("input")
        const nameInput = Array.from(inputs).find(
            (input) => input.value === "English",
        )
        const isoInput = Array.from(inputs).find(
            (input) => input.value === "EN",
        )
        const nativeInput = Array.from(inputs).find(
            (input) => input.value === "English Native",
        )

        expect(nameInput).toBeInTheDocument()
        expect(isoInput).toBeInTheDocument()
        expect(nativeInput).toBeInTheDocument()
    })

    it("handles input changes correctly", () => {
        const { container } = render(
            <EditLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                language={sampleLanguage}
                onUpdate={mockOnUpdate}
            />,
        )

        const inputs = container.querySelectorAll("input")
        const nameInput = Array.from(inputs).find(
            (input) => input.value === "English",
        ) as HTMLInputElement
        const isoInput = Array.from(inputs).find(
            (input) => input.value === "EN",
        ) as HTMLInputElement

        fireEvent.change(nameInput, { target: { value: "British English" } })
        expect(mockSetName).toHaveBeenCalledWith("British English")

        fireEvent.change(isoInput, { target: { value: "gb" } })
        expect(mockSetIso2).toHaveBeenCalledWith("GB")
    })

    it("displays error message when provided", () => {
        vi.mocked(useEditLanguageAdminModal).mockReturnValue({
            ...defaultHookValues,
            error: "Failed to update language",
        })

        render(
            <EditLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                language={sampleLanguage}
                onUpdate={mockOnUpdate}
            />,
        )

        expect(screen.getByTestId("modal-error")).toHaveTextContent(
            "Failed to update language",
        )
    })

    it("triggers handleSubmit when submit button is clicked and form is valid", () => {
        const { container } = render(
            <EditLanguageModal
                isOpen={true}
                onClose={mockOnClose}
                language={sampleLanguage}
                onUpdate={mockOnUpdate}
            />,
        )

        const submitButton = container.querySelector(
            '[data-testid="modal-submit"]',
        ) as HTMLButtonElement
        expect(submitButton).not.toBeDisabled()

        fireEvent.click(submitButton)
        expect(mockHandleSubmit).toHaveBeenCalledTimes(1)
    })
})
